const wishlistModel = require('../models/wishlistModel');

const wishlistController = {
    // Get user's wishlist
    getWishlist: async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }
            const items = await wishlistModel.getWishlistByUserId(userId);
            res.json({ success: true, items });
        } catch (error) {
            console.error('Get wishlist error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
        }
    },

    // Add item to wishlist
    addToWishlist: async (req, res) => {
        try {
            const { user_id, product_id, variant_id } = req.body;

            if (!user_id || !product_id || !variant_id) {
                return res.status(400).json({ success: false, message: 'User ID, Product ID and Variant ID are required' });
            }

            const item = await wishlistModel.addToWishlist({
                user_id,
                product_id,
                variant_id
            });

            res.json({ success: true, item });
        } catch (error) {
            console.error('Add to wishlist error:', error);
            res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
        }
    },

    // Remove item from wishlist
    removeFromWishlist: async (req, res) => {
        try {
            const { user_id, product_id, variant_id } = req.body;

            if (!user_id || !product_id || !variant_id) {
                return res.status(400).json({ success: false, message: 'User ID, Product ID and Variant ID are required' });
            }

            const success = await wishlistModel.removeFromWishlist({
                user_id,
                product_id,
                variant_id
            });

            res.json({ success, message: success ? 'Removed from wishlist' : 'Item not found' });
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
        }
    },

    // Clear wishlist
    clearWishlist: async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }
            const count = await wishlistModel.clearWishlist(userId);
            res.json({ success: true, message: `Removed ${count} items`, count });
        } catch (error) {
            console.error('Clear wishlist error:', error);
            res.status(500).json({ success: false, message: 'Failed to clear wishlist' });
        }
    },

    // Merge guest wishlist with user wishlist after login
    mergeWishlist: async (req, res) => {
        try {
            const { user_id, guestItems } = req.body;

            if (!user_id) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }

            if (!Array.isArray(guestItems)) {
                return res.status(400).json({ success: false, message: 'Invalid guest items' });
            }

            const merged = await wishlistModel.mergeWishlistItems(user_id, guestItems);
            const allItems = await wishlistModel.getWishlistByUserId(user_id);

            res.json({ success: true, items: allItems, merged: merged.length });
        } catch (error) {
            console.error('Merge wishlist error:', error);
            res.status(500).json({ success: false, message: 'Failed to merge wishlist' });
        }
    }
};

module.exports = wishlistController;
