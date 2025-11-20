const couponModel = require("../models/couponModel")
const pool = require("../config/database")

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

    getCoupons : async (req, res) => {
      try {
          const coupons = await couponModel.getCoupon();

          return res.json({ success: true, coupons });

      }catch (err) {
          return res.status(500).json({
              success: false,
              message: err.message
          });
      }
    },

    createCoupon: async (req, res) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const data = req.body;

            // Required fields
            const required = [
                "coupon_code",
                "coupon_type",
                "discount_type",
                "discount_value",
                "min_order_amount",
                "start_date",
                "end_date",
                "per_user_limit"
            ];

            for (let field of required) {
                if (!data[field]) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} is required`
                    });
                }
            }

            // If percentage -> max discount is required
            if (data.discount_type === "percentage" && !data.max_discount_amount) {
                return res.status(400).json({
                    success: false,
                    message: "max_discount_amount is required for percentage discounts"
                });
            }

            // For collection coupons, collection_ids are required
            if (data.coupon_type === "collection" && (!data.collection_ids || data.collection_ids.length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: "At least one collection is required for collection-type coupons"
                });
            }

            // Check duplicate coupon_code
            const existing = await couponModel.getCouponByCode(data.coupon_code);
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon code already exists"
                });
            }

            // Create coupon
            const result = await couponModel.createCoupon(data);

            const couponId = result.insertId;

            // If it's a collection coupon, create mappings in coupon_collections table
            if (data.coupon_type === "collection" && data.collection_ids && data.collection_ids.length > 0) {
                await couponModel.mapCouponToCollections(couponId, data.collection_ids);
            }

            await connection.commit();

            return res.status(201).json({
                success: true,
                message: "Coupon created successfully",
                coupon_id: couponId
            });

        } catch (error) {
            await connection.rollback();
            console.error("❌ Error creating coupon:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        } finally {
            connection.release();
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