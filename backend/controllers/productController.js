// backend/controllers/productController.js


const productModel = require('../models/productModel');
const pool = require('../config/database');

const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const sharp = require('sharp');
const { spawn } = require('child_process');
const { uploadStreamToR2, deleteFromR2 } = require('../utils/uploadToR2');


// Reusable video compression (exact same as your reels)
function compressVideo(inputPath, outputPath, { crf = '28', preset = 'veryfast' } = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y', '-i', inputPath,
      '-vcodec', 'libx264',
      '-crf', crf,
      '-preset', preset,
      '-acodec', 'aac',
      '-movflags', '+faststart',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      outputPath
    ];

    const ff = spawn('ffmpeg', args);
    let stderr = '';
    ff.stderr.on('data', d => stderr += d.toString());

    const timeout = setTimeout(() => {
      ff.kill('SIGKILL');
      reject(new Error('FFmpeg timeout after 8 minutes'));
    }, 8 * 60 * 1000);

    ff.on('close', code => {
      clearTimeout(timeout);
      if (code === 0) return resolve();
      reject(new Error('FFmpeg failed: ' + stderr.slice(-1000)));
    });
  });
}

const replaceSingleVideo = async (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  const tempFiles = [];

  const tmpDir = path.join(os.tmpdir(), 'product-media');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let videoOriginalPath = null;
  let videoSizeBytes = 0;
  let videoId = null;
  let oldUrl = null;
  let variantId = null;
  let productId = null;
  let videoWriteComplete = false;

  // Handle form fields
  busboy.on('field', (fieldname, value) => {
    console.log(`Received field: ${fieldname} = ${value}`);
    if (fieldname === 'video_id') videoId = value;
    if (fieldname === 'old_url') oldUrl = value;
    if (fieldname === 'variant_id') variantId = value;
    if (fieldname === 'product_id') productId = value;
  });

  // Handle file upload
  busboy.on('file', (fieldname, file, info) => {
    console.log(`Received file: ${fieldname}`, info);
    const { filename, mimeType } = info;
    
    if (fieldname !== 'video' || !filename) {
      console.log('Skipping file - wrong field or no filename');
      return file.resume();
    }

    if (!mimeType.startsWith('video/')) {
      console.log('Skipping file - not a video');
      return file.resume();
    }

    const safeName = filename.replace(/\s+/g, '_');
    videoOriginalPath = path.join(tmpDir, `orig-${Date.now()}-${safeName}`);
    tempFiles.push(videoOriginalPath);

    console.log('Writing video to temp file...');
    const ws = fs.createWriteStream(videoOriginalPath);
    
    file.on('data', chunk => videoSizeBytes += chunk.length);
    file.pipe(ws);

    ws.on('finish', () => {
      videoWriteComplete = true;
      console.log('Video write complete, size:', videoSizeBytes);
    });

    ws.on('error', (err) => {
      console.error('Write stream error:', err);
      videoWriteComplete = true;
    });
  });

  busboy.on('finish', async () => {
    console.log('Busboy finished, waiting for video write...');
    
    // Wait for video write to complete (max 30 seconds for large files)
    let waitCount = 0;
    while (!videoWriteComplete && waitCount < 300) {
      await new Promise(r => setTimeout(r, 100));
      waitCount++;
    }

    console.log('Video write complete. Status:', {
      videoId,
      oldUrl: oldUrl ? 'present' : 'missing',
      videoOriginalPath: videoOriginalPath ? 'present' : 'missing',
      videoSize: videoSizeBytes
    });

    try {
      // Validate inputs
      if (!videoId || !oldUrl || !videoOriginalPath) {
        const missing = [];
        if (!videoId) missing.push('video_id');
        if (!oldUrl) missing.push('old_url');
        if (!videoOriginalPath) missing.push('video file');
        
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      // Check file size (200MB limit)
      if (videoSizeBytes > 200 * 1024 * 1024) {
        throw new Error('Video too large. Maximum 200MB allowed.');
      }

      if (videoSizeBytes === 0) {
        throw new Error('Video file is empty');
      }

      // 1. Compress video
      const compressedPath = path.join(tmpDir, `comp-${Date.now()}-${randomKey()}.mp4`);
      tempFiles.push(compressedPath);

      console.log('Compressing replacement video...');
      await compressVideo(videoOriginalPath, compressedPath);

      // 2. Upload to R2
      const r2Key = `products/videos/${Date.now()}-${randomKey()}.mp4`;
      console.log('Uploading compressed video to R2...');
      const uploaded = await uploadStreamToR2(
        fs.createReadStream(compressedPath),
        r2Key,
        'video/mp4'
      );

      // 3. Delete old file from R2
      const oldR2Key = oldUrl.split('.r2.dev/')[1];
      if (oldR2Key) {
        try {
          await deleteFromR2(decodeURIComponent(oldR2Key));
          console.log(`Deleted old video from R2: ${oldR2Key}`);
        } catch (err) {
          console.error('R2 deletion error:', err);
          // Continue even if R2 deletion fails
        }
      }

      // 4. UPDATE database row with new URL
      await pool.query(
        'UPDATE product_images SET image_url = ? WHERE image_id = ?',
        [uploaded.url, videoId]
      );

      console.log(`Updated video_id ${videoId} with new URL: ${uploaded.url}`);

      res.json({
        success: true,
        message: 'Video replaced successfully',
        data: {
          video_id: videoId,
          new_url: uploaded.url
        }
      });

    } catch (err) {
      console.error('replaceSingleVideo error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to replace video'
      });
    } finally {
      // Cleanup temp files
      tempFiles.forEach(file => {
        try { 
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log('Deleted temp file:', file);
          }
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
      });
    }
  });

  busboy.on('error', (err) => {
    console.error('Busboy error:', err);
    res.status(500).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  });

  req.pipe(busboy);
};

const replaceSingleImage = async (req, res) => {
  const busboy = Busboy({ headers: req.headers });

  let imageFile = null;
  let imageId = null;
  let oldUrl = null;
  let variantId = null;
  let productId = null;
  let uploadComplete = false;

  // Handle form fields
  busboy.on('field', (fieldname, value) => {
    console.log(`Received field: ${fieldname} = ${value}`);
    if (fieldname === 'image_id') imageId = value;
    if (fieldname === 'old_url') oldUrl = value;
    if (fieldname === 'variant_id') variantId = value;
    if (fieldname === 'product_id') productId = value;
  });

  // Handle file upload
  busboy.on('file', (fieldname, file, info) => {
    console.log(`Received file: ${fieldname}`, info);
    const { filename, mimeType } = info;
    
    if (fieldname !== 'image' || !filename) {
      console.log('Skipping file - wrong field or no filename');
      return file.resume();
    }

    if (!mimeType.startsWith('image/')) {
      console.log('Skipping file - not an image');
      return file.resume();
    }

    const safeName = filename.replace(/\s+/g, '_');
    const key = `products/images/${Date.now()}-${randomKey()}-${path.basename(safeName, path.extname(safeName))}.webp`;

    console.log('Starting image upload to R2...');
    const uploadStream = file.pipe(sharp().webp({ quality: 80 }));

    uploadStreamToR2(uploadStream, key, 'image/webp')
      .then(result => {
        imageFile = result;
        uploadComplete = true;
        console.log('Image uploaded successfully:', result.url);
      })
      .catch(err => {
        console.error('Image upload failed:', err);
        uploadComplete = true; // Mark as complete even on error
      });
  });

  busboy.on('finish', async () => {
    console.log('Busboy finished, waiting for upload...');
    
    // Wait for file upload to complete (max 10 seconds)
    let waitCount = 0;
    while (!uploadComplete && waitCount < 100) {
      await new Promise(r => setTimeout(r, 100));
      waitCount++;
    }

    console.log('Upload wait complete. Status:', {
      imageId,
      oldUrl: oldUrl ? 'present' : 'missing',
      imageFile: imageFile ? 'present' : 'missing'
    });

    try {
      // Validate inputs
      if (!imageId || !oldUrl || !imageFile) {
        const missing = [];
        if (!imageId) missing.push('image_id');
        if (!oldUrl) missing.push('old_url');
        if (!imageFile) missing.push('image file');
        
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      // 1. Delete old file from R2
      const r2Key = oldUrl.split('.r2.dev/')[1];
      if (r2Key) {
        try {
          await deleteFromR2(decodeURIComponent(r2Key));
          console.log(`Deleted old file from R2: ${r2Key}`);
        } catch (err) {
          console.error('R2 deletion error:', err);
          // Continue even if R2 deletion fails
        }
      }

      // 2. UPDATE database row with new URL
      await pool.query(
        'UPDATE product_images SET image_url = ? WHERE image_id = ?',
        [imageFile.url, imageId]
      );

      console.log(`Updated image_id ${imageId} with new URL: ${imageFile.url}`);

      res.json({
        success: true,
        message: 'Image replaced successfully',
        data: {
          image_id: imageId,
          new_url: imageFile.url
        }
      });

    } catch (err) {
      console.error('replaceSingleImage error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to replace image'
      });
    }
  });

  busboy.on('error', (err) => {
    console.error('Busboy error:', err);
    res.status(500).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  });

  req.pipe(busboy);
};



// Update deleteProductImage to also delete from R2


function randomKey() {
  return crypto.randomBytes(12).toString('hex');
}

// NEW: Upload up to 4 images + 1 compressed video per variant (preserve order and wait for all)
const uploadProductMedia = async (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  const result = { images: [], video: null };
  const tempFiles = [];

  const tmpDir = path.join(os.tmpdir(), 'product-media');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let videoOriginalPath = null;
  let videoMimeType = null;
  let videoSizeBytes = 0;
  // Track image upload promises keyed by index to maintain order
  const imagePromises = [];
  const imageResults = {}; // { [index]: url }
  let imagesStarted = 0;

  busboy.on('file', (fieldname, file, info) => {
    const { filename, mimeType } = info;
    if (!filename) return file.resume();

    const safeName = filename.replace(/\s+/g, '_');

    // === IMAGES (max 4) ===
    if (fieldname.startsWith('images')) {
      // Parse index from field name like images[0]
      const match = fieldname.match(/images\[(\d+)\]/);
      const idx = match ? parseInt(match[1], 10) : imagesStarted;

      if (idx > 3 || imagesStarted >= 4) {
        // Enforce max 4 images
        return file.resume();
      }
      imagesStarted += 1;

      const key = `products/images/${Date.now()}-${randomKey()}-${path.basename(safeName, path.extname(safeName))}.webp`;

      const uploadStream = file.pipe(
        sharp().webp({ quality: 80 })
      );

      const p = uploadStreamToR2(uploadStream, key, 'image/webp')
        .then(r => { imageResults[idx] = r.url; })
        .catch(err => { console.error('Image upload failed:', err); imageResults[idx] = undefined; });

      imagePromises.push(p);
    }

    // === VIDEO (only 1) ===
    else if (fieldname === 'video') {
      if (result.video || videoOriginalPath) return file.resume();
      if (!mimeType.startsWith('video/')) return file.resume();

      videoMimeType = mimeType;
      const ext = path.extname(safeName) || '.mp4';
      videoOriginalPath = path.join(tmpDir, `orig-${Date.now()}-${safeName}`);
      tempFiles.push(videoOriginalPath);

      const ws = fs.createWriteStream(videoOriginalPath);
      file.on('data', chunk => videoSizeBytes += chunk.length);
      file.pipe(ws);
    } else {
      file.resume();
    }
  });

  busboy.on('finish', async () => {
    try {
      // Wait for all image uploads to complete
      if (imagePromises.length > 0) {
        await Promise.allSettled(imagePromises);
        // Build ordered images array (0..3) filtering out gaps/failed uploads
        const maxIndex = Math.max(-1, ...Object.keys(imageResults).map(k => parseInt(k, 10)));
        const ordered = [];
        for (let i = 0; i <= Math.min(maxIndex, 3); i++) {
          if (imageResults[i]) ordered.push(imageResults[i]);
        }
        result.images = ordered;
      }

      // === Compress & Upload Video (Same as Reels) ===
      if (videoOriginalPath) {
        if (videoSizeBytes > 200 * 1024 * 1024) {
          throw new Error('Video too large. Maximum 200MB allowed.');
        }

        const compressedPath = path.join(tmpDir, `comp-${Date.now()}-${randomKey()}.mp4`);
        tempFiles.push(compressedPath);

        console.log('Compressing product variant video...');
        await compressVideo(videoOriginalPath, compressedPath);

        const r2Key = `products/videos/${Date.now()}-${randomKey()}.mp4`;
        const uploaded = await uploadStreamToR2(
          fs.createReadStream(compressedPath),
          r2Key,
          'video/mp4'
        );

        result.video = uploaded.url;
      }

      res.json({
        success: true,
        message: 'Media uploaded successfully',
        data: result
      });
      
    } catch (err) {
      console.error('uploadProductMedia error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to upload media'
      });
    } finally {
      // Always cleanup temp files
      tempFiles.forEach(file => {
        try { fs.unlinkSync(file); } catch (e) {}
      });
    }
  });

  req.pipe(busboy);
};


const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const rows = await productModel.getAllProducts();

      const productsMap = new Map();

      rows.forEach(row => {
        // Create product if not already in map
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            product_id: row.product_id,
            product_name: row.product_name,
            description: row.description,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            category: {
              category_id: row.category_id,
              category_name: row.category_name
            },
            main_image: row.image_url || null, // keep as is
            variants: []
          });
        }

        const product = productsMap.get(row.product_id);

        // Handle variants
        if (row.variant_id) {
          let variant = product.variants.find(v => v.variant_id === row.variant_id);
          if (!variant) {
            variant = {
              variant_id: row.variant_id,
              variant_name: row.variant_name,
              sku: row.sku,
              mrp_price: row.mrp_price,
              price: row.price,
              gst_percentage: row.gst_percentage,
              gst_included: row.gst_included,
              gst_amount: row.gst_amount,
              final_price: row.final_price,
              stock: row.stock,
              weight: row.weight,
              unit: row.unit,
              images: [] // ✅ initialize images array
            };
            product.variants.push(variant);
          }

          // Handle variant images
          if (row.image_id && row.image_variant_id === row.variant_id) {
            const imageExists = variant.images.some(img => img.image_id === row.image_id);
            if (!imageExists) {
              variant.images.push({
                image_id: row.image_id,
                image_url: row.image_url,
                is_main: row.is_main
              });
            }
          }
        }
      });

      const products = Array.from(productsMap.values());
      res.json({ success: true, data: products });
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const product = await productModel.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {
      const result = await productModel.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product_id: result.insertId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      await productModel.updateProduct(req.params.id, req.body);
      res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      await productModel.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Variant operations
  createVariant: async (req, res) => {
    try {
      const result = await productModel.createVariant(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Variant created successfully',
        data: { variant_id: result.insertId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateVariant: async (req, res) => {
    try {
      await productModel.updateVariant(req.params.id, req.body);
      res.json({ success: true, message: 'Variant updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { stock } = req.body;
      await productModel.updateStock(req.params.id, stock);
      res.json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteVariant: async (req, res) => {
    try {
      await productModel.deleteVariant(req.params.id);
      res.json({ success: true, message: 'Variant deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },



  // Image operations
  addProductImage: async (req, res) => {
    try {
      const result = await productModel.addProductImage(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Image added successfully',
        data: { image_id: result.insertId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateProductImage: async (req, res) => {
  try {
    const { image_url, is_main } = req.body;
    const [result] = await db.query(
      'UPDATE product_images SET image_url = ?, is_main = ? WHERE image_id = ?',
      [image_url, is_main, req.params.id]
    );
    res.json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
},

  
  getAllTags: async (req, res) => {
    try {
      const tags = await productModel.getAllTags();

      if (!tags || tags.length === 0) {
        return res.status(404).json({ success: false, message: 'No tags found' });
      }

      res.json({ success: true, data: tags });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  uploadProductMedia,
 replaceSingleImage,
 replaceSingleVideo,
};

module.exports = productController;