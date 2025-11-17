const pool = require('../config/database');

const couponModel = {
    // Get coupon by code
    getCouponByCode: async (coupon_code) => {
        const [rows] = await pool.query(
            `SELECT * FROM coupons 
             WHERE coupon_code = ? 
             AND is_active = 1 
             AND start_date <= NOW() 
             AND end_date >= NOW()`,
            [coupon_code]
        );
        return rows[0] || null;
    },

    createCoupon: async () => {

    },

    // Validate coupon against rules
    validateCoupon: async ({ coupon, cart_items, subtotal, user_id, source_collection_id }) => {
        try {
            const now = new Date();
            const startDate = new Date(coupon.start_date);
            const endDate = new Date(coupon.end_date);

            // Convert numeric values to ensure proper comparison
            const numericSubtotal = parseFloat(subtotal) || 0;
            const numericMinOrder = parseFloat(coupon.min_order_amount) || 0;

            console.log('🔍 Coupon Validation Details:', {
                coupon_code: coupon.coupon_code,
                coupon_type: coupon.coupon_type,
                now: now.toISOString(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                subtotal: numericSubtotal,
                minOrderAmount: numericMinOrder,
                user_id: user_id,
                cart_items_count: cart_items?.length
            });

            // 1. Check date validity
            if (now < startDate) {
                return {
                    valid: false,
                    message: `Coupon is not yet active. Valid from ${startDate.toLocaleDateString()}`
                };
            }

            if (now > endDate) {
                return {
                    valid: false,
                    message: `Coupon has expired. Was valid until ${endDate.toLocaleDateString()}`
                };
            }

            // 2. Check if coupon is active
            if (!coupon.is_active) {
                return { valid: false, message: 'Coupon is no longer active' };
            }

            // 3. Check usage limits
            if (coupon.total_usage_limit > 0 && coupon.usage_count >= coupon.total_usage_limit) {
                return { valid: false, message: 'Coupon usage limit has been reached' };
            }

            // 4. Check minimum order amount
            if (numericSubtotal < numericMinOrder) {
                const remaining = numericMinOrder - numericSubtotal;
                return {
                    valid: false,
                    message: `Add ₹${remaining.toFixed(2)} more to your cart to use this coupon`
                };
            }

            // 5. Check per user limit
            if (user_id && coupon.per_user_limit > 0) {
                const userUsage = await couponModel.getUserCouponUsage(user_id, coupon.coupon_id);

                if (userUsage >= coupon.per_user_limit) {
                    return {
                        valid: false,
                        message: `You have already used this coupon ${userUsage} time(s)`
                    };
                }
            }

            // 6. Collection-specific validation
            if (coupon.coupon_type === 'collection') {
                const [collectionCoupons] = await pool.query(
                    `SELECT cc.collection_id, c.collection_name
                 FROM coupon_collections cc
                 JOIN collections c ON cc.collection_id = c.collection_id
                 WHERE cc.coupon_id = ?`,
                    [coupon.coupon_id]
                );

                console.log('🔍 Collection coupons found:', collectionCoupons);

                if (collectionCoupons.length === 0) {
                    return {
                        valid: false,
                        message: 'Coupon not configured for any collection'
                    };
                }

                // Check if any cart item belongs to eligible collections
                const eligibleCollectionIds = collectionCoupons.map(cc => cc.collection_id);
                const eligibleCollectionNames = collectionCoupons.map(cc => cc.collection_name);

                const eligibleItems = cart_items.filter(item =>
                    item.source_collection_id &&
                    eligibleCollectionIds.includes(item.source_collection_id)
                );

                console.log('🔍 Collection validation:', {
                    eligibleCollectionIds,
                    eligibleCollectionNames,
                    cartItems: cart_items.map(item => ({
                        product_id: item.product_id,
                        collection_id: item.source_collection_id,
                        product_name: item.product_name
                    })),
                    eligibleItemsCount: eligibleItems.length
                });

                if (eligibleItems.length === 0) {
                    return {
                        valid: false,
                        message: `This coupon is only valid for products from: ${eligibleCollectionNames.join(', ')}`
                    };
                }

                // Calculate subtotal from eligible items only
                const eligibleSubtotal = eligibleItems.reduce((sum, item) => {
                    const itemPrice = parseFloat(item.price) || 0;
                    const itemQuantity = parseInt(item.quantity) || 0;
                    return sum + (itemPrice * itemQuantity);
                }, 0);

                console.log('🔍 Eligible items subtotal:', eligibleSubtotal);

                // Check if eligible items meet minimum order amount
                if (eligibleSubtotal < numericMinOrder) {
                    const remaining = numericMinOrder - eligibleSubtotal;
                    return {
                        valid: false,
                        message: `Add ₹${remaining.toFixed(2)} more from eligible collections to use this coupon`
                    };
                }
            }

            // 7. User-specific coupon validation
            if (coupon.coupon_type === 'user' && !user_id) {
                return {
                    valid: false,
                    message: 'This coupon requires you to be logged in'
                };
            }

            // 8. Sales coupon validation (add any specific sales logic here)
            if (coupon.coupon_type === 'sales') {
                // Add any sales-specific validation logic
                // For example, check if products are on sale, etc.
                console.log('🔍 Sales coupon validation passed');
            }

            console.log('✅ Coupon validation passed successfully');
            return {
                valid: true,
                message: 'Coupon is valid and applied successfully'
            };

        } catch (error) {
            console.error('❌ Error in validateCoupon:', error);
            return {
                valid: false,
                message: 'An error occurred while validating the coupon'
            };
        }
    },


    calculateDiscount: async ({ coupon, cart_items, subtotal }) => {
        let discountAmount = 0;
        let message = '';

        // Convert values to numbers to ensure they're numeric
        const numericSubtotal = parseFloat(subtotal) || 0;
        const numericDiscountValue = parseFloat(coupon.discount_value) || 0;
        const numericMaxDiscount = coupon.max_discount_amount ?
            parseFloat(coupon.max_discount_amount) : null;

        console.log('🔍 Discount calculation inputs:', {
            subtotal: numericSubtotal,
            discountValue: numericDiscountValue,
            maxDiscount: numericMaxDiscount,
            discountType: coupon.discount_type
        });

        if (coupon.discount_type === 'percentage') {
            // Calculate percentage discount
            discountAmount = (numericSubtotal * numericDiscountValue) / 100;

            console.log('🔍 Percentage discount before cap:', discountAmount);

            // Apply max discount cap if exists
            if (numericMaxDiscount && discountAmount > numericMaxDiscount) {
                discountAmount = numericMaxDiscount;
                message = `Discount capped at ₹${numericMaxDiscount}`;
            } else {
                message = `${numericDiscountValue}% discount applied`;
            }
        } else if (coupon.discount_type === 'flat') {
            // Flat discount - ensure it doesn't exceed subtotal
            discountAmount = Math.min(numericDiscountValue, numericSubtotal);
            message = `Flat ₹${numericDiscountValue} discount applied`;
        }

        // For collection-specific coupons, calculate based on eligible items only
        if (coupon.coupon_type === 'collection') {
            const [collectionCoupons] = await pool.query(
                `SELECT cc.collection_id 
             FROM coupon_collections cc
             WHERE cc.coupon_id = ?`,
                [coupon.coupon_id]
            );

            const eligibleCollectionIds = collectionCoupons.map(cc => cc.collection_id);

            // Calculate subtotal only from eligible collection items
            const eligibleSubtotal = cart_items
                .filter(item => item.source_collection_id &&
                    eligibleCollectionIds.includes(item.source_collection_id))
                .reduce((sum, item) => {
                    const itemPrice = parseFloat(item.price) || 0;
                    const itemQuantity = parseInt(item.quantity) || 0;
                    return sum + (itemPrice * itemQuantity);
                }, 0);

            console.log('🔍 Collection-specific calculation:', {
                eligibleCollectionIds,
                eligibleSubtotal,
                cartItems: cart_items.map(item => ({
                    product_id: item.product_id,
                    collection_id: item.source_collection_id,
                    price: item.price,
                    quantity: item.quantity
                }))
            });

            if (coupon.discount_type === 'percentage') {
                discountAmount = (eligibleSubtotal * numericDiscountValue) / 100;

                if (numericMaxDiscount && discountAmount > numericMaxDiscount) {
                    discountAmount = numericMaxDiscount;
                }

                message = `${numericDiscountValue}% discount applied on eligible collection items`;
            } else {
                discountAmount = Math.min(numericDiscountValue, eligibleSubtotal);
                message = `Flat ₹${numericDiscountValue} discount applied on eligible collection items`;
            }
        }

        // Ensure discountAmount is a valid number
        discountAmount = parseFloat(discountAmount) || 0;
        const finalTotal = Math.max(0, numericSubtotal - discountAmount);

        console.log('🔍 Final discount calculation:', {
            discountAmount,
            finalTotal,
            message
        });

        return {
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            final_total: parseFloat(finalTotal.toFixed(2)),
            message
        };
    },

    // Get user's coupon usage count
    getUserCouponUsage: async (user_id, coupon_id) => {
        const [rows] = await pool.query(
            `SELECT COUNT(*) as usage_count FROM orders 
             WHERE user_id = ? AND coupon_id = ?`,
            [user_id, coupon_id]
        );
        return rows[0].usage_count;
    },

    getAvailableCoupons: async ({ user_id, collection_id }) => {
        let finalCoupons = [];

        // 1) Sales coupons (global)
        const [salesCoupons] = await pool.query(`
        SELECT * FROM coupons 
        WHERE coupon_type = 'sales'
        AND is_active = 1 
        AND start_date <= NOW()
        AND end_date >= NOW()
    `);
        finalCoupons.push(...salesCoupons);

        // 2) User-specific coupons
        if (user_id) {
            const [userCoupons] = await pool.query(`
            SELECT * FROM coupons 
            WHERE coupon_type = 'user'
            AND is_active = 1 
            AND start_date <= NOW()
            AND end_date >= NOW()
            AND coupon_id IN (
                SELECT coupon_id FROM user_coupons WHERE user_id = ?
            )
        `, [user_id]);

            finalCoupons.push(...userCoupons);
        }

        // 3) Collection-based coupons
        if (collection_id) {
            const [collectionCoupons] = await pool.query(`
            SELECT c.*
            FROM coupons c
            JOIN coupon_collections cc ON cc.coupon_id = c.coupon_id
            WHERE cc.collection_id = ?
            AND c.is_active = 1
            AND c.start_date <= NOW()
            AND c.end_date >= NOW()
        `, [collection_id]);

            finalCoupons.push(...collectionCoupons);
        }

        // Remove duplicates
        const unique = [];
        const used = new Set();

        for (let c of finalCoupons) {
            if (!used.has(c.coupon_id)) {
                used.add(c.coupon_id);
                unique.push(c);
            }
        }

        return unique;
    },
};

module.exports = couponModel;