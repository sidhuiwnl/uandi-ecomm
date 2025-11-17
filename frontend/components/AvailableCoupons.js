// components/Checkout/AvailableCoupons.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Calendar, Clock, Percent, Users, ShoppingBag, Zap, CheckCircle2 } from "lucide-react";
import { getAvailableCoupons, validateCoupon } from "@/store/couponSlics";

const CouponCard = ({ coupon, onApply, isApplied }) => {
    const getStatus = (c) => {
        const now = new Date();
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);

        if (now < start) return { label: "Upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" };
        if (now > end) return { label: "Expired", color: "bg-red-100 text-red-800 border-red-200" };
        if (c.is_active) return { label: "Active", color: "bg-green-100 text-green-800 border-green-200" };
        return { label: "Inactive", color: "bg-gray-100 text-gray-800 border-gray-200" };
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'user': return <Users className="w-4 h-4" />;
            case 'collection': return <ShoppingBag className="w-4 h-4" />;
            case 'sales': return <Zap className="w-4 h-4" />;
            default: return <Tag className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'user': return 'text-purple-600 bg-purple-50';
            case 'collection': return 'text-blue-600 bg-blue-50';
            case 'sales': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const status = getStatus(coupon);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl border-2 p-4 transition-all duration-300 ${
                isApplied
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-gray-100 hover:shadow-lg hover:border-gray-300"
            }`}
        >
            {/* Coupon Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {getTypeIcon(coupon.coupon_type)}
                    <h3 className="font-bold text-lg text-gray-900">{coupon.coupon_code}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(coupon.coupon_type)}`}>
                        {coupon.coupon_type}
                    </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* Discount Info */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                    <Percent className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-700">
                        {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% OFF`
                            : `₹${coupon.discount_value} OFF`}
                    </span>
                </div>

                {/* Conditions */}
                <div className="space-y-1 text-sm text-gray-600">
                    {coupon.min_order_amount > 0 && (
                        <p>Min. order: ₹{coupon.min_order_amount}</p>
                    )}
                    {coupon.max_discount_amount > 0 && (
                        <p>Max. discount: ₹{coupon.max_discount_amount}</p>
                    )}
                    <p className="text-xs">Use {coupon.per_user_limit} time(s) per user</p>
                </div>
            </div>

            {/* Dates */}
            <div className="space-y-1 text-xs text-gray-500 border-t pt-3 mb-3">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Starts: {new Date(coupon.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Ends: {new Date(coupon.end_date).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Apply Button */}
            {status.label === "Active" && onApply && (
                <button
                    onClick={() => onApply(coupon)}
                    disabled={isApplied}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        isApplied
                            ? "bg-green-600 text-white cursor-default"
                            : "bg-black text-white hover:bg-gray-800"
                    }`}
                >
                    {isApplied ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Applied
                        </>
                    ) : (
                        "Apply Coupon"
                    )}
                </button>
            )}
        </motion.div>
    );
};

export default function AvailableCoupons({
                                             userId,
                                             collectionId,
                                             cartItems = [],
                                             subtotal = 0,
                                             appliedCoupon,
                                             onCouponApplied
                                         }) {
    const dispatch = useDispatch();
    const { availableCoupons, loading, validationLoading: couponLoading } = useSelector((state) => state.coupons);

    const [activeTab, setActiveTab] = useState('all');

    const couponTypes = [
        { key: 'all', label: 'All Coupons', icon: Tag },
        { key: 'collection', label: 'Collection', icon: ShoppingBag },
        { key: 'user', label: 'User Based', icon: Users },
        { key: 'sales', label: 'Sales', icon: Zap },
    ];

    useEffect(() => {
        if (userId || collectionId) {
            dispatch(getAvailableCoupons({
                user_id: userId,
                collection_id: collectionId
            }));
        }
    }, [dispatch, userId, collectionId]);

    const handleCouponApply = (coupon) => {
        dispatch(validateCoupon({
            coupon_code: coupon.coupon_code,
            cart_items: cartItems,
            subtotal,
            user_id: userId,
            source_collection_id: collectionId
        })).then((result) => {
            if (result.type === 'coupon/validateCoupon/fulfilled' && onCouponApplied) {
                onCouponApplied(coupon);
            }
        });
    };

    const filteredCoupons = activeTab === 'all'
        ? availableCoupons
        : availableCoupons.filter(coupon => coupon.coupon_type === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!availableCoupons || availableCoupons.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No coupons available</p>
                <p className="text-sm mt-1">Add items to cart to see available coupons</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {couponTypes.map((type) => {
                    const Icon = type.icon;
                    const count = type.key === 'all'
                        ? availableCoupons.length
                        : availableCoupons.filter(c => c.coupon_type === type.key).length;

                    return (
                        <button
                            key={type.key}
                            onClick={() => setActiveTab(type.key)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                                activeTab === type.key
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {type.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                activeTab === type.key
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {filteredCoupons.map((coupon) => (
                        <CouponCard
                            key={coupon.coupon_id}
                            coupon={coupon}
                            onApply={handleCouponApply}
                            isApplied={appliedCoupon?.coupon_id === coupon.coupon_id}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {couponLoading && (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Applying coupon...</span>
                </div>
            )}
        </div>
    );
}