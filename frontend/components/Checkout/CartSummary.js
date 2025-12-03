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
  const parseNum = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Number(v);
    return 0;
  };

  const sellingSubtotal = items.reduce(
    (acc, item) => acc + parseNum(item.price) * (item.quantity || 0),
    0
  );
  const totalMrp = items.reduce(
    (acc, item) => acc + parseNum(item.mrp_price) * (item.quantity || 0),
    0
  );
  const discountOnMrp = Math.max(0, totalMrp - sellingSubtotal);
  const discountPercentage =
    totalMrp > 0 ? Math.round((discountOnMrp / totalMrp) * 100) : 0;
  const totalQuantity = items.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );
  const computedShipping = totalQuantity <= 1 ? 99 : 0;

  const totalSavings = discountOnMrp + discount + (computedShipping === 0 ? 99 : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header + savings */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Price Details</h2>
          {totalSavings > 0 && (
            <span className="text-xs font-medium text-green-600">
              You&apos;re saving ₹{totalSavings.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-3">
        {items.map((item) => {
          const lineTotal = parseNum(item.price) * (item.quantity || 0);
          const lineMrp = parseNum(item.mrp_price) * (item.quantity || 0);
          const lineDiscount = Math.max(0, lineMrp - lineTotal);

          return (
            <div
              key={item.cart_item_id}
              className="flex items-start justify-between text-sm"
            >
              <div className="flex-1 pr-2">
                <p className="font-medium text-gray-900">
                  {item.product_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Qty: {item.quantity}
                </p>
                {lineDiscount > 0 && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Saved ₹{lineDiscount.toFixed(0)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ₹{lineTotal.toFixed(2)}
                </p>
                {lineDiscount > 0 && (
                  <p className="text-xs text-gray-400 line-through">
                    ₹{lineMrp.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon / rewards section */}
      {(appliedCoupon || discount > 0) && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
              Coupons &amp; Offers
            </span>
            <button className="text-xs font-medium text-pink-600">
              Change
            </button>
          </div>
          {appliedCoupon ? (
            <p className="text-xs text-gray-700">
              {appliedCoupon.code} applied. You saved ₹
              {discount.toFixed(0)}.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Coupon applied. Savings ₹{discount.toFixed(0)}.
            </p>
          )}
        </div>
      )}

      {/* Price detail rows */}
      <div className="px-4 py-3 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>
            Total MRP ({totalQuantity} item{totalQuantity !== 1 ? 's' : ''})
          </span>
          <span className="font-medium">₹{totalMrp.toFixed(2)}</span>
        </div>

        {discountOnMrp > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount on MRP</span>
            <span>-₹{discountOnMrp.toFixed(2)}</span>
          </div>
        )}

        {discountOnMrp > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Effective discount</span>
            <span>{discountPercentage}%</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Shipping</span>
          {computedShipping > 0 ? (
            <span className="font-medium">₹{computedShipping.toFixed(2)}</span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="line-through text-xs text-gray-500">
                ₹99.00
              </span>
              <span className="text-green-600 font-medium text-sm">Free</span>
            </span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Additional Tax</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>

        {/* Total */}
        <div className="mt-2 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">
            Total Amount
          </span>
          <span className="text-base font-semibold text-gray-900">
            ₹{total.toFixed(2)}
          </span>
        </div>

        {totalSavings > 0 && (
          <p className="mt-1 text-xs text-green-600 font-medium">
            You will save ₹{totalSavings.toFixed(0)} on this order.
          </p>
        )}
      </div>
    </div>
  );
}
