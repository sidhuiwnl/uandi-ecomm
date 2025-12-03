const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Get user's wishlist
router.get('/:userId', wishlistController.getWishlist);

// Add item to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove item from wishlist
router.post('/remove', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear/:userId', wishlistController.clearWishlist);

// Merge guest wishlist with user wishlist after login
router.post('/merge', wishlistController.mergeWishlist);

module.exports = router;
