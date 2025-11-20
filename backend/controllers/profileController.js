const User = require('../models/profileModel');
// const env = require('../config/env');
const Busboy = require('busboy');
const sharp = require('sharp');
const r2 = require("../config/r2");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { PassThrough } = require('stream');
const crypto = require('crypto');



const profileController = {

  getProfile: async (req, res) => {
    try {
      const user = await User.findByRefreshToken(req.cookies.refreshToken);
      console.log("Fetched user profile:", user);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateProfile: async (req, res) => {
  try {
    const user = await User.findByRefreshToken(req.cookies.refreshToken);
    console.log("request body:", req.body);

    // --------------------------------------------------------------
    // 1. Allowed fields (date_of_birth is now a plain string)
    // --------------------------------------------------------------
    const allowed = ['first_name', 'last_name', 'phone_number', 'date_of_birth'];
    const filtered = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        // keep empty strings → NULL in DB, otherwise keep the value
        filtered[key] = req.body[key] === '' ? null : req.body[key];
      }
    }

    // --------------------------------------------------------------
    // 2. OPTIONAL: basic validation for date_of_birth
    // --------------------------------------------------------------
    if (filtered.date_of_birth !== null) {
      const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoRegex.test(filtered.date_of_birth)) {
        return res
          .status(400)
          .json({ message: 'date_of_birth must be in YYYY‑MM‑DD format' });
      }
    }

    const updated = await User.updateUser(user.user_id, filtered);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
},

  uploadPhotoStream: async (req, res) => {
  try {
    const bb = Busboy({
      headers: req.headers,
      limits: { fileSize: 4 * 1024 * 1024 } // 4MB
    });

    const user = await User.findByRefreshToken(req.cookies.refreshToken);
    let uploadPromise = null;
    let fileHandled = false;

    bb.on('file', async (fieldname, fileStream, info) => {
      const filenameOrig = info.filename || 'file';
      const mimetype = info.mimeType || 'application/octet-stream';

      if (!mimetype.startsWith('image/')) {
        fileStream.resume();
        return;
      }

      fileHandled = true;

      // Transform with sharp
      const transformer = sharp()
        .rotate()
        .resize(512, 512, { fit: 'cover' })
        .webp({ quality: 80 });

      // Count bytes
      let contentLength = 0;
      const countingStream = new PassThrough();
      countingStream.on('data', (chunk) => {
        contentLength += chunk.length;
      });

      // Final upload stream
      const uploadStream = new PassThrough();

      // Pipe: file → sharp → counting → upload
      fileStream.pipe(transformer).pipe(countingStream).pipe(uploadStream);

      const filename = `user-${user.user_id}-${crypto.randomUUID()}.webp`;

      // Wait for stream to finish to get contentLength
      await new Promise((resolve, reject) => {
        countingStream.on('end', resolve);
        countingStream.on('error', reject);
        fileStream.on('error', reject);
      });

      // Now we know contentLength → safe to upload
      const putCommand = new PutObjectCommand({
        Bucket: process.env.CF_BUCKET_NAME,
        Key: filename,
        Body: uploadStream,
        ContentType: 'image/webp',
        ContentLength: contentLength, // REQUIRED
        CacheControl: 'public, max-age=31536000'
      });

      uploadPromise = r2.send(putCommand)
        .then(async () => {
          const finalUrl = `https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/${filename}`;
          const updatedUser = await User.updatePhoto(user.user_id, finalUrl);
          return { finalUrl, updatedUser };
        })
        .catch(err => {
          throw err;
        });
    });

    bb.on('field', () => {});
    bb.on('error', (err) => console.error('Busboy error', err));

    bb.on('finish', async () => {
      if (!fileHandled) {
        return res.status(400).json({ message: 'No valid image uploaded' });
      }
      try {
        const result = await uploadPromise;
        console.log('Upload successful:', result);
        res.json({
          message: 'Uploaded successfully',
          profile_picture_url: result.finalUrl,
          user: result.updatedUser
        });
      } catch (err) {
        console.error('Upload failed:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
      }
    });

    req.pipe(bb);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
};

module.exports = profileController;