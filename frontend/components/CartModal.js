
'use client';

import { useSelector, useDispatch } from 'react-redux';
import { closeCart, removeFromCart, updateCartItemQuantity, clearCart, addToCart } from '@/store/slices/cartSlice';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isOpen, items, loading } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'wishlist'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = () => dispatch(closeCart());
  const handleRemove = (item) => {
    console.log('Removing item:', item);
    dispatch(removeFromCart(item));
  };
  const handleClearCart = () => dispatch(clearCart());

  const handleRemoveFromWishlist = (item) => {
    dispatch(removeFromWishlist({ 
      product_id: item.product_id, 
      variant_id: item.variant_id 
    }));
  };

  const handleAddToCartFromWishlist = (item) => {
    const cartItem = {
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: 1,
      price: item.final_price || item.variant_price || item.price,
      main_image: item.main_image
    };
    dispatch(addToCart(cartItem));
    // Remove from wishlist after adding to cart
    dispatch(removeFromWishlist({ product_id: item.product_id, variant_id: item.variant_id }));
  };

  const handleQuantityChange = (cart_item_id, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQuantity({ cart_item_id, quantity }));
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Determine what to display
  const displayItems = isMobile && activeTab === 'wishlist' ? wishlistItems : items;
  const displayMode = isMobile && activeTab === 'wishlist' ? 'wishlist' : 'cart';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.10, ease: 'easeOut' }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
            className="fixed right-0 top-0 z-50 w-full sm:w-[420px] h-full bg-white/80 backdrop-blur-xl shadow-2xl flex flex-col rounded-l-2xl border-l border-gray-200"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {isMobile && activeTab === 'wishlist' ? 'Your Wishlist' : 'Your Cart'}
              </h2>
              <div className="flex items-center gap-2">
                {displayMode === 'cart' && items.length > 0 && (
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

            {/* Mobile Tab Switcher */}
            {isMobile && (
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'cart'
                      ? 'text-[#D8234B] border-b-2 border-[#D8234B]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cart {items.length > 0 && `(${items.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'wishlist'
                      ? 'text-[#D8234B] border-b-2 border-[#D8234B]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </button>
              </div>
            )}

            <div className="grow overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent will-change-transform">
              {loading && <div className="text-center">Updating...</div>}
              {displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg">Your {displayMode} is empty</p>
                  <p className="text-sm mt-1">
                    {displayMode === 'cart' ? 'Add something to make it happy' : 'Save your favorites here'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {displayItems.map((item) => (
                    <motion.li
                      key={displayMode === 'cart' ? item.variant_id : `${item.product_id}-${item.variant_id}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="flex py-4"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 will-change-transform">
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
                            <p className="ml-4">
                              ₹{displayMode === 'cart' ? item.price : (item.final_price || item.variant_price || item.price)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">{item.variant_name}</p>
                          {displayMode === 'wishlist' && (
                            <p className={`text-xs mt-1 ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-1 items-center justify-between text-sm">
                          {displayMode === 'cart' ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAddToCartFromWishlist(item)}
                                disabled={item.stock === 0}
                                className={`flex items-center gap-1 font-medium ${
                                  item.stock > 0
                                    ? 'text-[#D8234B] hover:text-[#B71C3A]'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingBagIcon className="h-4 w-4" />
                                Add to Cart
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromWishlist(item)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && displayMode === 'cart' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="border-t border-gray-200 p-5 bg-white/10"
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
