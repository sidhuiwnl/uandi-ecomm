"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

function getImageSections(width, numImages) {
    const sectionWidth = width / numImages;
    return Array.from({ length: numImages }, (_, i) => ({
        start: Math.floor(i * sectionWidth),
        end: Math.floor((i + 1) * sectionWidth),
    }));
}

export default function RoutineProductCard({
                                               product,
                                               onAddToRoutine,   // 👈 NEW
                                               onNavigate,
                                               dragHandleProps,
                                               isAlreadyAdded
                                           }) {

    const [currentImgIdx, setCurrentImgIdx] = useState(0);


    if (!product || !product.variants?.[0]?.images?.length) return null;



    const images = product.variants[0].images.filter((img) =>
        img.image_url.match(/\.(webp|jpe?g|png|gif)$/i)
    );



    /* ---------- Price & Stock ---------- */
    const pricedVariants = product.variants.filter((v) => {
        const price = parseFloat(v.final_price || v.price || 0);
        return !isNaN(price) && price > 0;
    });

    const lowestVariant =
        pricedVariants.length > 0
            ? pricedVariants.reduce((a, b) =>
                parseFloat(a.final_price || a.price) <
                parseFloat(b.final_price || b.price)
                    ? a
                    : b
            )
            : null;

    const lowestPrice = lowestVariant
        ? parseFloat(lowestVariant.final_price || lowestVariant.price)
        : null;

    const showMrp =
        lowestVariant &&
        lowestVariant.mrp_price &&
        parseFloat(lowestVariant.mrp_price) > lowestPrice;

    const totalStock = pricedVariants.reduce(
        (sum, v) => sum + (v.stock || 0),
        0
    );

    const disabled = totalStock === 0 || !pricedVariants.length;

    /* ---------- Events ---------- */
    const handleAdd = (e) => {
        e.stopPropagation();
        if (disabled) return;
        onAddToRoutine?.(product);
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const sections = getImageSections(rect.width, images.length);
        const idx = Math.max(
            0,
            sections.findIndex((s) => x >= s.start && x < s.end)
        );
        setCurrentImgIdx(idx);
    };

    return (
        <motion.div
            className="bg-white rounded-2xl border border-gray-200
             hover:shadow-lg transition overflow-hidden
             flex flex-col h-full"
        >
            <div
                className="relative h-56 bg-gray-100"
                {...dragHandleProps}
            >
                <img
                    src={product.main_image}
                    alt={product.product_name}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                />

                {totalStock === 0 && (
                    <span className="absolute bottom-3 left-3 bg-gray-700 text-white text-xs px-3 py-1 rounded-full">
      Out of Stock
    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 justify-between">
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                    {product.product_name}
                </h3>

                <div className="mb-4 min-h-[50px]">
                    {lowestPrice !== null && (
                        <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                ₹{lowestPrice.toFixed(2)}
              </span>
                            {showMrp && (
                                <span className="text-sm line-through text-gray-400">
                  ₹{parseFloat(lowestVariant.mrp_price).toFixed(2)}
                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* 🔁 Add to Routine */}
                <button
                    onClick={handleAdd}
                    disabled={disabled || isAlreadyAdded}
                    className={`mt-auto w-full py-2.5 rounded-lg text-sm font-medium
    ${
                        disabled || isAlreadyAdded
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white"
                    }
  `}
                >
                    {isAlreadyAdded ? "Added" : "Add to Routine"}
                </button>
            </div>
        </motion.div>
    );
}
