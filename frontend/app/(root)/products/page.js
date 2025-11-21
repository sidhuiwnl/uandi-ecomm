'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchProducts } from '@/store/productsSlice';
import { addToCart, openCart } from '@/store/slices/cartSlice';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    CubeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import ProductCard from '@/components/ProductCard';

export default function AllProductsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();
    const role = params?.role || 'user';

    const { products, loading: reduxLoading } = useSelector(
        (state) => state.products
    );
    const { isAuthenticated } = useSelector((state) => state.auth);

    const tags = useSelector(state => state.products.tags || []);


    const [localLoading, setLocalLoading] = useState(true);
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlist, setWishlist] = useState([]);

    // 🎯 Professional Filter States
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('featured');

    const loadProducts = () => {
        setLocalLoading(true);
        dispatch(fetchProducts()).then((result) => {
            if (fetchProducts.rejected.match(result)) {
                console.error('Fetch error:', result.payload);
            }
            setLocalLoading(false);
        });
    };

    useEffect(() => {
        loadProducts();
    }, [dispatch]);

    const openImageGallery = (imageUrl) => {
        setSelectedImages([{ image_url: imageUrl }]);
        setShowImageGallery(true);
    };

    const toggleWishlist = (productId) => {
        setWishlist((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const isLoading = reduxLoading || localLoading;

    // 🧠 Get unique categories and max price
    useEffect(() => {
        if (products.length > 0) {
            const categories = [
                ...new Set(
                    products
                        .filter((p) => p.category?.category_name)
                        .map((p) => p.category.category_name)
                ),
            ];
            const max = Math.max(
                ...products.flatMap((p) =>
                    p.variants?.map((v) =>
                        parseFloat(v.final_price || v.price || 0)
                    ) || [0]
                )
            );
            setMaxPrice(max);
            setPriceRange([0, max]);
        }
    }, [products]);

    // 🎯 Professional Filter Functions
    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, maxPrice]);
        setSearchQuery('');
        setSortBy('featured');
    };

    // 🧮 Filtered & Sorted Products
    const filteredProducts = products?.filter((product) => {
        const matchesSearch =
            product.product_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            product.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(product.category?.category_name);

        const lowestPrice =
            product.variants?.length > 0
                ? Math.min(
                    ...product.variants.map((v) =>
                        parseFloat(v.final_price || v.price || 0)
                    )
                )
                : 0;

        const matchesPrice =
            lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

        return matchesSearch && matchesCategory && matchesPrice && product.is_active;
    }) || [];

    // 🎯 Sorting Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = Math.min(...a.variants.map(v => parseFloat(v.final_price || v.price || 0)));
        const priceB = Math.min(...b.variants.map(v => parseFloat(v.final_price || v.price || 0)));

        switch (sortBy) {
            case 'price-low-high':
                return priceA - priceB;
            case 'price-high-low':
                return priceB - priceA;
            case 'name-a-z':
                return a.product_name.localeCompare(b.product_name);
            case 'name-z-a':
                return b.product_name.localeCompare(a.product_name);
            case 'featured':
            default:
                return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading products...</p>
                </div>
            </div>
        );
    }

    const categories = [
        ...new Set(
            products
                .filter((p) => p.category?.category_name)
                .map((p) => p.category.category_name)
        ),
    ];

    const activeProducts = products?.filter((p) => p.is_active)?.length || 0;
    const activeFiltersCount = selectedCategories.length + (priceRange[1] < maxPrice ? 1 : 0);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href={`/${role}/console/dashboard`}>
                            <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                <ArrowLeftIcon className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">Our Collection</h1>
                            <p className="text-gray-500 mt-2">
                                Discover {activeProducts} curated products
                            </p>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-gray-600">
                            Showing {sortedProducts.length} of {activeProducts} products
                        </div>
                    </div>
                </div>

                {/* 🎯 Professional Filters Section */}
                <div className="mb-8 space-y-4">
                    {/* Main Filter Bar */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                            {/* Search */}
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search products by name or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 cursor-pointer"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price-low-high">Price: Low to High</option>
                                        <option value="price-high-low">Price: High to Low</option>
                                        <option value="name-a-z">Name: A to Z</option>
                                        <option value="name-z-a">Name: Z to A</option>
                                    </select>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Filter Toggle Button */}
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-200"
                                >
                                    <FunnelIcon className="w-4 h-4" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-white text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                {/* Clear Filters */}
                                {(selectedCategories.length > 0 || priceRange[1] < maxPrice) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 🎯 Expanded Filter Panel */}
                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Category Filter */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                                                    Categories
                                                </h3>
                                                <div className="space-y-2">
                                                    {categories.map((category) => (
                                                        <label
                                                            key={category}
                                                            className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(category)}
                                                                onChange={() => toggleCategory(category)}
                                                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                                            />
                                                            <span className="group-hover:text-gray-900 transition-colors duration-200">
                                                                {category}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Price Range Filter */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                                                    Price Range
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>₹{priceRange[0].toLocaleString()}</span>
                                                        <span>₹{priceRange[1].toLocaleString()}</span>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max={maxPrice}
                                                            value={priceRange[0]}
                                                            onChange={(e) =>
                                                                setPriceRange([Number(e.target.value), priceRange[1]])
                                                            }
                                                            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900"
                                                        />
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max={maxPrice}
                                                            value={priceRange[1]}
                                                            onChange={(e) =>
                                                                setPriceRange([priceRange[0], Number(e.target.value)])
                                                            }
                                                            className="absolute w-full h-2 bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900"
                                                        />
                                                        <div className="h-2 bg-gray-200 rounded-lg">
                                                            <div
                                                                className="h-2 bg-gray-900 rounded-lg"
                                                                style={{
                                                                    marginLeft: `${(priceRange[0] / maxPrice) * 100}%`,
                                                                    width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategories.length > 0 || priceRange[1] < maxPrice) && (
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map(category => (
                                <span
                                    key={category}
                                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm"
                                >
                                    {category}
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="hover:text-gray-900 transition-colors"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {priceRange[1] < maxPrice && (
                                <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm">
                                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                                    <button
                                        onClick={() => setPriceRange([0, maxPrice])}
                                        className="hover:text-gray-900 transition-colors"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                {sortedProducts.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {sortedProducts.map(product => (
                            <ProductCard
                                key={product.product_id}
                                product={product}
                                isAuthenticated={isAuthenticated}
                                inWishlist={wishlist.includes(product.product_id)}
                                onToggleWishlist={toggleWishlist}
                                onNavigate={(id) => router.push(`/products/${id}`)}
                                onAddToCart={({ product: p, variant }) => {
                                    const cartItem = {
                                        product_id: p.product_id,
                                        product_name: p.product_name,
                                        variant_id: variant.variant_id,
                                        variant_name: variant.variant_name,
                                        price: parseFloat(variant.final_price || variant.price),
                                        quantity: 1,
                                        main_image: p.main_image,
                                    };
                                    dispatch(addToCart(cartItem));
                                    dispatch(openCart());
                                }}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                        <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-light text-gray-900 mb-2">
                            No products found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery || selectedCategories.length > 0 || priceRange[1] < maxPrice
                                ? 'Try adjusting your filters or search terms'
                                : 'No products are currently available'}
                        </p>
                        {(searchQuery || selectedCategories.length > 0 || priceRange[1] < maxPrice) && (
                            <button
                                onClick={clearAllFilters}
                                className="text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* {showImageGallery && selectedImages.length > 0 && (
                <ImageGalleryModal
                    images={selectedImages}
                    productName="Product Image"
                    onClose={() => setShowImageGallery(false)}
                />
            )} */}
        </div>
    );
}