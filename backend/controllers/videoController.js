const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { uploadStreamToR2, deleteFromR2 } = require('../utils/uploadToR2');
const Video = require('../models/Video');
const pool = require('../config/database');

// helper: ensure product exists
async function productExists(product_id) {
  const [rows] = await pool.execute('SELECT product_id FROM products WHERE product_id = ? LIMIT 1', [product_id]);
  return rows.length > 0;
}

// compress file using ffmpeg (temp-file based)
function compressVideo(inputPath, outputPath, { crf = '28', preset = 'veryfast' } = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y', // overwrite
      '-i', inputPath,
      '-vcodec', 'libx264',
      '-crf', crf,
      '-preset', preset,
      '-acodec', 'aac',
      '-movflags', '+faststart',
      outputPath,
    ];

    const ff = spawn('ffmpeg', args);

    let stderr = '';
    ff.stderr.on('data', (d) => { stderr += d.toString(); });

    const timeout = setTimeout(() => {
      ff.kill('SIGKILL');
      reject(new Error('FFmpeg timeout'));
    }, 5 * 60 * 1000); // 5 minutes

    ff.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) return resolve();
      const err = new Error('FFmpeg failed: ' + stderr.slice(-2000));
      return reject(err);
    });
  });
}

// extract thumbnail (single frame) and return path
function extractThumbnail(inputPath, outPath) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-y', '-i', inputPath, '-ss', '00:00:01.000', '-vframes', '1', outPath]);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('Thumbnail failed'))));
  });
}

// get duration in seconds
function getDurationSeconds(inputPath) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', inputPath]);
    let out = '';
    ff.stdout.on('data', (d) => (out += d.toString()));
    ff.on('close', (code) => {
      if (code !== 0) return resolve(null);
      const v = parseFloat(out);
      resolve(Number.isFinite(v) ? Math.round(v) : null);
    });
  });
}

exports.uploadReel = async (req, res) => {
  const busboy = Busboy({ headers: req.headers, highWaterMark: 2 * 1024 * 1024 });

  let product_id = null;
  let title = null;
  let tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  let originalFilePath = null;
  let filename = null;
  let mimeType = null;
  let sizeBytes = 0;

  let receivedFile = false;

  // validations
  busboy.on('field', (fieldname, val) => {
    if (fieldname === 'product_id') product_id = val;
    if (fieldname === 'title') title = val;
  });

  busboy.on('file', (fieldname, file, info) => {
    receivedFile = true;
    const safeName = info.filename.replace(/\s+/g, "_");
    filename = Date.now() + '-' + safeName;
    mimeType = info.mimeType;

    // Basic type check
    if (!/^video\//.test(mimeType)) {
      file.resume(); // discard
      return;
    }

    originalFilePath = path.join(tmpDir, filename);
    const ws = fs.createWriteStream(originalFilePath);

    file.on('data', (chunk) => { sizeBytes += chunk.length; });

    file.pipe(ws);
  });

  busboy.on('finish', async () => {
    try {
      if (!receivedFile) return res.status(400).json({ error: 'No video file uploaded' });
      if (!product_id) return res.status(400).json({ error: 'product_id is required' });

      if (!await productExists(product_id)) return res.status(400).json({ error: 'product not found' });

      // file size check (e.g., 200MB max) — tune as per your needs
      const MAX_BYTES = (process.env.MAX_VIDEO_MB ? Number(process.env.MAX_VIDEO_MB) : 200) * 1024 * 1024;
      if (sizeBytes > MAX_BYTES) {
        fs.unlinkSync(originalFilePath);
        return res.status(400).json({ error: 'File too large' });
      }

      // compress
      const compressedPath = path.join(tmpDir, `compressed-${filename}`);
      await compressVideo(originalFilePath, compressedPath);

      // duration
      const duration_seconds = await getDurationSeconds(compressedPath).catch(()=>null);

      // upload to R2
      const r2Key = `reels/${Date.now()}-${filename}`;
      const readStream = fs.createReadStream(compressedPath);
      const uploaded = await uploadStreamToR2(readStream, r2Key, mimeType || 'video/mp4');

// console.log({
//   product_id,
//   title,
//   duration_seconds,
//   uploaded
// });

      // save DB
      const created = await Video.create({ product_id, reel_url: uploaded.url, title, duration_seconds });

      // cleanup local files
      try { fs.unlinkSync(originalFilePath); } catch(e){}
      try { fs.unlinkSync(compressedPath); } catch(e){}

      return res.status(201).json({ message: 'Uploaded', video_id: created.video_id, reel_url: uploaded.url });
    } catch (err) {
      console.error('uploadReel err', err);
      // attempt cleanup
      try { if (originalFilePath) fs.unlinkSync(originalFilePath); } catch(e){}
      return res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  req.pipe(busboy);
};

exports.replaceVideo = async (req, res) => {
  const videoId = req.params.id;
  const existing = await Video.findById(videoId);
  if (!existing) return res.status(404).json({ error: 'Video not found' });

  const busboy = Busboy({ headers: req.headers });
  let filePath = null;
  let filename = null;
  let mimeType = null;
  const tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  busboy.on('file', (field, file, info) => {

    const safeName = info.filename.replace(/\s+/g, "_");
    filename = Date.now() + '-' + safeName;
    mimeType = info.mimeType || 'video/mp4';
    filePath = path.join(tmpDir, filename);
    const ws = fs.createWriteStream(filePath);
    file.pipe(ws);
  });

  busboy.on('finish', async () => {
    try {
      if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

      // compress new file
      const compressed = path.join(tmpDir, `compressed-${filename}`);
      await compressVideo(filePath, compressed);

      // get duration
      const duration_seconds = await getDurationSeconds(compressed).catch(() => null);

      // delete old video from R2 (best-effort)
      try {
        if (existing.reel_url) {
          const parsed = new URL(existing.reel_url);
          const oldKey = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
          console.log('Deleting old R2 key:', oldKey);
          await deleteFromR2(oldKey).catch(() => {});
        }
      } catch (e) {
        // ignore URL parse errors, still continue
        console.warn('old R2 delete failed', e);
      }

      // upload new compressed video to R2
      const newKey = `reels/${Date.now()}-${filename}`;
      const uploaded = await uploadStreamToR2(fs.createReadStream(compressed), newKey, mimeType);

      // update DB with new url & duration
      await pool.execute(
        `UPDATE shoppable_videos
         SET reel_url = ?, duration_seconds = ?, updated_at = CURRENT_TIMESTAMP
         WHERE video_id = ?`,
        [uploaded.url, duration_seconds, videoId]
      );

      // cleanup temp files
      try { fs.unlinkSync(filePath); } catch (e) {}
      try { fs.unlinkSync(compressed); } catch (e) {}

      return res.json({ message: 'Video replaced', reel_url: uploaded.url });
    } catch (err) {
      console.error('replaceVideo error', err);
      try { if (filePath) fs.unlinkSync(filePath); } catch (e) {}
      return res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  req.pipe(busboy);
};

exports.getAll = async (req, res) => {
  try {
    const rows = await Video.findAllWithProduct();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const rows = await Video.findByProductId(req.params.id);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// update title OR optionally replace video file (multipart)
exports.update = async (req, res) => {
  // For simplicity we support JSON title updates and a separate endpoint to replace file
  try {
    const { title } = req.body;
    const { id } = req.params;
    await Video.update(id, { title });
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// soft delete (does not remove from R2). We also expose a hard-delete endpoint that will remove the R2 object.
exports.softDelete = async (req, res) => {
  try {
    await Video.softDelete(req.params.id);
    res.json({ message: 'Removed (soft)'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// hard delete + remove R2 object
exports.hardDelete = async (req, res) => {
  try {
    const id = req.params.id;
    const row = await Video.findById(id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    // extract key from URL (assuming default R2 base)
    const url = row.reel_url;
    let key = null;
    try {
      const parsed = new URL(url);
      key = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    } catch(e) {
      // fallback: try simple split
      key = url.split('/').slice(-2).join('/');
    }

    if (key) {
      await deleteFromR2(key).catch(e=>console.warn('r2 delete failed',e));
    }

    await Video.hardDelete(id);
    res.json({ message: 'Hard deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};