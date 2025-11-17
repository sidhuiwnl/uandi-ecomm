"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { X } from "lucide-react";

export default function CreateCouponModal({ open, setOpen, onCreate }) {
    const [form, setForm] = useState({
        coupon_code: "",
        coupon_type: "collection",
        discount_type: "percentage",
        discount_value: "",
        max_discount_amount: "",
        min_order_amount: "",
        start_date: "",
        end_date: "",
        is_active: true,
        total_usage_limit: "",
        per_user_limit: 1,
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onCreate(form);
        setOpen(false);
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>

                {/* Background Blur */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-150"
                            enterFrom="opacity-0 scale-95 translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-2"
                        >

                            {/* Modal Panel */}
                            <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                                        Create Coupon
                                    </Dialog.Title>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                    >
                                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                                        <input
                                            name="coupon_code"
                                            onChange={handleChange}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="e.g., SAVE10"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Coupon Type</label>
                                        <select
                                            name="coupon_type"
                                            onChange={handleChange}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                        >
                                            <option value="collection">Collection</option>
                                            <option value="user">User Based</option>
                                            <option value="sales">Sales</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Discount Type</label>
                                            <select
                                                name="discount_type"
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            >
                                                <option value="percentage">Percentage</option>
                                                <option value="flat">Flat Amount</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Discount Value</label>
                                            <input
                                                type="number"
                                                name="discount_value"
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                placeholder="10 / 200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Max Discount</label>
                                            <input
                                                type="number"
                                                name="max_discount_amount"
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Min Order</label>
                                            <input
                                                type="number"
                                                name="min_order_amount"
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                name="start_date"
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">End Date</label>
                                            <input
                                                type="datetime-local"
                                                name="end_date"
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Per User Limit</label>
                                        <input
                                            type="number"
                                            name="per_user_limit"
                                            value={form.per_user_limit}
                                            onChange={handleChange}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        onClick={handleSubmit}
                                    >
                                        Create
                                    </button>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>

                    </div>
                </div>

            </Dialog>
        </Transition>
    );
}