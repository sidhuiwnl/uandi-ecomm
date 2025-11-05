'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchProducts } from '@/store/productsSlice';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    PhotoIcon,
    CubeIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ListBulletIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import { motion } from 'framer-motion';

export default function AllProductsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();
    const role = params?.role || 'user';

    const { products, loading: reduxLoading } = useSelector(state => state.products);

    const [localLoading, setLocalLoading] = useState(true);
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('active'); // Default to active only for users
    const [wishlist, setWishlist] = useState([]);

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
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const isLoading = reduxLoading || localLoading;

    // Filter products - only show active products by default for users
    const filteredProducts = products?.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && product.is_active);
        return matchesSearch && matchesStatus;
    }) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading products...</p>
                </div>
            </div>
        );
    }

    const activeProducts = products?.filter(p => p.is_active)?.length || 0;
    const categories = [...new Set(products?.filter(p => p.is_active).map(p => p.category?.category_name))].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href={`/${role}/console/dashboard`}>
                            <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                <ArrowLeftIcon className="w-4 h-4" />
                                Back
                            </button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {activeProducts} products available
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Available Products</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{activeProducts}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <CubeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Categories</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{categories.length}</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <Squares2X2Icon className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6">
                    <div className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                                >
                                    <Squares2X2Icon className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                                >
                                    <ListBulletIcon className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {filteredProducts.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => {
                                const lowestPrice = product.variants?.length > 0
                                    ? Math.min(...product.variants.map(v => parseFloat(v.final_price || v.price || 0)))
                                    : 0;
                                const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                                const isInWishlist = wishlist.includes(product.product_id);

                                return (
                                    <motion.div
                                        key={product.product_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group relative"
                                        onClick={() => router.push(`/${role}/console/product-management/product-details/${product.product_id}`)}
                                    >
                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(product.product_id);
                                            }}
                                            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all"
                                        >
                                            {isInWishlist ? (
                                                <HeartIconSolid className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <HeartIcon className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>

                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
                                            <img
                                                src={product.main_image || '/placeholder.svg'}
                                                alt={product.product_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openImageGallery(product.main_image);
                                                }}
                                                className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <PhotoIcon className="w-4 h-4 text-gray-600" />
                                            </button>

                                            {totalStock < 10 && totalStock > 0 && (
                                                <div className="absolute bottom-3 left-3">
                                                    <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded">
                                                        Only {totalStock} left
                                                    </span>
                                                </div>
                                            )}
                                            {totalStock === 0 && (
                                                <div className="absolute bottom-3 left-3">
                                                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {product.category?.category_name || 'Uncategorized'}
                                                </p>
                                                <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                                                    {product.product_name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xl font-semibold text-gray-900">
                                                    ₹{lowestPrice.toFixed(2)}
                                                </span>
                                                {product.variants?.length > 1 && (
                                                    <span className="text-xs text-gray-500">
                                                        {product.variants.length} variants
                                                    </span>
                                                )}
                                            </div>

                                            {/* View Details Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/${role}/console/product-management/product-details/${product.product_id}`);
                                                }}
                                                className="w-full py-2 px-4 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                disabled={totalStock === 0}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Category</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
                                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.map((product) => {
                                        const lowestPrice = product.variants?.length > 0
                                            ? Math.min(...product.variants.map(v => parseFloat(v.final_price || v.price || 0)))
                                            : 0;
                                        const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                                        const isInWishlist = wishlist.includes(product.product_id);

                                        return (
                                            <tr
                                                key={product.product_id}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => router.push(`/${role}/console/product-management/product-details/${product.product_id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={product.main_image || '/placeholder.svg'}
                                                            alt={product.product_name}
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                            onError={(e) => {
                                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23f3f4f6"/%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                                                            <p className="text-xs text-gray-500">{product.variants?.length || 0} variants</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {product.category?.category_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    ₹{lowestPrice.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {totalStock > 0 ? (
                                                        <span className="text-sm text-gray-600">{totalStock}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded">
                                                                Out of Stock
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleWishlist(product.product_id);
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                                        >
                                                            {isInWishlist ? (
                                                                <HeartIconSolid className="w-5 h-5 text-red-500" />
                                                            ) : (
                                                                <HeartIcon className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/${role}/console/product-management/product-details/${product.product_id}`);
                                                            }}
                                                            className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'No products are currently available'}
                        </p>
                    </div>
                )}
            </div>


            {showImageGallery && selectedImages.length > 0 && (
                <ImageGalleryModal
                    images={selectedImages}
                    productName="Product Image"
                    onClose={() => setShowImageGallery(false)}
                />
            )}
        </div>
    );
}