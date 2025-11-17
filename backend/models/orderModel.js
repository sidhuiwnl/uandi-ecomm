const pool = require('../config/database');

const orderModel = {
    // Create order with order items in transaction
    createOrderWithItems: async (orderData, orderItems) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Generate order number
            const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

            // 2. Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (
                    order_number, user_id, address_id, total_amount, 
                    payment_method, payment_status, order_status,
                    coupon_id, coupon_code, coupon_type, coupon_discount,
                    source_collection_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderNumber,
                    orderData.user_id,
                    orderData.address_id,
                    orderData.total_amount,
                    orderData.payment_method || 'UPI',
                    orderData.payment_status || 'Pending',
                    orderData.order_status || 'Processing',
                    orderData.coupon_id,
                    orderData.coupon_code,
                    orderData.coupon_type,
                    orderData.coupon_discount || 0,
                    orderData.source_collection_id
                ]
            );

            const orderId = orderResult.insertId;

            // 3. Create order items
            const orderItemPromises = orderItems.map(item =>
                connection.query(
                    `INSERT INTO order_items (
                        order_id, product_id, variant_id, quantity,
                        price, sub_total, source_collection_id, coupon_discount
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.product_id,
                        item.variant_id,
                        item.quantity,
                        item.price,
                        item.sub_total,
                        item.source_collection_id,
                        item.coupon_discount || 0
                    ]
                )
            );

            await Promise.all(orderItemPromises);

            // 4. Clear user's cart after successful order
            await connection.query(
                'DELETE FROM cart_items WHERE user_id = ?',
                [orderData.user_id]
            );

            await connection.commit();

            // 5. Get created order with items
            const [orderRows] = await connection.query(
                `SELECT * FROM orders WHERE order_id = ?`,
                [orderId]
            );

            const [itemRows] = await connection.query(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [orderId]
            );

            return {
                order: orderRows[0],
                order_items: itemRows
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error in createOrderWithItems:', error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // Get order by ID with items
    getOrderById: async (orderId) => {
        try {
            const [orderRows] = await pool.query(
                `SELECT o.*, a.* 
                 FROM orders o
                 LEFT JOIN addresses a ON o.address_id = a.address_id
                 WHERE o.order_id = ?`,
                [orderId]
            );

            const [itemRows] = await pool.query(
                `SELECT oi.*, p.product_name, p.main_image, v.variant_name
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.product_id
                 LEFT JOIN variants v ON oi.variant_id = v.variant_id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            return {
                order: orderRows[0],
                items: itemRows
            };
        } catch (error) {
            console.error('Error getting order:', error);
            throw error;
        }
    },

    getUserOrders: async (userId) => {
        try {
            // Get orders with address details
            const [orders] = await pool.query(
                `SELECT
                     o.*,
                     a.full_name,
                     a.phone_number,
                     a.address_line_1,
                     a.address_line_2,
                     a.city,
                     a.state,
                     a.postal_code,
                     a.country
                 FROM orders o
                          LEFT JOIN addresses a ON o.address_id = a.address_id
                 WHERE o.user_id = ?
                 ORDER BY o.created_at DESC`,
                [userId]
            );

            // Get order items for each order
            const ordersWithItems = await Promise.all(
                orders.map(async (order) => {
                    const [items] = await pool.query(
                        `SELECT 
                        oi.*,
                        p.product_name,
                        v.variant_name
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.product_id
                     LEFT JOIN variants v ON oi.variant_id = v.variant_id
                     WHERE oi.order_id = ?`,
                        [order.order_id]
                    );

                    return {
                        ...order,
                        items: items || []
                    };
                })
            );

            return ordersWithItems;

        } catch (error) {
            console.error('Error in getUserOrders:', error);
            throw error;
        }
    },
};

module.exports = orderModel;