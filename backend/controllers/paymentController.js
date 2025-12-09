const crypto = require('crypto');
const razorpayClient = require('../config/razorpay');
const orderModel = require('../models/orderModel');
const shippingController = require('./shippingController');
const { sendOrderEmails } = require('../utils/mailer');

const paymentController = {
	createRazorpayOrder: async (req, res) => {
		try {
			const { amount, currency = 'INR', receipt, notes = {} } = req.body;

			if (!amount || Number(amount) <= 0) {
				return res.status(400).json({
					success: false,
					message: 'A valid amount is required to create a payment order.'
				});
			}

			if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
				return res.status(500).json({
					success: false,
					message: 'Payment gateway is not configured. Please try again later.'
				});
			}

			const order = await razorpayClient.orders.create({
				amount: Math.round(Number(amount) * 100),
				currency,
				receipt: receipt || `receipt_${Date.now()}`,
				notes
			});

			return res.status(200).json({
				success: true,
				order,
				key: process.env.RAZORPAY_KEY_ID
			});
		} catch (error) {
			console.error('Error creating Razorpay order:', error);
			return res.status(500).json({
				success: false,
				message: error?.message || 'Failed to initialize payment. Please try again.'
			});
		}
	},

	verifyPaymentAndCreateOrder: async (req, res) => {
		try {
			const {
				razorpay_order_id,
				razorpay_payment_id,
				razorpay_signature,
				orderData,
				orderItems
			} = req.body;

			if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
				return res.status(400).json({
					success: false,
					message: 'Incomplete payment details received.'
				});
			}

			if (!orderData || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
				return res.status(400).json({
					success: false,
					message: 'Order details are required to complete payment.'
				});
			}

			if (!process.env.RAZORPAY_KEY_SECRET) {
				return res.status(500).json({
					success: false,
					message: 'Payment gateway is not configured. Please try again later.'
				});
			}

			const generatedSignature = crypto
				.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
				.update(`${razorpay_order_id}|${razorpay_payment_id}`)
				.digest('hex');

			if (generatedSignature !== razorpay_signature) {
				return res.status(400).json({
					success: false,
					message: 'Payment verification failed. Signature mismatch.'
				});
			}

			const paymentConfirmedOrder = {
				...orderData,
				payment_method: 'Razorpay',
				payment_status: 'Paid'
			};

			const result = await orderModel.createOrderWithItems(paymentConfirmedOrder, orderItems);
			console.log('[paymentController] ✅ Payment verified, order created with ID:', result?.order?.order_number);

			try {
				const fullOrder = await orderModel.getOrderById(result.order.order_id);
				const orderDetails = fullOrder.order;
				const createdItems = fullOrder.items || [];

				if (orderDetails) {
					const nameParts = (orderDetails.full_name || '').trim().split(' ').filter(Boolean);
					const firstName = nameParts[0] || orderDetails.full_name || 'Customer';
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
						order_items: createdItems.map(item => ({
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
						weight: createdItems.reduce((total, item) => total + (parseFloat(item.weight) || 0.5) * item.quantity, 0) || 0.5
					};

					await shippingController.createShiprocketOrder(payload);
				}
			} catch (shiprocketError) {
				console.error('Shiprocket integration failed after payment:', shiprocketError.message);
			}

			// Send formatted emails (admin + customer)
			try {
				console.log('[paymentController] ✉ Preparing to send order confirmation emails');
				const fullOrderForEmail = await orderModel.getOrderById(result.order.order_id);
				const orderDetails = fullOrderForEmail.order;
				const emailItems = fullOrderForEmail.items || [];

				// Compute summary totals
				const totals = emailItems.reduce((acc, it) => {
					const mrp = it.mrp_price != null ? Number(it.mrp_price) : null;
					const price = Number(it.price || 0);
					const qty = Number(it.quantity || 1);
					if (mrp) acc.totalMrp += mrp * qty;
					acc.totalPrice += price * qty;
					return acc;
				}, { totalMrp: 0, totalPrice: 0 });
				const discountOnMrp = Math.max(0, totals.totalMrp - totals.totalPrice);
				const deliveryCharge = Number(orderDetails.shipping_amount || 0);
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

				console.log('[paymentController] ▶ Calling sendOrderEmails with order:', orderDetails?.order_number);
				await sendOrderEmails({ order: orderDetails, customer, address, items: emailItems, summary });
				console.log('[paymentController] ✅ Order confirmation emails sent');
			} catch (mailErr) {
				console.warn('[paymentController] ❌ Email sending failed:', mailErr?.message || mailErr);
			}

			return res.status(201).json({
				success: true,
				message: 'Payment verified and order created successfully.',
				order: result.order,
				order_items: result.order_items
			});
		} catch (error) {
			console.error('Error verifying payment:', error);
			return res.status(500).json({
				success: false,
				message: error?.message || 'Failed to verify payment. Please contact support.'
			});
		}
	}
};

module.exports = paymentController;
