const pool = require('../config/database');

const wishlistModel = {
    getWishlistByUserId: async (userId) => {
        const [rows] = await pool.query(
            `SELECT wi.*, 
              p.product_name, 
              v.variant_name, 
              v.final_price,
              v.mrp_price, 
              v.price AS variant_price,
              v.stock,
              (SELECT image_url FROM product_images WHERE variant_id = wi.variant_id ORDER BY is_main DESC, image_id ASC LIMIT 1) AS main_image
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.product_id
       JOIN variants v ON wi.variant_id = v.variant_id
       WHERE wi.user_id = ?
       ORDER BY wi.created_at DESC`,
            [userId]
        );
        return rows;
    },

    addToWishlist: async ({ user_id, product_id, variant_id }) => {
        if (!user_id || !product_id || !variant_id) {
            throw new Error('Missing required fields: user_id, product_id, variant_id');
        }

        // Check if already in wishlist
        const [existingRows] = await pool.query(
            `SELECT * FROM wishlist_items WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
            [user_id, product_id, variant_id]
        );

        if (existingRows.length > 0) {
            return existingRows[0];
        }

        // Add to wishlist
        const [result] = await pool.query(
            `INSERT INTO wishlist_items (user_id, product_id, variant_id) VALUES (?, ?, ?)`,
            [user_id, product_id, variant_id]
        );

        const [newItem] = await pool.query(
            `SELECT wi.*, 
              p.product_name, 
              v.variant_name, 
              v.final_price,
              v.mrp_price, 
              v.price AS variant_price,
              v.stock,
              (SELECT image_url FROM product_images WHERE variant_id = wi.variant_id ORDER BY is_main DESC, image_id ASC LIMIT 1) AS main_image
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.product_id
       JOIN variants v ON wi.variant_id = v.variant_id
       WHERE wi.wishlist_item_id = ?`,
            [result.insertId]
        );

        return newItem[0];
    },

    removeFromWishlist: async ({ user_id, product_id, variant_id }) => {
        const [result] = await pool.query(
            `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
            [user_id, product_id, variant_id]
        );
        return result.affectedRows > 0;
    },

    clearWishlist: async (userId) => {
        const [result] = await pool.query(
            `DELETE FROM wishlist_items WHERE user_id = ?`,
            [userId]
        );
        return result.affectedRows;
    },

    // Merge guest wishlist items (from localStorage) with user's wishlist after login
    mergeWishlistItems: async (userId, guestItems) => {
        if (!guestItems || guestItems.length === 0) return [];

        const merged = [];
        for (const item of guestItems) {
            try {
                const result = await wishlistModel.addToWishlist({
                    user_id: userId,
                    product_id: item.product_id,
                    variant_id: item.variant_id
                });
                merged.push(result);
            } catch (error) {
                console.error('Error merging wishlist item:', error);
            }
        }
        return merged;
    }
};

module.exports = wishlistModel;
