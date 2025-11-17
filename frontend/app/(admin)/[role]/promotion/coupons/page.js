"use client";

import { useState, useEffect } from "react";
import { BadgePercent, Plus, Calendar, Clock } from "lucide-react";
import CreateCouponModal from "@/components/CreateCouponModal";

export default function Page() {
    const [coupons, setCoupons] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        setCoupons([
            {
                id: 1,
                code: "EARLY10",
                type: "user",
                discount_type: "percentage",
                discount_value: 10,
                start_date: "2025-02-01",
                end_date: "2025-03-01",
                is_active: 1,
            },
            {
                id: 2,
                code: "COL20",
                type: "collection",
                discount_type: "flat",
                discount_value: 200,
                start_date: "2025-01-10",
                end_date: "2025-01-20",
                is_active: 0,
            },
        ]);
    }, []);

    const getStatus = (c) => {
        const now = new Date();
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);

        if (now < start) return { label: "Upcoming", color: "bg-blue-100 text-blue-800" };
        if (now > end) return { label: "Expired", color: "bg-red-100 text-red-800" };
        if (c.is_active) return { label: "Active", color: "bg-green-100 text-green-800" };
        return { label: "Inactive", color: "bg-gray-100 text-gray-800" };
    };

    /** ADD NEW COUPON TO UI */
    const handleCreateCoupon = (data) => {
        const newCoupon = {
            id: coupons.length + 1,
            code: data.coupon_code,
            type: data.coupon_type,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            start_date: data.start_date,
            end_date: data.end_date,
            is_active: 1,
        };

        setCoupons((prev) => [...prev, newCoupon]);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BadgePercent className="w-6 h-6" />
                    Coupons
                </h1>

                <button
                    onClick={() => setOpenModal(true)}
                    className="px-4 py-2 flex items-center gap-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    Create Coupon
                </button>
            </div>

            {/* Empty State */}
            {coupons.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50">
                    <p className="text-gray-600 text-lg">No coupons found</p>
                    <button className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                        Create Your First Coupon
                    </button>
                </div>
            )}

            {/* Coupon List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((c) => {
                    const status = getStatus(c);

                    return (
                        <div
                            key={c.id}
                            className="border border-gray-200 p-6 rounded-xl bg-white hover:shadow-lg transition-shadow"
                        >
                            {/* Coupon Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{c.code}</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>

                            {/* Discount Info */}
                            <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-900">
                                    {c.discount_type === "percentage"
                                        ? `${c.discount_value}% OFF`
                                        : `₹${c.discount_value} OFF`}
                                </p>
                                <p className="text-gray-600 capitalize">
                                    {c.type} coupon
                                </p>
                            </div>

                            {/* Dates */}
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Starts: {new Date(c.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Ends: {new Date(c.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL */}
            <CreateCouponModal
                open={openModal}
                setOpen={setOpenModal}
                onCreate={handleCreateCoupon}
            />
        </div>
    );
}
