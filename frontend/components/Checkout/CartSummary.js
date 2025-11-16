// components/Checkout/CartSummary.jsx
export default function CartSummary({
                                        items,
                                        subtotal,
                                        shipping,
                                        tax,
                                        discount = 0,
                                        total,
                                        appliedCoupon
                                    }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Items list */}
            <div className="space-y-4 mb-6">
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex justify-between">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon.coupon_code})</span>
                        <span>-₹{discount.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}