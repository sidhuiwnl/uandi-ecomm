const pool = require('../config/database');


const cartModel = {
    getCartByUserId: async (userId) => {
        const [rows] = await pool.query(
            `SELECT ci.*, 
              p.product_name, 
              v.variant_name, 
              v.final_price, 
              v.price AS variant_price,
              v.stock,
              ci.variant_image AS main_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       JOIN variants v ON ci.variant_id = v.variant_id
       WHERE ci.user_id = ?`,
            [userId]
        );
        return rows;
    },

    addToCart: async ({ user_id, product_id, variant_id, quantity = 1, price, main_image, source_collection_id: incoming_collection_id = null }) => {

        // Validate required fields
        if (!user_id || !product_id || !variant_id || price === undefined || price === null) {
            throw new Error('Missing required fields: user_id, product_id, variant_id, price');
        }

        // Validate price is a number
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            throw new Error('Invalid price value');
        }

        // 1) Stock validation - WITH ERROR HANDLING
        let availableStock = 0;
        try {
            const [variantStock] = await pool.query(
                'SELECT stock, price as variant_price FROM variants WHERE variant_id = ?',
                [variant_id]
            );

            if (variantStock.length === 0) {
                throw new Error('Variant not found');
            }

            availableStock = variantStock[0].stock;

            // Use variant price if price not provided from frontend
            const finalPrice = numericPrice || parseFloat(variantStock[0].variant_price);
            if (isNaN(finalPrice)) {
                throw new Error('Invalid price from database');
            }

        } catch (error) {
            console.error('Variant lookup error:', error);
            throw new Error('Failed to validate product variant');
        }

        // 2) Determine source_collection_id - FIXED: REMOVE AUTOMATIC LOOKUP
        let source_collection_id = incoming_collection_id; // Use ONLY what's provided

        console.log('🛒 Add to Cart - Collection Context:', {
            product_id,
            incoming_collection_id,
            final_collection_id: source_collection_id
        });

        // 3) Check for existing cart item
        const [existingRows] = await pool.query(
            `SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND variant_id = ? LIMIT 1`,
            [user_id, product_id, variant_id]
        );

        // Stock check with requested quantity
        const requestedQuantity = existingRows.length > 0
            ? existingRows[0].quantity + quantity
            : quantity;

        if (requestedQuantity > availableStock) {
            throw new Error(`Only ${availableStock} items available in stock`);
        }

        // 4) Update existing or insert new
        if (existingRows.length > 0) {
            const cartItem = existingRows[0];
            const newQuantity = cartItem.quantity + quantity;
            const newSubTotal = parseFloat((newQuantity * numericPrice).toFixed(2));

            const [updateResult] = await pool.query(
                `UPDATE cart_items SET quantity = ?, sub_total = ?, price = ?, variant_image = ?, updated_at = CURRENT_TIMESTAMP
             WHERE cart_item_id = ?`,
                [newQuantity, newSubTotal, numericPrice, main_image, cartItem.cart_item_id]
            );

            return { action: 'updated', cart_item_id: cartItem.cart_item_id, affectedRows: updateResult.affectedRows };
        }

        // 5) Insert new cart item
        const sub_total = parseFloat((quantity * numericPrice).toFixed(2));

        const [insertResult] = await pool.query(
            `INSERT INTO cart_items (user_id, product_id, source_collection_id, variant_id, quantity, price, sub_total, variant_image, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [user_id, product_id, source_collection_id, variant_id, quantity, numericPrice, sub_total, main_image]
        );

        return { action: 'inserted', insertId: insertResult.insertId };
    },

    updateCartQuantity: async (cartItemId, quantity) => {
        const [currentItem] = await pool.query(
            'SELECT price FROM cart_items WHERE cart_item_id = ?',
            [cartItemId]
        );

        if (currentItem.length === 0) {
            throw new Error('Cart item not found');
        }

        const newSubTotal = parseFloat((quantity * currentItem[0].price).toFixed(2));

        const [result] = await pool.query(
            'UPDATE cart_items SET quantity = ?, sub_total = ? WHERE cart_item_id = ?',
            [quantity, newSubTotal, cartItemId]
        );
        return result;
    },

    removeCartItem: async (cartItemId, userId) => {
        console.log('🔍 removeCartItem called with:', { cartItemId, userId });

        try {
            // Validate inputs
            if (!cartItemId || !userId) {
                console.log('❌ Missing cartItemId or userId');
                throw new Error('Cart item ID and user ID are required');
            }

            console.log('🔍 Executing DELETE query...');
            const [result] = await pool.query(
                'DELETE FROM cart_items WHERE cart_item_id = ? AND user_id = ?',
                [cartItemId, userId]
            );

            console.log('🔍 DELETE result:', result);

            if (result.affectedRows === 0) {
                console.log('❌ No rows affected - item not found or wrong user');

                // Check if item exists at all
                const [checkItem] = await pool.query(
                    'SELECT * FROM cart_items WHERE cart_item_id = ?',
                    [cartItemId]
                );
                console.log('🔍 Item exists check:', checkItem);

                throw new Error('Cart item not found or access denied');
            }

            console.log('✅ Item removed successfully');
            return {
                success: true,
                message: 'Item removed from cart successfully',
                affectedRows: result.affectedRows
            };

        } catch (error) {
            console.error('❌ Error in removeCartItem:', error.message);
            console.error('❌ Full error:', error);
            throw error;
        }
    },

    clearCart: async (userId) => {
        const [result] = await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        return result;
    },

    getCartItemCount: async (userId) => {
        const [result] = await pool.query(
            'SELECT SUM(quantity) as total_count FROM cart_items WHERE user_id = ?',
            [userId]
        );
        return result[0].total_count || 0;
    }
};

module.exports = cartModel;