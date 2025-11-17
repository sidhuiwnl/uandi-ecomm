const couponModel = require("../models/couponModel")

const couponController = {
    getAvailableCouponsController: async (req, res) => {
        try {
            const { user_id, source_collection_id } = req.body;

            const coupons = await couponModel.getAvailableCoupons({
                user_id,
                collection_id: source_collection_id
            });

            return res.json({ success: true, coupons });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },


    validateCoupon: async (req, res) => {
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: 'Method not allowed' });
        }

        try {
            const {
                coupon_code,
                cart_items,
                subtotal,
                user_id,
                source_collection_id // Optional: for collection-specific validation
            } = req.body;

            // Validate required fields
            if (!coupon_code || !cart_items || subtotal === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: coupon_code, cart_items, subtotal'
                });
            }

            // 1. Validate coupon exists and is active
            const coupon = await couponModel.getCouponByCode(coupon_code);
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid coupon code'
                });
            }

            // 2. Check coupon validity
            const validationResult = await couponModel.validateCoupon({
                coupon,
                cart_items,
                subtotal,
                user_id,
                source_collection_id
            });

            if (!validationResult.valid) {
                return res.status(400).json({
                    success: false,
                    message: validationResult.message
                });
            }

            // 3. Calculate discount amount
            const discountResult = await couponModel.calculateDiscount({
                coupon,
                cart_items,
                subtotal
            });

            res.status(200).json({
                success: true,
                coupon: {
                    coupon_id: coupon.coupon_id,
                    coupon_code: coupon.coupon_code,
                    coupon_type: coupon.coupon_type,
                    discount_type: coupon.discount_type,
                    discount_value: coupon.discount_value,
                    max_discount_amount: coupon.max_discount_amount
                },
                discount: discountResult.discount_amount,
                final_total: discountResult.final_total,
                message: `Coupon applied successfully! ${discountResult.message}`
            });

        } catch (error) {
            console.error('Coupon validation error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to validate coupon'
            });
        }
    }
}

module.exports = couponController;