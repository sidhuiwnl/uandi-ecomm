'use client';

import { useSelector, useDispatch } from 'react-redux';
import { closeWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { addToCart, openCart } from '@/store/slices/cartSlice';
import { XMarkIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistModal() {
  const dispatch = useDispatch();
  const { isOpen, items, loading } = useSelector((state) => state.wishlist);

  const handleClose = () => dispatch(closeWishlist());
  
  const handleRemove = (item) => {
    dispatch(removeFromWishlist({ 
      product_id: item.product_id, 
      variant_id: item.variant_id 
    }));
  };

  const handleAddToCart = (item) => {
    // Add to cart and remove from wishlist
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
              <h2 className="text-xl font-semibold text-gray-800">Your Wishlist</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="grow overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent will-change-transform">
              {loading && <div className="text-center">Loading wishlist...</div>}
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg">Your wishlist is empty</p>
                  <p className="text-sm mt-1">Save your favorites here</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.product_id}-${item.variant_id}`}
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
                            <p className="ml-4">₹{item.final_price || item.variant_price || item.price}</p>
                          </div>
                          <p className="text-sm text-gray-500">{item.variant_name}</p>
                          {item.stock > 0 ? (
                            <p className="text-xs text-green-600 mt-1">In Stock</p>
                          ) : (
                            <p className="text-xs text-red-600 mt-1">Out of Stock</p>
                          )}
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
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
                            onClick={() => handleRemove(item)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="border-t border-gray-200 p-5 bg-white/10"
              >
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
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
        </>
      )}
    </AnimatePresence>
  );
}
