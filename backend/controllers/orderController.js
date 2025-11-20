const orderModel = require('../models/orderModel');

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { order, order_items } = req.body;

            console.log('🛒 Creating order:', { order, order_items });

            if (!order || !order_items || order_items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Order data and items are required'
                });
            }

            // Create order and order items
            const result = await orderModel.createOrderWithItems(order, order_items);

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order: result.order,
                order_items: result.order_items
            });

        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create order'
            });
        }
    },

    getUserOrders: async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User id is required'
                })
            }
            const result = await orderModel.getUserOrders(userId);

            res.status(201).json({
                success: true,
                message: 'User id is retrieved',
                orders : result,
            })
        }catch(error) {
            console.error('Error retrieving order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieving order'
            });
        }
    }


};

module.exports = orderController;