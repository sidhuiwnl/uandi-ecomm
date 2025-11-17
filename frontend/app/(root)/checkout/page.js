"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Phone, User, ArrowRight, Tag, X,
    Plus, Shield, CheckCircle2,
    CreditCard, Lock, ShoppingCart
} from "lucide-react";
import CartSummary from "@/components/Checkout/CartSummary";
import {
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
} from "@/store/slices/addressSlice";
import {validateCoupon,removeCoupon} from "@/store/couponSlics";
import { createOrder } from "@/store/ordersSlice";
import { clearCart } from "@/store/slices/cartSlice";
import Swal from "sweetalert2";
import AvailableCoupons from "@/components/AvailableCoupons";


const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    return 'An unexpected error occurred';
};

export default function Page() {
    const dispatch = useDispatch();
    const router = useRouter();

    const authState = useSelector((state) => state.auth);
    const { addresses, loading: addressesLoading, error: addressesError } = useSelector((state) => state.addresses);
    const { items } = useSelector((state) => state.cart);
    const {
        appliedCoupon,
        discount,
        validationLoading: couponLoading,
        validationError: couponError
    } = useSelector((state) => state.coupons);
    const { creating: orderCreating, createError: orderError } = useSelector((state) => state.orders);

    const [localUser, setLocalUser] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
    });
    const [formErrors, setFormErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [savingAddress, setSavingAddress] = useState(false);
    const [isEmptyCart, setIsEmptyCart] = useState(false); // New state for empty cart

    const subtotal = items?.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0) || 0;
    const shipping = 99;
    const tax = subtotal * 0.18;
    const total = Math.max(0, subtotal + shipping + tax - (discount || 0));

    const steps = [
        { number: 1, title: 'Delivery', completed: currentStep > 1 },
        { number: 2, title: 'Review', completed: currentStep > 2 },
        { number: 3, title: 'Payment', completed: false }
    ];

    // Check for empty cart - moved inside useEffect
    useEffect(() => {
        if (!items || items.length === 0) {
            setIsEmptyCart(true);
        } else {
            setIsEmptyCart(false);
        }
    }, [items]);

    useEffect(() => {
        let u = authState.user;
        if (!u) {
            const stored = localStorage.getItem("user");
            if (stored) u = JSON.parse(stored);
        }
        setLocalUser(u);
        if (u?.user_id) {
            dispatch(fetchAddresses(u.user_id));
        }
    }, [authState.user, dispatch]);

    useEffect(() => {
        if (!addressesLoading && addresses?.length > 0 && !selectedAddress) {
            // Try to find default address first, otherwise use first address
            const defaultAddress = addresses.find(addr => addr.is_default);
            setSelectedAddress(defaultAddress || addresses[0]);
        }
    }, [addresses, addressesLoading, selectedAddress]);

    // Handle empty cart rendering - moved after all hooks
    if (isEmptyCart) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to proceed with checkout</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const validateForm = () => {
        const errors = {};
        if (!formData.full_name?.trim()) errors.full_name = "Full name is required";
        if (!formData.phone_number?.trim()) errors.phone_number = "Phone number is required";
        if (!/^\d{10}$/.test(formData.phone_number)) errors.phone_number = "Invalid phone number";
        if (!formData.address_line_1?.trim()) errors.address_line_1 = "Address line 1 is required";
        if (!formData.city?.trim()) errors.city = "City is required";
        if (!formData.state?.trim()) errors.state = "State is required";
        if (!formData.postal_code?.trim()) errors.postal_code = "Postal code is required";
        if (!/^\d{6}$/.test(formData.postal_code)) errors.postal_code = "Invalid postal code";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear error when user starts typing
        if (formErrors[e.target.name]) {
            setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localUser || !validateForm()) return;

        setSavingAddress(true);
        try {
            const addressData = {
                ...formData,
                user_id: localUser.user_id
            };

            console.log('Submitting address:', addressData); // Debug log

            if (formData.address_id) {
                await dispatch(updateAddress({
                    id: formData.address_id,
                    addressData: addressData,
                })).unwrap();
            } else {
                await dispatch(addAddress(addressData)).unwrap();
            }
            setShowForm(false);
            setFormData({
                full_name: "", phone_number: "", address_line_1: "", address_line_2: "",
                city: "", state: "", postal_code: "", country: "India",
            });
            setFormErrors({});

            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Success',
                text: 'Address saved successfully',
                background: '#d1fae5',
                color: '#065f46'
            });
        } catch (err) {
            console.error('Address submission error:', err);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'error',
                title: 'Error',
                text: getErrorMessage(err) || 'Failed to save address',
                background: '#fee2e2',
                color: '#991b1b'
            });
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: '#fef3c7',
            color: '#92400e'
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteAddress({
                    id,
                    user_id: localUser?.user_id
                })).unwrap();
                if (selectedAddress?.address_id === id) {
                    setSelectedAddress(addresses.find(addr => addr.address_id !== id) || null);
                }
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Deleted',
                    text: 'Address deleted successfully',
                    background: '#d1fae5',
                    color: '#065f46'
                });
            } catch (err) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'error',
                    title: 'Error',
                    text: getErrorMessage(err) || 'Failed to delete address',
                    background: '#fee2e2',
                    color: '#991b1b'
                });
            }
        }
    };

    const handleEdit = (address, e) => {
        e.stopPropagation();
        setFormData({
            ...address,
            address_id: address.address_id,
            address_line_2: address.address_line_2 || ""
        });
        setFormErrors({});
        setShowForm(true);
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;

        dispatch(validateCoupon({
            coupon_code: couponCode.toUpperCase(),
            cart_items: items,
            subtotal,
            user_id: localUser?.user_id
        })).then((result) => {
            if (result.type === 'coupon/validateCoupon/fulfilled') {
                setCouponCode('');
            }
        });
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        setCouponCode('');
    };

    const handleNextStep = () => {
        if (!selectedAddress) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'warning',
                title: 'Address Required',
                text: 'Please select a delivery address',
                background: '#fef3c7',
                color: '#92400e'
            });
            return;
        }
        setCurrentStep(2);
    };

    const handleProceedToPayment = async () => {
        if (!selectedAddress || !localUser) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a delivery address',
                background: '#fef3c7',
                color: '#92400e'
            });
            return;
        }

        // Validate cart items
        if (items.some(item => !item.product_id || !item.variant_id || item.quantity <= 0)) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'error',
                title: 'Invalid Cart Items',
                text: 'Some items in your cart are invalid',
                background: '#fee2e2',
                color: '#991b1b'
            });
            return;
        }

        const orderData = {
            user_id: localUser.user_id,
            address_id: selectedAddress.address_id,
            total_amount: total,
            payment_method: 'UPI',
            payment_status: 'Pending',
            order_status: 'Processing',
            coupon_id: appliedCoupon?.coupon_id || null,
            coupon_code: appliedCoupon?.coupon_code || null,
            coupon_type: appliedCoupon?.coupon_type || null,
            coupon_discount: discount || 0,
            source_collection_id: items[0]?.source_collection_id || null
        };

        const orderItems = items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
            sub_total: item.sub_total || (item.price * item.quantity),
            source_collection_id: item.source_collection_id,
            coupon_discount: appliedCoupon ? ((discount || 0) / items.length) : 0
        }));

        try {
            const result = await dispatch(createOrder({ orderData, orderItems })).unwrap();

            if (result.success) {
                const checkoutData = {
                    order_id: result.order.order_id,
                    address: selectedAddress,
                    cartItems: items,
                    coupon: appliedCoupon,
                    discount: discount || 0,
                    totals: { subtotal, shipping, tax, total, discount: discount || 0 }
                };

                localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

                // Clear cart after successful order creation
                dispatch(clearCart());

                console.log('✅ Order created successfully:', result.order);
                // router.push('/checkout/payment');
            }
        } catch (error) {
            console.error('❌ Error creating order:', error);
            const errorMessage = getErrorMessage(error) || 'Failed to create order. Please try again.';

            Swal.fire({
                title: 'Order Creation Failed',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#ec4899',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleBackStep = () => {
        setCurrentStep(1);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>

                    {/* Progress Steps */}
                    <div className="flex justify-center items-center mb-8">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    step.completed || currentStep === step.number
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-300 text-gray-500'
                                } font-semibold`}>
                                    {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                                </div>
                                <span className={`ml-2 font-medium ${
                                    step.completed || currentStep === step.number
                                        ? 'text-blue-600'
                                        : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-4 ${
                                        step.completed ? 'bg-blue-600' : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT PANEL - Checkout Steps */}
                    <div className="lg:col-span-2 space-y-8">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: Delivery Details */}
                            {currentStep === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h2 className="text-2xl font-semibold text-gray-900">Delivery Details</h2>
                                    </div>

                                    {addressesLoading && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}

                                    {addressesError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                            <p className="text-red-700">{getErrorMessage(addressesError)}</p>
                                        </div>
                                    )}

                                    {/* Address Selection */}
                                    <div className="space-y-4 mb-6">
                                        <h3 className="font-medium text-gray-900 mb-3">Select Delivery Address</h3>

                                        {!addressesLoading && addresses?.length > 0 ? (
                                            <div className="grid gap-4">
                                                {addresses.map((address) => (
                                                    <div
                                                        key={address.address_id}
                                                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                                                            selectedAddress?.address_id === address.address_id
                                                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                        onClick={() => setSelectedAddress(address)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                {selectedAddress?.address_id === address.address_id ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                                                )}
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{address.full_name}</p>
                                                                    <p className="text-sm text-gray-600">{address.phone_number}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => handleEdit(address, e)}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDelete(address.address_id, e)}
                                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-600 ml-8">
                                                            <p>{address.address_line_1}{address.address_line_2 && `, ${address.address_line_2}`}</p>
                                                            <p>{address.city}, {address.state} - {address.postal_code}</p>
                                                            <p>{address.country}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !addressesLoading && (
                                            <div className="text-center text-gray-500 py-8">
                                                No addresses found. Please add an address to continue.
                                            </div>
                                        )}

                                        {/* Add New Address Button */}
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 group"
                                        >
                                            <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-blue-600">
                                                <Plus className="w-5 h-5" />
                                                <span className="font-medium">Add New Address</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Continue Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNextStep}
                                        disabled={!selectedAddress}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        Continue to Review
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STEP 2: Order Review */}
                            {currentStep === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-semibold text-gray-900">Order Review</h2>
                                    </div>

                                    {/* Selected Address Review */}
                                    <div className="mb-8">
                                        <h3 className="font-medium text-gray-900 mb-3">Delivery Address</h3>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="font-semibold">{selectedAddress?.full_name}</p>
                                            <p className="text-gray-600">{selectedAddress?.phone_number}</p>
                                            <p className="text-gray-600">
                                                {selectedAddress?.address_line_1}
                                                {selectedAddress?.address_line_2 && `, ${selectedAddress.address_line_2}`}
                                            </p>
                                            <p className="text-gray-600">
                                                {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.postal_code}
                                            </p>
                                            <p className="text-gray-600">{selectedAddress?.country}</p>
                                        </div>
                                        <button
                                            onClick={() => setCurrentStep(1)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                                        >
                                            Change address
                                        </button>
                                    </div>

                                    {/* Coupon Section */}
                                    <div className="mb-8">
                                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            Apply Coupon
                                        </h3>

                                        {appliedCoupon ? (
                                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                                                <div>
                                                    <p className="font-medium text-green-800">
                                                        {appliedCoupon.coupon_code} Applied
                                                    </p>
                                                    <p className="text-sm text-green-600">
                                                        {appliedCoupon.discount_type === 'percentage'
                                                            ? `${appliedCoupon.discount_value}% off`
                                                            : `₹${appliedCoupon.discount_value} off`
                                                        }
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleRemoveCoupon}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter coupon code"
                                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 ring-blue-500 focus:border-blue-500"
                                                    disabled={couponLoading}
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponCode.trim() || couponLoading}
                                                    className="bg-gray-800 text-white px-6 py-3 rounded-lg text-sm disabled:bg-gray-400 flex items-center gap-2 transition-colors duration-200"
                                                >
                                                    {couponLoading ? (
                                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        'Apply'
                                                    )}
                                                </button>
                                            </div>

                                        )}
                                        <div className="mb-8">
                                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                Available Coupons
                                            </h3>

                                            <AvailableCoupons
                                                userId={localUser?.user_id}
                                                collectionId={items[0]?.source_collection_id}
                                                cartItems={items}
                                                subtotal={subtotal}
                                                appliedCoupon={appliedCoupon}
                                                onCouponApplied={() => {
                                                    // Optional: Any callback after coupon is applied
                                                    console.log('Coupon applied successfully');
                                                }}
                                            />
                                        </div>

                                        {couponError && (
                                            <p className="text-red-500 text-sm mt-2">{getErrorMessage(couponError)}</p>
                                        )}
                                    </div>

                                    {orderError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                            <p className="text-red-700">{getErrorMessage(orderError)}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleBackStep}
                                            className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Back to Delivery
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleProceedToPayment}
                                            disabled={orderCreating}
                                            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                            {orderCreating ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                    Creating Order...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Proceed to Payment
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Address Form Modal */}
                        {/* Address Form Modal */}
                        <AnimatePresence>
                            {showForm && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormErrors({});
                                    }}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                    >
                                        <h3 className="text-xl font-semibold mb-5 text-gray-900">
                                            {formData.address_id ? "Edit Address" : "Add New Address"}
                                        </h3>

                                        <form onSubmit={handleSubmit} className="space-y-4">

                                            {/* FULL NAME */}
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    placeholder="Full Name"
                                                    className={`w-full rounded-xl px-4 py-3 border transition-all ${
                                                        formErrors.full_name
                                                            ? "border-red-500 focus:ring-red-500"
                                                            : "border-gray-300 focus:ring-blue-500"
                                                    }`}
                                                />
                                                {formErrors.full_name && (
                                                    <p className="text-red-500 text-xs">{formErrors.full_name}</p>
                                                )}
                                            </div>

                                            {/* PHONE */}
                                            <div className="space-y-1">
                                                <input
                                                    type="tel"
                                                    name="phone_number"
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    placeholder="Phone Number"
                                                    className={`w-full rounded-xl px-4 py-3 border transition-all ${
                                                        formErrors.phone_number
                                                            ? "border-red-500 focus:ring-red-500"
                                                            : "border-gray-300 focus:ring-blue-500"
                                                    }`}
                                                />
                                                {formErrors.phone_number && (
                                                    <p className="text-red-500 text-xs">{formErrors.phone_number}</p>
                                                )}
                                            </div>

                                            {/* ADDRESS 1 */}
                                            <div className="space-y-1">
                                                <input
                                                    type="text"
                                                    name="address_line_1"
                                                    value={formData.address_line_1}
                                                    onChange={handleChange}
                                                    placeholder="Address Line 1"
                                                    className={`w-full rounded-xl px-4 py-3 border transition-all ${
                                                        formErrors.address_line_1
                                                            ? "border-red-500 focus:ring-red-500"
                                                            : "border-gray-300 focus:ring-blue-500"
                                                    }`}
                                                />
                                                {formErrors.address_line_1 && (
                                                    <p className="text-red-500 text-xs">{formErrors.address_line_1}</p>
                                                )}
                                            </div>

                                            {/* ADDRESS 2 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    name="address_line_2"
                                                    value={formData.address_line_2}
                                                    onChange={handleChange}
                                                    placeholder="Address Line 2 (Optional)"
                                                    className="w-full rounded-xl px-4 py-3 border border-gray-300 focus:ring-blue-500 transition-all"
                                                />
                                            </div>

                                            {/* CITY - STATE */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        placeholder="City"
                                                        className={`w-full rounded-xl px-4 py-3 border transition-all ${
                                                            formErrors.city
                                                                ? "border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:ring-blue-500"
                                                        }`}
                                                    />
                                                    {formErrors.city && (
                                                        <p className="text-red-500 text-xs">{formErrors.city}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        placeholder="State"
                                                        className={`w-full rounded-xl px-4 py-3 border transition-all ${
                                                            formErrors.state
                                                                ? "border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:ring-blue-500"
                                                        }`}
                                                    />
                                                    {formErrors.state && (
                                                        <p className="text-red-500 text-xs">{formErrors.state}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* PINCODE - COUNTRY */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        name="postal_code"
                                                        value={formData.postal_code}
                                                        onChange={handleChange}
                                                        placeholder="Postal Code"
                                                        className={`w-full rounded-xl px-4 py-3 border transition-all ${
                                                            formErrors.postal_code
                                                                ? "border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:ring-blue-500"
                                                        }`}
                                                    />
                                                    {formErrors.postal_code && (
                                                        <p className="text-red-500 text-xs">{formErrors.postal_code}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleChange}
                                                        placeholder="Country"
                                                        className="w-full rounded-xl px-4 py-3 border border-gray-300 focus:ring-blue-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* BUTTONS */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowForm(false);
                                                        setFormErrors({});
                                                    }}
                                                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={savingAddress}
                                                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                                                >
                                                    {savingAddress ? (
                                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        "Save Address"
                                                    )}
                                                </button>
                                            </div>

                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>

                    {/* RIGHT PANEL - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <CartSummary
                                items={items}
                                subtotal={subtotal}
                                shipping={shipping}
                                tax={tax}
                                discount={discount}
                                total={total}
                                appliedCoupon={appliedCoupon}
                            />

                            {/* Security Badge */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mt-6">
                                <div className="flex items-center gap-3 text-green-600 mb-2">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-semibold">Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Lock className="w-4 h-4" />
                                    <span>Your payment information is encrypted and secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}