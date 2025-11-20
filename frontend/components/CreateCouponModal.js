"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { createCoupon } from "@/store/couponSlice";
import { fetchCollections } from "@/store/collectionsSlice";
import { useDispatch, useSelector } from "react-redux";

export default function CreateCouponModal({ open, setOpen }) {
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
        collection_ids: [],
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCollections, setSelectedCollections] = useState([]);

    const dispatch = useDispatch();
    const { createLoading } = useSelector((state) => state.coupons);

    // FIX: Access state.collections.items instead of state.collections.collections
    const { items: collections, loading: collectionsLoading } = useSelector((state) => state.collections);

    console.log("Collections from Redux:", collections);

    // Fetch collections when modal opens
    useEffect(() => {
        if (open) {
            dispatch(fetchCollections());
        }
    }, [open, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Clear selected collections when coupon type changes from collection
        if (name === 'coupon_type' && value !== 'collection') {
            setSelectedCollections([]);
            setForm(prev => ({ ...prev, collection_ids: [] }));
        }
    };

    const handleCollectionSelect = (collection) => {
        if (selectedCollections.some(c => c.collection_id === collection.collection_id)) {
            // Remove if already selected
            const updated = selectedCollections.filter(c => c.collection_id !== collection.collection_id);
            setSelectedCollections(updated);
            setForm(prev => ({
                ...prev,
                collection_ids: updated.map(c => c.collection_id)
            }));
        } else {
            // Add to selected
            const updated = [...selectedCollections, collection];
            setSelectedCollections(updated);
            setForm(prev => ({
                ...prev,
                collection_ids: updated.map(c => c.collection_id)
            }));
        }
    };

    // In your CreateCouponModal component, the handleSubmit function should be:

    const handleSubmit = () => {
        // Validate collection mapping for collection type coupons
        if (form.coupon_type === 'collection' && form.collection_ids.length === 0) {
            alert("Please select at least one collection for collection-type coupon");
            return;
        }

        // Validate required fields
        if (!form.coupon_code || !form.discount_value || !form.start_date || !form.end_date) {
            alert("Please fill in all required fields");
            return;
        }

        // Validate percentage discount requires max_discount_amount
        if (form.discount_type === "percentage" && !form.max_discount_amount) {
            alert("Max discount amount is required for percentage discounts");
            return;
        }

        // Prepare the data to send
        const couponData = {
            coupon_code: form.coupon_code,
            coupon_type: form.coupon_type,
            discount_type: form.discount_type,
            discount_value: parseFloat(form.discount_value),
            max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
            min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
            start_date: form.start_date,
            end_date: form.end_date,
            is_active: form.is_active,
            total_usage_limit: form.total_usage_limit ? parseInt(form.total_usage_limit) : null,
            per_user_limit: parseInt(form.per_user_limit),
            collection_ids: form.collection_ids // This will be an array of collection IDs
        };

        console.log("Sending coupon data:", couponData); // Debug log

        dispatch(createCoupon(couponData))
            .unwrap()
            .then((result) => {
                alert("Coupon created successfully!");
                setOpen(false);
                // Reset form
                setForm({
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
                    collection_ids: [],
                });
                setSelectedCollections([]);
                setSearchTerm("");
            })
            .catch((err) => {
                alert(err.message || "Failed to create coupon");
            });
    };

    const filteredCollections = collections?.filter(collection =>
        collection.collection_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                            <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

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
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto">

                                    {/* Coupon Code */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Coupon Code *</label>
                                        <input
                                            name="coupon_code"
                                            value={form.coupon_code}
                                            onChange={handleChange}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="e.g., SAVE10"
                                            required
                                        />
                                    </div>

                                    {/* Coupon Type */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Coupon Type *</label>
                                        <select
                                            name="coupon_type"
                                            value={form.coupon_type}
                                            onChange={handleChange}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                        >
                                            <option value="collection">Collection</option>
                                            <option value="user">User Based</option>
                                            <option value="sales">Sales</option>
                                        </select>
                                    </div>

                                    {/* Collection Selection - Only show for collection type */}
                                    {form.coupon_type === "collection" && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Select Collections *
                                            </label>

                                            {/* Search Bar */}
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search collections..."
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                />
                                            </div>

                                            {/* Selected Collections */}
                                            {selectedCollections.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Collections:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedCollections.map(collection => (
                                                            <span
                                                                key={collection.collection_id}
                                                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                                                            >
                                                                {collection.collection_name}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCollectionSelect(collection)}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Collections List */}
                                            <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                                                {collectionsLoading ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                        <p className="mt-2">Loading collections...</p>
                                                    </div>
                                                ) : filteredCollections.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        {searchTerm ? "No collections found" : "No collections available"}
                                                    </div>
                                                ) : (
                                                    filteredCollections.map(collection => (
                                                        <div
                                                            key={collection.collection_id}
                                                            className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                                                selectedCollections.some(c => c.collection_id === collection.collection_id)
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleCollectionSelect(collection)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">{collection.collection_name}</span>
                                                                {selectedCollections.some(c => c.collection_id === collection.collection_id) && (
                                                                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Discount Type + Discount Value */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Discount Type *</label>
                                            <select
                                                name="discount_type"
                                                value={form.discount_type}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                            >
                                                <option value="percentage">Percentage</option>
                                                <option value="flat">Flat Amount</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Discount Value *</label>
                                            <input
                                                type="number"
                                                name="discount_value"
                                                value={form.discount_value}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                placeholder="10 / 200"
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Percentage → Show Max Discount + Min Order */}
                                    {form.discount_type === "percentage" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Max Discount Amount</label>
                                                <input
                                                    type="number"
                                                    name="max_discount_amount"
                                                    value={form.max_discount_amount}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="Optional"
                                                    min="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Min Order Amount</label>
                                                <input
                                                    type="number"
                                                    name="min_order_amount"
                                                    value={form.min_order_amount}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="Optional"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Flat Discount → Only Min Order */}
                                    {form.discount_type === "flat" && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Min Order Amount</label>
                                            <input
                                                type="number"
                                                name="min_order_amount"
                                                value={form.min_order_amount}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                placeholder="Optional"
                                                min="0"
                                            />
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Start Date *</label>
                                            <input
                                                type="datetime-local"
                                                name="start_date"
                                                value={form.start_date}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">End Date *</label>
                                            <input
                                                type="datetime-local"
                                                name="end_date"
                                                value={form.end_date}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Usage Limits */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Total Usage Limit</label>
                                            <input
                                                type="number"
                                                name="total_usage_limit"
                                                value={form.total_usage_limit}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                placeholder="Optional"
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Per User Limit *</label>
                                            <input
                                                type="number"
                                                name="per_user_limit"
                                                value={form.per_user_limit}
                                                onChange={handleChange}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                                required
                                                min="1"
                                            />
                                        </div>
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
                                        disabled={createLoading}
                                        className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                                            createLoading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
                                        }`}
                                        onClick={handleSubmit}
                                    >
                                        {createLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Coupon"
                                        )}
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