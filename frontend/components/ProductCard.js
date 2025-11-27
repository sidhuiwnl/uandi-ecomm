"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

function getImageSections(width, numImages) {
  // Each consecutive image after the first gets a zone
  const sectionWidth = width / numImages;
  return Array.from({ length: numImages }, (_, i) => ({
    start: Math.floor(i * sectionWidth),
    end: Math.floor((i + 1) * sectionWidth)
  }));
}

export default function ProductCard({
  product,
  isAuthenticated,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
}) {
  if (!product || !product.variants?.[0]?.images?.length) return null;

  // Only non-video images
  const images = product.variants[0].images.filter(img =>
    img.image_url.match(/\.(webp|jpe?g|png|gif)$/i)
  );
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // Price & stock (use only variants with a valid positive price)
  const pricedVariants = (product.variants || []).filter(v => {
    const val = parseFloat(v.final_price || v.price || 0);
    return !isNaN(val) && val > 0;
  });
  const lowestPrice = pricedVariants.length > 0
    ? Math.min(...pricedVariants.map(v => parseFloat(v.final_price || v.price || 0)))
    : null;
  const lowestVariant = pricedVariants.length > 0
    ? pricedVariants.reduce((lowest, current) => {
        const lowP = parseFloat(lowest.final_price || lowest.price || 0);
        const curP = parseFloat(current.final_price || current.price || 0);
        return curP < lowP ? current : lowest;
      })
    : null;
  const showMrp = lowestVariant && lowestVariant.mrp_price && parseFloat(lowestVariant.mrp_price) > parseFloat(lowestVariant.final_price || lowestVariant.price || 0);
  const totalStock = pricedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const isAddDisabled = totalStock === 0 || !pricedVariants.length;

  // Add to Cart logic
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (totalStock === 0) return;
    if (!pricedVariants.length) return;
    const lowestVariant = pricedVariants.reduce((lowest, current) => {
      const lowP = parseFloat(lowest.final_price || lowest.price || 0);
      const curP = parseFloat(current.final_price || current.price || 0);
      return curP < lowP ? current : lowest;
    });
    onAddToCart?.({ product, variant: lowestVariant });
  };

  // Mouse move for swipe
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Only consider sections for images after the first
    const sections = getImageSections(rect.width, images.length);
    let idx = sections.findIndex(s => x >= s.start && x < s.end);
    idx = Math.max(0, idx); // Ensure first image is always shown at the far left
    setCurrentImgIdx(idx);
  };

  const handleMouseLeave = () => {
    setCurrentImgIdx(0);
  };

  return (
    <motion.div
      key={product.product_id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-lg"
      onClick={() => onNavigate?.(product.product_id)}
    >
      {/* Wishlist */}
      {isAuthenticated && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.product_id); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          {inWishlist ? (
            <HeartIconSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          )}
        </button>
      )}

      {/* Image area */}
      <div
        className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-2xl flex flex-col justify-end"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "grab" }}
      >
        <AnimatePresence>
          <motion.img
            key={images[currentImgIdx]?.image_url}
            src={images[currentImgIdx]?.image_url || '/placeholder.svg'}
            alt={product.product_name}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            loading="lazy"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            draggable={false}
          />
        </AnimatePresence>
        {/* Small dots for images after the first */}
        {/* <div className="relative z-10 mb-3 flex justify-center gap-2">
          {images.slice(1).map((img, i) => (
            <span
              key={img.image_url}
              className={`block w-1.5 h-1.5 rounded-full ${i + 1 === currentImgIdx
                ? "bg-gray-900"
                : "bg-gray-400"} transition-all duration-300`}
            />
          ))}
        </div> */}

        {/* Small dots for images after the first, show dots only if currentImgIdx > 0 */}
{currentImgIdx > 0 && (
  <div className="relative z-10 mb-3 flex justify-center gap-2">
    {images.slice(1).map((img, i) => (
      <span
        key={img.image_url}
        className={`block w-1.5 h-1.5 rounded-full ${
          i + 1 === currentImgIdx ? "bg-gray-900" : "bg-gray-400"
        } transition-all duration-300`}
      />
    ))}
  </div>
)}
        {/* Stock badge */}
        {totalStock < 10 && totalStock > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              Only {totalStock} left
            </span>
          </div>
        )}
        {totalStock === 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          {product.category?.category_name || 'Uncategorized'}
        </p>
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-gray-700 transition-colors">
          {product.product_name}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            {showMrp && (
              <span className="text-sm text-gray-400 line-through">
                ₹{parseFloat(lowestVariant.mrp_price).toFixed(2)}
              </span>
            )}
            <span className="text-xl font-light text-gray-900">
              {lowestPrice !== null ? `₹${lowestPrice.toFixed(2)}` : 'Not available'}
            </span>
          </div>
          {/* {pricedVariants.length > 1 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {pricedVariants.length} Variants
            </span>
          )} */}
        </div>
        <button
          className={`w-full py-3 cursor-pointer px-4 text-sm font-medium rounded-xl transition-all duration-200 ${isAddDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'}`}
          style={isAddDisabled ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundImage: 'linear-gradient(to right, #D8234B, #FFD3D5)', color: '#ffffff' }}
          disabled={isAddDisabled}
          onClick={handleAddToCart}
        >
          {totalStock === 0 ? 'Out of Stock' : !pricedVariants.length ? 'No Variants' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
