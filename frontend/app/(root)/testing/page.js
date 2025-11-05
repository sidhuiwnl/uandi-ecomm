'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeftIcon,
    PlayIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

// Sample data - replace with actual API call
const sampleProduct = {
    year: "2024",
    collection: "New collection",
    product_name: "Black leather",
    sku: "8281/420",
    price: 3200,
    category: "LEATHER EFFECT PUFFER JACKET",
    main_image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    video_url: "https://example.com/video.mp4",
    thumbnail_images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200",
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=200",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200",
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=200"
    ],
    sizes: ["34", "36", "38"],
    similar_products: [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200",
            name: "Brown Suede Jacket"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=200",
            name: "Navy Blue Jacket"
        }
    ],
    tabs: ["INFO", "SOCIAL CONNECTS", "CLASSICS"],
    reviews_rating: 0
};

export default function ProductVariantDetailsPage() {
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState("34");
    const [selectedTab, setSelectedTab] = useState("INFO");

    return (
        <div className="min-h-screen bg-white">
            {/* Main Container - no padding for full-screen */}
            <div className="flex h-screen">
                {/* Left Side - Image (60%) */}
                <div className="w-[60%] relative bg-gray-50 flex items-center justify-center">
                    {/* Back button - absolute top-left */}
                    <button
                        onClick={() => router.back()}
                        className="absolute top-8 left-8 z-10 text-black text-sm font-medium"
                    >
                        ← Back
                    </button>

                    {/* Main Product Image - centered with padding */}
                    <div className="relative w-full h-full flex items-center justify-center p-16">
                        <img
                            src={sampleProduct.main_image}
                            alt={sampleProduct.product_name}
                            className="max-w-full max-h-full object-contain"
                        />

                        {/* Watch Video Button - absolute top-right */}
                        <button className="absolute top-8 right-8 bg-white px-4 py-2 rounded text-sm flex items-center gap-2 shadow-sm border border-gray-200">
                            <PlayIcon className="w-4 h-4" />
                            Watch video
                        </button>
                    </div>

                    {/* Thumbnail Bar - absolute bottom, black background */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black py-6 px-8">
                        <div className="flex gap-4">
                            {/* Play Button - first in row */}
                            <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                <PlayIcon className="w-6 h-6 text-black" />
                            </button>

                            {/* Thumbnail Images */}
                            {sampleProduct.thumbnail_images.map((img, index) => (
                                <button
                                    key={index}
                                    className="w-16 h-16 rounded overflow-hidden flex-shrink-0"
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Product Details (40%) */}
                <div className="w-[40%] bg-white overflow-y-auto">
                    {/* Product Info Section */}
                    <div className="p-8 pb-6">
                        {/* Year and Collection */}
                        <div className="mb-8">
                            <p className="text-gray-400 text-sm mb-1">{sampleProduct.year}</p>
                            <h2 className="text-xl font-light text-gray-900">{sampleProduct.collection}</h2>
                        </div>

                        {/* Product Name and Price */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{sampleProduct.product_name}</h1>
                            <p className="text-3xl font-light text-gray-900">${sampleProduct.price.toLocaleString()}</p>
                            <p className="text-gray-400 text-sm mt-1">{sampleProduct.sku}</p>
                        </div>

                        {/* Sizes */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                {sampleProduct.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                            selectedSize === size
                                                ? 'bg-black text-white shadow-md'
                                                : 'bg-white text-black border border-gray-300 hover:border-gray-500'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                                <button className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium bg-white text-black border border-gray-300 hover:border-gray-500">
                                    +
                                </button>
                            </div>
                        </div>

                        {/* What others say */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">What others say?</h3>
                                <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors">
                                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="border-t border-gray-200 pt-6">
                            <p className="text-sm font-medium text-gray-900 tracking-wide uppercase">{sampleProduct.category}</p>
                        </div>
                    </div>

                    {/* Video Section */}
                    <div className="px-8 py-6">
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                            <img
                                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                            />
                            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <PlayIcon className="w-8 h-8 ml-0.5 text-black" />
                            </button>
                            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded text-xs text-gray-600">
                                Watch video
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="px-8 py-6 border-t border-gray-200">
                        <div className="flex border-b border-gray-200">
                            {sampleProduct.tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`flex-1 pb-3 text-xs font-medium text-gray-500 tracking-wider transition-all ${
                                        selectedTab === tab
                                            ? 'text-black border-b-2 border-black'
                                            : 'hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="pt-6">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Premium quality leather jacket with modern design and perfect fit. Crafted from high-quality materials for ultimate comfort and durability.
                            </p>
                        </div>
                    </div>

                    {/* Similar Products Section */}
                    <div className="px-8 py-6 border-t border-gray-200">
                        <h3 className="text-xs font-medium text-gray-900 tracking-wider uppercase mb-6">You may also like</h3>
                        <div className="space-y-4">
                            {sampleProduct.similar_products.map((product) => (
                                <button
                                    key={product.id}
                                    className="w-full flex items-center gap-4 group"
                                >
                                    <div className="w-24 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}