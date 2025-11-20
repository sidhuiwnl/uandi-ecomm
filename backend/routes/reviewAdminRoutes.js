const express = require('express');
const router = express.Router();
const reviewAdminController = require('../controllers/reviewAdminController');
// const auth = require('../middleware/auth');
// const adminAuth = require('../middleware/adminAuth');

router.get('/reviews', reviewAdminController.listReviews);
router.put('/reviews/:id', reviewAdminController.updateReview);
router.delete('/reviews/:id', reviewAdminController.deleteReview);

module.exports = router;
