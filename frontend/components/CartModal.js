
'use client';

import { useSelector, useDispatch } from 'react-redux';
import { closeCart, removeFromCart, updateCartItemQuantity, clearCart } from '@/store/slices/cartSlice';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isOpen, items, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClose = () => dispatch(closeCart());
  const handleRemove = (item) => {
    console.log('Removing item:', item);
    dispatch(removeFromCart(item));
  };
  const handleClearCart = () => dispatch(clearCart());

  const handleQuantityChange = (cart_item_id, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQuantity({ cart_item_id, quantity }));
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 w-full sm:w-[420px] h-full bg-white/80 backdrop-blur-xl shadow-2xl flex flex-col rounded-l-2xl border-l border-gray-200"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Your Cart</h2>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                    <button
                        onClick={handleClearCart}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Clear Cart"
                    >
                        <TrashIcon className="h-5 w-5 text-gray-600" />
                    </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {loading && <div className="text-center">Updating cart...</div>}
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg">Your cart is empty</p>
                  <p className="text-sm mt-1">Add something to make it happy</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.li
                      key={item.variant_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex py-4"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={item.main_image}
                          alt={item.product_name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link href={`/products/${item.product_id}`} onClick={handleClose}>
                                {item.product_name}
                              </Link>
                            </h3>
                            <p className="ml-4">₹{item.price}</p>
                          </div>
                          <p className="text-sm text-gray-500">{item.variant_name}</p>
                        </div>
                        <div className="flex flex-1 items-center justify-between text-sm">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 rounded-l">
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-3">{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 rounded-r">
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-200 p-5 bg-white/60"
              >
                <div className="flex justify-between text-lg font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>₹{subtotal.toFixed(2)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        handleClose();
                        router.push('/checkout');
                      } else {
                        // show auth modal inline; redirect after success
                        setShowAuthModal(true);
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-center rounded-md border border-transparent bg-[#D8234B] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#B71C3A]"
                  >
                    Checkout
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="font-medium text-[#D8234B] hover:text-[#B71C3A] cursor-pointer"
                      onClick={handleClose}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
          {showAuthModal && (
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              redirectAfterAuth="/checkout"
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
