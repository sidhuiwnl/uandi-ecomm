"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Calendar,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { getUserOrders } from "@/store/ordersSlice";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
    icon: Clock,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border border-purple-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border border-red-200",
    icon: Clock,
  },
};

const paymentStatusConfig = {
  pending: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  failed: { label: "Payment Failed", color: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", color: "bg-blue-100 text-blue-800" },
};

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const authState = useSelector((state) => state.auth);

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    let u = authState.user;
    if (!u) {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (stored) u = JSON.parse(stored);
    }
    setLocalUser(u);
  }, [authState.user]);

  useEffect(() => {
    if (localUser?.user_id) {
      dispatch(getUserOrders(localUser.user_id));
    }
  }, [dispatch, localUser]);

  const handleRefresh = () => {
    if (localUser?.user_id) {
      dispatch(getUserOrders(localUser.user_id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    const IconComponent = statusConfig[status?.toLowerCase()]?.icon || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] bg-gray-50 flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] bg-gray-50 flex items-center justify-center rounded-2xl">
        <div className="text-center p-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 rounded-2xl py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
            >
              My Orders
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600"
            >
              Track and manage your purchases
            </motion.p>
          </div>

          {orders && orders.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              onClick={handleRefresh}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 self-center md:self-auto"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {!orders || orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" /> Start Shopping
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Order Number</p>
                          <p className="text-lg font-bold text-gray-900">{order.order_number}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500">Order Date</p>
                          <p className="text-gray-900 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500">Payment</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              paymentStatusConfig[order.payment_status?.toLowerCase()]?.color ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {paymentStatusConfig[order.payment_status?.toLowerCase()]?.label ||
                              order.payment_status}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold text-gray-900">₹{order.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status & Actions */}
                  <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                            statusConfig[order.order_status?.toLowerCase()]?.color ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStatusIcon(order.order_status?.toLowerCase())}
                          {statusConfig[order.order_status?.toLowerCase()]?.label || order.order_status}
                        </div>

                        {order.coupon_code && (
                          <div className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            Coupon: {order.coupon_code}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {order.item_count || order.items?.length || 0} items
                        </span>
                        <button
                          onClick={() =>
                            setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)
                          }
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                        >
                          {expandedOrder === order.order_id ? "Hide" : "View"} Details
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedOrder === order.order_id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Items */}
                  <AnimatePresence>
                    {expandedOrder === order.order_id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-5">
                          <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                          <div className="space-y-4">
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-4">
                                  {item.main_image ? (
                                    <img
                                      src={item.main_image}
                                      alt={item.product_name}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.product_name || `Product #${item.product_id}`}
                                    </p>
                                    {item.variant_name && (
                                      <p className="text-sm text-gray-600">Variant: {item.variant_name}</p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × ₹{item.price}
                                    </p>
                                    {item.coupon_discount > 0 && (
                                      <p className="text-sm text-green-600">Discount: -₹{item.coupon_discount}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">₹{item.sub_total}</p>
                                  {item.source_collection_id && (
                                    <p className="text-xs text-gray-500 mt-1">Collection Item</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary */}
                          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                            <h5 className="font-semibold text-gray-900 mb-3">Order Summary</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Items Total:</span>
                                <span>
                                  ₹
                                  {order.total_amount + (order.coupon_discount || 0) - 99 -
                                    (order.total_amount * 0.18)}
                                </span>
                              </div>
                              {order.coupon_discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Coupon Discount:</span>
                                  <span>-₹{order.coupon_discount}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹99</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax (18%):</span>
                                <span>₹{(order.total_amount * 0.18).toFixed(2)}</span>
                              </div>
                              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                <span>Total Paid:</span>
                                <span>₹{order.total_amount}</span>
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          {order.address_line_1 && (
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                              <h5 className="font-semibold text-gray-900 mb-2">Delivery Address</h5>
                              <p className="text-sm text-gray-600">
                                {order.full_name}
                                {order.phone_number ? ` • ${order.phone_number}` : ""}
                                <br />
                                {order.address_line_1}
                                {order.address_line_2 ? `, ${order.address_line_2}` : ""}
                                <br />
                                {order.city}, {order.state} - {order.postal_code}
                                <br />
                                {order.country}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
