const pool = require('../config/database');

const orderModel = {
    // Create order with order items in transaction
    createOrderWithItems: async (orderData, orderItems) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Generate order number
            const orderNumber = 'UNI-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

            // 2. Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (
                    order_number, user_id, address_id, total_amount, 
                    payment_method, payment_status, order_status,
                    coupon_id, coupon_code, coupon_type, coupon_discount,
                    source_collection_id, shipping_amount,checkout_source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                    orderData.source_collection_id,
                    orderData.shipping_amount,
                    orderData.checkout_source || 'cart'
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
            if (orderData.checkout_source === 'cart') {
                await connection.query(
                    'DELETE FROM cart_items WHERE user_id = ?',
                    [orderData.user_id]
                );
            }

            await connection.commit();

            // 5. Get created order with items
            const [orderRows] = await connection.query(
                `SELECT * FROM orders WHERE order_id = ?`,
                [orderId]
            );

            const [itemRows] = await connection.query(
                `SELECT 
                    oi.*, 
                    p.product_name,
                    v.variant_name, v.sku, v.weight, v.mrp_price AS mrp_price,
                    (SELECT image_url FROM product_images 
                      WHERE variant_id = oi.variant_id 
                      ORDER BY is_main DESC, image_id ASC LIMIT 1) AS main_image
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.product_id
                 LEFT JOIN variants v ON oi.variant_id = v.variant_id
                 WHERE oi.order_id = ?`,
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
                `SELECT o.*, a.*, u.email, u.first_name as user_first_name, u.last_name as user_last_name
                 FROM orders o
                 LEFT JOIN addresses a ON o.address_id = a.address_id
                 LEFT JOIN users u ON o.user_id = u.user_id
                 WHERE o.order_id = ?`,
                [orderId]
            );

            const [itemRows] = await pool.query(
                `SELECT oi.*, p.product_name, 
                (SELECT image_url FROM product_images WHERE variant_id = oi.variant_id ORDER BY is_main DESC, image_id ASC LIMIT 1) as main_image,
                v.variant_name, v.sku, v.weight, v.mrp_price AS mrp_price
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

    // Get order by Order Number with items
    getOrderByOrderNumber: async (orderNumber) => {
        try {
            const [orderRows] = await pool.query(
                `SELECT o.*, a.*, u.email, u.first_name as user_first_name, u.last_name as user_last_name
                 FROM orders o
                 LEFT JOIN addresses a ON o.address_id = a.address_id
                 LEFT JOIN users u ON o.user_id = u.user_id
                 WHERE o.order_number = ?`,
                [orderNumber]
            );

            if (orderRows.length === 0) return null;

            const orderId = orderRows[0].order_id;

            const [itemRows] = await pool.query(
                `SELECT oi.*, p.product_name, 
                (SELECT image_url FROM product_images WHERE variant_id = oi.variant_id ORDER BY is_main DESC, image_id ASC LIMIT 1) as main_image,
                v.variant_name, v.sku, v.weight, v.mrp_price AS mrp_price
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
            console.error('Error getting order by number:', error);
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
                        v.variant_name,
                        v.mrp_price AS mrp_price,
                        (SELECT image_url FROM product_images WHERE variant_id = oi.variant_id ORDER BY is_main DESC, image_id ASC LIMIT 1) as main_image
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

    getAllOrders: async () => {
        try {
            const [orders] = await pool.query(
                `SELECT
                     o.*,
                     u.first_name,
                     u.last_name,
                     u.email,
                     a.full_name as shipping_name,
                     a.phone_number,
                     a.address_line_1,
                     a.city,
                     a.state,
                     a.postal_code
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.user_id
                 LEFT JOIN addresses a ON o.address_id = a.address_id
                 ORDER BY o.created_at DESC`
            );

            // Get items count for each order to avoid N+1 query for full items if not needed for list view
            // Or just fetch items count if that's enough for the table
            
            const ordersWithItemsCount = await Promise.all(
                orders.map(async (order) => {
                    const [countResult] = await pool.query(
                        `SELECT COUNT(*) as count FROM order_items WHERE order_id = ?`,
                        [order.order_id]
                    );
                    return {
                        ...order,
                        items_count: countResult[0].count
                    };
                })
            );

            return ordersWithItemsCount;
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            throw error;
        }
    },

    saveShiprocketResponse: async (data) => {
        const query = `
            INSERT INTO shiprocket_order_responses 
            (order_id, shiprocket_order_id, channel_order_id, shipment_id, status, status_code,
             onboarding_completed_now, awb_code, courier_company_id, courier_name, new_channel, packaging_box_error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.order_id,
            data.shiprocket_order_id,
            data.channel_order_id,
            data.shipment_id,
            data.status,
            data.status_code,
            data.onboarding_completed_now,
            data.awb_code,
            data.courier_company_id,
            data.courier_name,
            data.new_channel,
            data.packaging_box_error
        ];

        return pool.query(query, params);
    }
    };

module.exports = orderModel;