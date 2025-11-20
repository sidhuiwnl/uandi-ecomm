'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/productsSlice';
import { addToCart, openCart } from '@/store/slices/cartSlice';
import {
    ArrowLeftIcon,
    HeartIcon,
    ShoppingCartIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function ProductDetailsPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { productId } = useParams();

    const { products, loading } = useSelector((state) => state.products);

    const [product, setProduct] = useState(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Load products (if not already loaded)
    useEffect(() => {
        if (!products.length) dispatch(fetchProducts());
    }, [dispatch, products.length]);

    // Set current product + lowest priced variant
    useEffect(() => {
        if (products.length && productId) {
            const found = products.find(
                (p) => p.product_id === parseInt(productId)
            );
            if (found) {
                const lowestIndex = found.variants.reduce(
                    (lowestIdx, curr, idx, arr) =>
                        parseFloat(curr.final_price || curr.price) <
                        parseFloat(arr[lowestIdx].final_price || arr[lowestIdx].price)
                            ? idx
                            : lowestIdx,
                    0
                );
                setProduct(found);
                setSelectedVariantIndex(lowestIndex);
                setSelectedImageIndex(0);
            }
        }
    }, [products, productId]);

    if (loading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading product...</p>
                </div>
            </div>
        );
    }

    const currentVariant = product.variants[selectedVariantIndex];
    const variantImages =
        Array.isArray(currentVariant.images) && currentVariant.images.length
            ? currentVariant.images
            : [currentVariant.image_url || product.main_image];

    console.log("variantImages", variantImages);

    // Switch variant
    const handleVariantClick = (index) => {
        setSelectedVariantIndex(index);
        setSelectedImageIndex(0);
    };

    // Add to cart
    const handleAddToCart = () => {
        const cartItem = {
            product_id: product.product_id,
            product_name: product.product_name,
            variant_id: currentVariant.variant_id,
            variant_name: currentVariant.variant_name,
            price: parseFloat(currentVariant.final_price || currentVariant.price),
            quantity: 1,
            main_image: product.main_image,
        };
        dispatch(addToCart(cartItem));
        dispatch(openCart());
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors duration-200"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>

                {/* Grid Layout (Image + Details) */}
                <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-10 lg:gap-14">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
                            <div className="relative aspect-[4/5]">
                                <img
                                    src={variantImages[selectedImageIndex].image_url}
                                    alt={product.product_name}
                                    className="w-full h-full object-cover transition-opacity duration-500"
                                />

                                {/* Prev / Next buttons */}
                                {variantImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setSelectedImageIndex((prev) =>
                                                    prev === 0 ? variantImages.length - 1 : prev - 1
                                                )
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition-all duration-200 hover:scale-105"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setSelectedImageIndex((prev) =>
                                                    prev === variantImages.length - 1 ? 0 : prev + 1
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition-all duration-200 hover:scale-105"
                                        >
                                            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {variantImages.length > 1 && (
                            <div className="flex justify-center gap-3">
                                {variantImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border transition-all duration-200 ${
                                            selectedImageIndex === idx
                                                ? 'border-gray-900 ring-2 ring-gray-900 ring-opacity-10'
                                                : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details Section */}
                    <div className="flex flex-col justify-center space-y-6">
                        {/* Product Info */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
                                    {product.category?.category_name || 'Uncategorized'}
                                </p>
                                <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                    {currentVariant.variant_name}
                                </h1>
                                {currentVariant.sku && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        SKU: {currentVariant.sku}
                                    </p>
                                )}
                            </div>

                            {/* Price + Wishlist */}
                            <div className="flex items-center gap-4">
                <span className="text-2xl font-normal text-gray-900">
                  ₹{parseFloat(currentVariant.final_price || currentVariant.price).toFixed(2)}
                </span>
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                                >
                                    {isWishlisted ? (
                                        <HeartIconSolid className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <HeartIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Variant Selector */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Variants
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((variant, idx) => (
                                    <button
                                        key={variant.variant_id}
                                        onClick={() => handleVariantClick(idx)}
                                        disabled={variant.stock === 0}
                                        className={`px-4 py-2.5 rounded-lg border text-sm font-normal transition-all duration-200 ${
                                            selectedVariantIndex === idx
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                : variant.stock === 0
                                                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {variant.variant_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stock Info */}
                        {currentVariant.stock > 0 && currentVariant.stock < 10 && (
                            <p className="text-sm text-amber-600">
                                Only {currentVariant.stock} left in stock
                            </p>
                        )}
                        {currentVariant.stock === 0 && (
                            <p className="text-sm text-red-600">Out of stock</p>
                        )}

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={currentVariant.stock === 0}
                            className="w-full max-w-sm bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:shadow-lg"
                        >
                            <ShoppingCartIcon className="w-5 h-5" />
                            {currentVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>

                        {/* Other Variants */}
                        {product.variants.length > 1 && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Other Variants
                                </h3>
                                <div className="space-y-2">
                                    {product.variants
                                        .filter((_, idx) => idx !== selectedVariantIndex)
                                        .map((variant) => (
                                            <button
                                                key={variant.variant_id}
                                                onClick={() =>
                                                    handleVariantClick(
                                                        product.variants.findIndex(
                                                            (v) => v.variant_id === variant.variant_id
                                                        )
                                                    )
                                                }
                                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src={variant.image_url || product.main_image}
                                                            alt={variant.variant_name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                        />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                                                            {variant.variant_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        ₹{parseFloat(variant.final_price || variant.price).toFixed(2)}
                                                    </p>
                                                    {variant.stock === 0 && (
                                                        <span className="text-xs text-red-500 font-medium">
                              Out of Stock
                            </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}