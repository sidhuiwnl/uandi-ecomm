'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeftIcon,
    HeartIcon,
    ShoppingCartIcon,
    StarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Sample data - replace with actual API call
const sampleProduct = {
    product_id: 1,
    product_name: "Black Leather Jacket",
    description: "Premium quality leather jacket with modern design",
    category: "Jackets",
    main_image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    variants: [
        {
            variant_id: 1,
            size: "34",
            color: "Black",
            price: 3200,
            final_price: 3200,
            stock: 5,
            sku: "BL-34-BLK",
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
                "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"
            ]
        },
        {
            variant_id: 2,
            size: "36",
            color: "Black",
            price: 3200,
            final_price: 3200,
            stock: 8,
            sku: "BL-36-BLK",
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
                "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800"
            ]
        },
        {
            variant_id: 3,
            size: "38",
            color: "Black",
            price: 3200,
            final_price: 3200,
            stock: 3,
            sku: "BL-38-BLK",
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
            ]
        },
        {
            variant_id: 4,
            size: "40",
            color: "Black",
            price: 3200,
            final_price: 3200,
            stock: 0,
            sku: "BL-40-BLK",
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
            ]
        }
    ],
    rating: 4.5,
    reviews_count: 128,
    video_url: "https://example.com/video.mp4"
};

export default function ProductVariantDetailsPage() {
    const router = useRouter();
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const currentVariant = sampleProduct.variants[selectedVariantIndex];
    const currentImages = currentVariant.images;

    const handlePreviousImage = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? currentImages.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) =>
            prev === currentImages.length - 1 ? 0 : prev + 1
        );
    };

    const handleVariantClick = (index) => {
        setSelectedVariantIndex(index);
        setSelectedImageIndex(0);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Products
                </button>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Side - Image Gallery */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Main Image */}
                            <div className="relative aspect-square bg-gray-100">
                                <img
                                    src={currentImages[selectedImageIndex]}
                                    alt={sampleProduct.product_name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Navigation Arrows */}
                                {currentImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePreviousImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5 text-gray-900" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                        >
                                            <ChevronRightIcon className="w-5 h-5 text-gray-900" />
                                        </button>
                                    </>
                                )}

                                {/* Video Badge */}
                                {sampleProduct.video_url && (
                                    <button className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-medium text-gray-900 flex items-center gap-1.5 shadow-sm transition-all">
                                        <PlayIcon className="w-4 h-4" />
                                        Watch video
                                    </button>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            {currentImages.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto">
                                    {currentImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImageIndex === index
                                                    ? 'border-gray-900'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`View ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info Below Image (Mobile) */}
                        <div className="mt-6 lg:hidden">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{sampleProduct.category}</p>
                                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                            {sampleProduct.product_name}
                                        </h1>
                                        <p className="text-sm text-gray-600 mb-3">{currentVariant.sku}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        {isWishlisted ? (
                                            <HeartIconSolid className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <HeartIcon className="w-6 h-6 text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            i < Math.floor(sampleProduct.rating) ? (
                                                <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
                                            ) : (
                                                <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                                            )
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {sampleProduct.rating} ({sampleProduct.reviews_count})
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ₹{currentVariant.final_price.toLocaleString()}
                                    </span>
                                </div>

                                {/* Size Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        Select Size
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {sampleProduct.variants.map((variant, index) => (
                                            <button
                                                key={variant.variant_id}
                                                onClick={() => handleVariantClick(index)}
                                                disabled={variant.stock === 0}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                    selectedVariantIndex === index
                                                        ? 'bg-gray-900 text-white border-gray-900'
                                                        : variant.stock === 0
                                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                                                }`}
                                            >
                                                {variant.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stock Status */}
                                {currentVariant.stock > 0 && currentVariant.stock < 10 && (
                                    <p className="text-sm text-orange-600 mb-4">
                                        Only {currentVariant.stock} left in stock
                                    </p>
                                )}
                                {currentVariant.stock === 0 && (
                                    <p className="text-sm text-red-600 mb-4">Out of stock</p>
                                )}

                                {/* Add to Cart */}
                                <button
                                    disabled={currentVariant.stock === 0}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    {currentVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Product Details & Variants */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Product Info (Desktop) */}
                        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">{sampleProduct.category}</p>
                                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                        {sampleProduct.product_name}
                                    </h1>
                                    <p className="text-sm text-gray-600 mb-3">{currentVariant.sku}</p>
                                </div>
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    {isWishlisted ? (
                                        <HeartIconSolid className="w-6 h-6 text-red-500" />
                                    ) : (
                                        <HeartIcon className="w-6 h-6 text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        i < Math.floor(sampleProduct.rating) ? (
                                            <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
                                        ) : (
                                            <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                                        )
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {sampleProduct.rating} ({sampleProduct.reviews_count})
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    ₹{currentVariant.final_price.toLocaleString()}
                                </span>
                            </div>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Select Size
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {sampleProduct.variants.map((variant, index) => (
                                        <button
                                            key={variant.variant_id}
                                            onClick={() => handleVariantClick(index)}
                                            disabled={variant.stock === 0}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                selectedVariantIndex === index
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : variant.stock === 0
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                                            }`}
                                        >
                                            {variant.size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock Status */}
                            {currentVariant.stock > 0 && currentVariant.stock < 10 && (
                                <p className="text-sm text-orange-600 mb-4">
                                    Only {currentVariant.stock} left in stock
                                </p>
                            )}
                            {currentVariant.stock === 0 && (
                                <p className="text-sm text-red-600 mb-4">Out of stock</p>
                            )}

                            {/* Add to Cart */}
                            <button
                                disabled={currentVariant.stock === 0}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                {currentVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>

                        {/* Additional Info Tabs */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="border-b border-gray-200">
                                <nav className="flex">
                                    <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
                                        INFO
                                    </button>
                                    <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent">
                                        SOCIAL CONNECTS
                                    </button>
                                    <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent">
                                        CLASSICS
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {sampleProduct.description}
                                </p>
                            </div>
                        </div>

                        {/* Other Variants Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">
                                You May Also Like
                            </h3>
                            <div className="space-y-3">
                                {sampleProduct.variants
                                    .filter((_, index) => index !== selectedVariantIndex)
                                    .slice(0, 3)
                                    .map((variant, index) => (
                                        <button
                                            key={variant.variant_id}
                                            onClick={() => handleVariantClick(
                                                sampleProduct.variants.findIndex(v => v.variant_id === variant.variant_id)
                                            )}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all group"
                                        >
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={variant.images[0]}
                                                    alt={`Size ${variant.size}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {sampleProduct.product_name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Size: {variant.size}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                                    ₹{variant.final_price.toLocaleString()}
                                                </p>
                                            </div>
                                            {variant.stock === 0 && (
                                                <span className="text-xs text-red-600 font-medium">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* What Others Say Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    What others say?
                                </h3>
                                <button className="text-sm text-gray-600 hover:text-gray-900">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIconSolid key={i} className="w-3 h-3 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Great quality and fit. Highly recommended!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}