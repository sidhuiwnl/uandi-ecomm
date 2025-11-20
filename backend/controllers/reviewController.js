const ReviewModel = require('../models/reviewModel');
const OrderModel = require('../models/orderModel');
const Busboy = require('busboy');
const { uploadStreamToR2 } = require('../utils/uploadToR2');
const crypto = require('crypto');
const sharp = require('sharp');

function randomKey(prefix='r') {
  return prefix + '-' + crypto.randomBytes(12).toString('hex');
}

exports.createReview = async (req, res) => {
  try {
    // Expect form-data (fields + files)
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const uploadedUrls = [];

    // collect async upload promises
    const uploadPromises = [];

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('file', (fieldname, fileStream, fileInfo) => {
      const { filename, mimeType } = fileInfo;

      console.log(`Uploading file [${fieldname}]: filename: ${filename}, mimeType: ${mimeType}`);
      const safeName = filename ? filename.replace(/\s+/g, "_") : "file";

      const key = `reviews/${Date.now()}-${randomKey()}-${safeName}`;

      const transformer = sharp().webp({ quality: 80 });

      const finalStream = fileStream.pipe(transformer);

      console.log("Starting upload to R2 with key:", key);


       const p = uploadStreamToR2(finalStream, key, 'image/webp')
    .then(r => uploadedUrls.push(r.url))
    .catch(err => console.error("upload error:", err));


      uploadPromises.push(p);
    });
    busboy.on('finish', async () => {
      // wait for uploads
      await Promise.all(uploadPromises);

      // required fields
      const product_id = Number(fields.product_id);
      const user_id = Number(fields.user_id);
      const ratings = Number(fields.ratings);

      if (!product_id || !user_id || !ratings) {
        return res.status(400).json({ error: 'product_id, user_id and ratings are required' });
      }

      // determine verified
      // const verified = await OrderModel.userPurchasedProduct(user_id, product_id);

      const verified = false; // disable for now

      const review = {
        product_id,
        user_id,
        ratings,
        review_title: fields.review_title || null,
        review_description: fields.review_description || null,
        images: uploadedUrls,
        verified
      };

      const created = await ReviewModel.create(review);
      const data = await ReviewModel.findById(created.review_id);
      res.status(201).json(data);
    });

    req.pipe(busboy);

  } catch (err) {
    console.error('createReview error', err);
    res.status(500).json({ error: 'internal server error' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const product_id = Number(req.params.productId);
    const { rating, page=1, limit=20 } = req.query;
    const rows = await ReviewModel.findByProduct(product_id, { rating: rating ? Number(rating) : undefined, page, limit });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'internal server error' });
  }
};
