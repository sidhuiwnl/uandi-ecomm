"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";

export default function OrderDetailsPage() {
    const { role, orderId } = useParams(); // orderId here corresponds to the folder name [orderId], which captures the order number
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // The orderId param is actually the order number passed in the URL
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    setOrder(response.data.order);
                    setItems(response.data.items);
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    // Compute totals unconditionally to satisfy Hooks rules
    const totals = useMemo(() => {
        const totalPrice = items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0);
        const totalMrp = items.reduce((acc, it) => {
            const mrp = it.mrp_price != null ? Number(it.mrp_price) : null;
            const qty = Number(it.quantity || 1);
            return acc + (mrp ? mrp * qty : 0);
        }, 0);
        const discountOnMrp = Math.max(0, totalMrp - totalPrice);
        const shipping = Number(order?.shipping_amount || 0);
        const grandTotal = totalPrice + shipping;
        return { totalPrice, totalMrp, discountOnMrp, shipping, grandTotal };
    }, [items, order]);

    if (loading) return <div className="p-8 text-center">Loading order details...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    const statusBadge = (s) => {
        const map = {
            delivered: "bg-green-100 text-green-700",
            processing: "bg-blue-100 text-blue-700",
            cancelled: "bg-red-100 text-red-700",
            refunded: "bg-amber-100 text-amber-700",
            pending: "bg-yellow-100 text-yellow-700",
        };
        return map[s?.toLowerCase()] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
                        <p className="text-sm text-gray-500">
                            Placed on {new Date(order.created_at).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(order.order_status)}`}>
                        {order.order_status}
                    </span>
                    {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        <PrinterIcon className="w-4 h-4" />
                        Print Invoice
                    </button> */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <div key={item.order_item_id} className="p-6 flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {item.main_image ? (
                                            <img 
                                                src={item.main_image} 
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                                        )}
                                    </div>
                                        <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Variant: {item.variant_name}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₹{Number(item.price).toLocaleString()}</p>
                                                {item.mrp_price && Number(item.mrp_price) > Number(item.price) && (
                                                    <div className="mt-1 flex items-center gap-2 justify-end">
                                                        <span className="text-xs text-gray-400 line-through">₹{Number(item.mrp_price).toLocaleString()}</span>
                                                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                            {Math.round(((Number(item.mrp_price) - Number(item.price)) / Number(item.mrp_price)) * 100)}% OFF
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center text-sm">
                                            <div className="text-gray-500">
                                                Qty: <span className="font-medium text-gray-900">{item.quantity}</span>
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                Total: ₹{parseFloat(item.sub_total).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Total MRP</span>
                                <span>₹{totals.totalMrp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Discount on MRP</span>
                                <span>-₹{totals.discountOnMrp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{totals.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>₹{totals.shipping.toLocaleString()}</span>
                            </div>
                            {order.coupon_discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount ({order.coupon_code})</span>
                                    <span>-₹{Number(order.coupon_discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{(totals.grandTotal - Number(order.coupon_discount || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Customer & Shipping Info */}
                <div className="space-y-6">
                    {/* Customer Details */}
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                                    {(order.user_first_name?.[0] || order.full_name?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {order.user_first_name ? `${order.user_first_name} ${order.user_last_name}` : order.full_name}
                                    </p>
                                    <p className="text-sm text-gray-500">{order.email}</p>
                                    <p className="text-sm text-gray-500">{order.phone_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-gray-900 mb-2">{order.full_name}</p>
                            <p>{order.address_line_1}</p>
                            {order.address_line_2 && <p>{order.address_line_2}</p>}
                            <p>{order.city}, {order.state} - {order.postal_code}</p>
                            <p>{order.country}</p>
                            <p className="mt-2 pt-2 border-t border-gray-100">Phone: {order.phone_number}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Method</span>
                                <span className="font-medium text-gray-900">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Status</span>
                                <span className={`font-medium ${
                                    order.payment_status === 'Paid' ? 'text-green-600' : 
                                    order.payment_status === 'Pending' ? 'text-yellow-600' : 'text-gray-900'
                                }`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
