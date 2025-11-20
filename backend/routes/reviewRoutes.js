const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
// const auth = require('../middleware/auth');

router.post('/', reviewController.createReview); // create review (multipart form-data)
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
