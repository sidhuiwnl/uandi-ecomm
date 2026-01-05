const orderModel = require('../models/orderModel');
const shippingController = require('./shippingController');
const { sendOrderEmails } = require('../utils/mailer');

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { order, order_items } = req.body;
            console.log('[orderController] 🛒 Received order creation request');
            console.log('[orderController] body.order:', JSON.stringify(order));
            console.log('[orderController] body.order_items.length:', Array.isArray(order_items) ? order_items.length : 0);

            console.log('[orderController] 🛒 Creating order...');

            if (!order || !order_items || order_items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Order data and items are required'
                });
            }
            order.checkout_source =
                order.checkout_source === 'routine' ? 'routine' : 'cart';


            // Create order and order items
            const result = await orderModel.createOrderWithItems(order, order_items);
            console.log('[orderController] ✅ createOrderWithItems result.order:', JSON.stringify(result?.order));
            console.log('[orderController] ✅ createOrderWithItems result.order_items length:', Array.isArray(result?.order_items) ? result.order_items.length : 0);

            // Integrate Shiprocket
            try {
                console.log('[orderController] ▶ Fetching order by ID for Shiprocket:', result?.order?.order_id);
                const fullOrder = await orderModel.getOrderById(result.order.order_id);
                const orderDetails = fullOrder.order;
                const orderItems = fullOrder.items;
                console.log('[orderController] ✅ Shiprocket fetch: items length:', Array.isArray(orderItems) ? orderItems.length : 0);

                // Split name
                const nameParts = (orderDetails.full_name || '').trim().split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ');

                const payload = {
                    order_id: orderDetails.order_number,
                    order_date: new Date(orderDetails.created_at).toISOString().slice(0, 16).replace('T', ' '),
                    pickup_location: "Home",
                    shipping_is_billing: true,
                    billing_customer_name: firstName,
                    billing_last_name: lastName,
                    billing_address: orderDetails.address_line_1,
                    billing_address_2: orderDetails.address_line_2 || "",
                    billing_city: orderDetails.city,
                    billing_pincode: orderDetails.postal_code,
                    billing_state: orderDetails.state,
                    billing_country: orderDetails.country || "India",
                    billing_email: orderDetails.email,
                    billing_phone: orderDetails.phone_number,
                    order_items: orderItems.map(item => ({
                        name: item.product_name,
                        sku: item.sku || "SKU",
                        units: item.quantity,
                        selling_price: parseFloat(item.price),
                        tax: 0
                    })),
                    payment_method: orderDetails.payment_method === 'COD' ? 'COD' : 'Prepaid',
                    sub_total: parseFloat(orderDetails.total_amount),
                    length: 10,
                    breadth: 10,
                    height: 10,
                    weight: orderItems.reduce((total, item) => total + (parseFloat(item.weight) || 0.5) * item.quantity, 0)
                };

                console.log('[orderController] Sending to Shiprocket payload:', JSON.stringify(payload));
                await shippingController.createShiprocketOrder(payload);
                console.log('[orderController] ✅ Shiprocket integration completed');

            } catch (srError) {
                console.error('[orderController] ❌ Shiprocket integration failed:', srError?.message || srError);
                // Continue without failing the order
            }

            // Send formatted emails (admin + customer)
            try {
                console.log('[orderController] ✉ Preparing to send order confirmation emails');
                console.log('[orderController] ▶ Fetching order by ID for email:', result?.order?.order_id);
                const fullOrder = await orderModel.getOrderById(result.order.order_id);
                const orderDetails = fullOrder.order;
                const orderItems = fullOrder.items;
                console.log('[orderController] ✅ Email fetch: items length:', Array.isArray(orderItems) ? orderItems.length : 0);
                console.log('[orderController] ✅ Email orderDetails:', JSON.stringify({
                    order_id: orderDetails?.order_id,
                    order_number: orderDetails?.order_number,
                    email: orderDetails?.email,
                    phone_number: orderDetails?.phone_number,
                }));

                // Compute summary
                const totals = orderItems.reduce((acc, it) => {
                    const mrp = it.mrp_price != null ? Number(it.mrp_price) : null;
                    const price = Number(it.price || 0);
                    const qty = Number(it.quantity || 1);
                    if (mrp) acc.totalMrp += mrp * qty;
                    acc.totalPrice += price * qty;
                    return acc;
                }, { totalMrp: 0, totalPrice: 0 });
                const discountOnMrp = Math.max(0, totals.totalMrp - totals.totalPrice);
                const deliveryCharge = Number(orderDetails.delivery_charge || 0);
                const summary = {
                    totalMrp: totals.totalMrp,
                    discountOnMrp,
                    deliveryCharge,
                    totalPrice: totals.totalPrice + deliveryCharge,
                };

                const customer = {
                    name: orderDetails.full_name,
                    email: orderDetails.email,
                    mobile: orderDetails.phone_number,
                };
                const address = {
                    address_line1: orderDetails.address_line_1,
                    address_line2: orderDetails.address_line_2,
                    city: orderDetails.city,
                    state: orderDetails.state,
                    pincode: orderDetails.postal_code,
                };

                console.log('[orderController] ▶ Calling sendOrderEmails with summary:', JSON.stringify(summary));
                await sendOrderEmails({ order: orderDetails, customer, address, items: orderItems, summary });
                console.log('[orderController] ✅ sendOrderEmails completed');
            } catch (mailErr) {
                console.warn('[orderController] ❌ Email sending skipped/failed:', mailErr?.message || mailErr);
            }

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order: result.order,
                order_items: result.order_items
            });

        } catch (error) {
            console.error('[orderController] ❌ Error creating order:', error?.message || error);
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
    },

    getAllOrders: async (req, res) => {
        try {
            const orders = await orderModel.getAllOrders();
            res.status(200).json({
                success: true,
                orders
            });
        } catch (error) {
            console.error('Error fetching all orders:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch orders'
            });
        }
    },

    getOrder: async (req, res) => {
        try {
            const { orderNumber } = req.params;
            const result = await orderModel.getOrderByOrderNumber(orderNumber);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.status(200).json({
                success: true,
                order: result.order,
                items: result.items
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch order details'
            });
        }
    }

};

module.exports = orderController;