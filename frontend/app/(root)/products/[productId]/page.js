'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/productsSlice';
import { fetchReviews } from '@/store/slices/reviewsSlice';
import { addToCart, openCart, updateCartItemQuantity } from '@/store/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';

import {
    ArrowLeftIcon,
    HeartIcon,
    ShoppingCartIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon,
    MinusIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';

export default function ProductDetailsPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { productId } = useParams();

    const { products, loading } = useSelector((state) => state.products);
    const { items: cartItems } = useSelector((state) => state.cart);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { items: reviews, status: reviewsStatus } = useSelector((state) => state.reviews);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);

    const [product, setProduct] = useState(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    // Shiprocket state
    const [pincode, setPincode] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [checkingDelivery, setCheckingDelivery] = useState(false);
    const [deliveryError, setDeliveryError] = useState('');

    useEffect(() => {
        if (!products.length) dispatch(fetchProducts());
        dispatch(fetchWishlist());
    }, [dispatch, products.length]);

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
                setSelectedMediaIndex(0);
            }
        }
    }, [products, productId]);

    useEffect(() => {
        if (product?.product_id) {
            dispatch(fetchReviews({ productId: product.product_id }));
        }
    }, [dispatch, product]);

    const { averageRating, ratingCounts } = useMemo(() => {
        if (!Array.isArray(reviews) || reviews.length === 0) return { averageRating: 0, ratingCounts: {} };
        const counts = {};
        let sum = 0;
        reviews.forEach(r => {
            const rt = Number(r.ratings) || 0;
            sum += rt;
            counts[rt] = (counts[rt] || 0) + 1;
        });
        return { averageRating: (sum / reviews.length).toFixed(1), ratingCounts: counts };
    }, [reviews]);

    const isYoutubeUrl = (url) => /youtube\.com|youtu\.be/.test(url || '');

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

    const mediaItems = (() => {
        const images = [];
        const videos = [];

        if (Array.isArray(currentVariant.images)) {
            currentVariant.images.forEach((item) => {
                if (item && item.image_url) {
                    if (item.is_video) {
                        videos.push({ type: 'video', url: item.image_url });
                    } else {
                        images.push({ type: 'image', url: item.image_url });
                    }
                }
            });
        }

        if (!images.length) {
            images.push({ type: 'image', url: currentVariant.image_url || product.main_image });
        }

        return [...images, ...videos];
    })();

    const handleVariantClick = (index) => {
        setSelectedVariantIndex(index);
        setSelectedMediaIndex(0);
    };

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

    const cartItem = cartItems.find(
        (item) =>
            item.product_id === product.product_id &&
            item.variant_id === currentVariant.variant_id
    );

    const handleIncreaseQuantity = () => {
        if (!cartItem) return;
        if (cartItem.quantity >= currentVariant.stock) return;
        const id = isAuthenticated ? cartItem.cart_item_id : cartItem.variant_id;
        dispatch(updateCartItemQuantity({ cart_item_id: id, quantity: cartItem.quantity + 1 }));
    };

    const handleDecreaseQuantity = () => {
        if (!cartItem) return;
        if (cartItem.quantity <= 1) return;
        const id = isAuthenticated ? cartItem.cart_item_id : cartItem.variant_id;
        dispatch(updateCartItemQuantity({ cart_item_id: id, quantity: cartItem.quantity - 1 }));
    };

    const handleToggleWishlist = () => {
        if (!isAuthenticated) return;
        
        const variant_id = currentVariant.variant_id;
        const isInWishlist = wishlistItems.some(
            item => item.product_id === product.product_id && item.variant_id === variant_id
        );
        
        if (isInWishlist) {
            dispatch(removeFromWishlist({ product_id: product.product_id, variant_id }));
        } else {
            dispatch(addToWishlist({ product_id: product.product_id, variant_id }));
        }
    };

    const isInWishlist = wishlistItems.some(
        item => item.product_id === product?.product_id && item.variant_id === currentVariant?.variant_id
    );

    const checkDelivery = async () => {
        if (!pincode || pincode.length !== 6) {
            setDeliveryError('Please enter a valid 6-digit pincode');
            return;
        }
        setCheckingDelivery(true);
        setDeliveryError('');
        setDeliveryDate(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shipping/check-serviceability`, {
                pickup_postcode: 641038,
                delivery_postcode: pincode,
                weight: 0.50,
                cod: 1
            });

            if (response.data.success) {
                const date = new Date(response.data.estimated_delivery_date);
                setDeliveryDate(`Estimated delivery by ${date.toDateString()}`);
            } else {
                setDeliveryError('Delivery not available for this pincode');
            }

        } catch (err) {
            setDeliveryError('Could not check delivery. Try again.');
        } finally {
            setCheckingDelivery(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#D8234B] mb-8 transition-colors duration-300"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-12 lg:gap-20">
                    {/* Image Section */}
                    <div className="space-y-5 rounded-2xl p-5 shadow-sm">
                        <div className="relative aspect-square rounded-lg overflow-hidden shadow-inner bg-white transition-opacity duration-500">
                            {mediaItems[selectedMediaIndex].type === 'video' ? (
                                isYoutubeUrl(mediaItems[selectedMediaIndex].url) ? (
                                    <iframe
                                        src={mediaItems[selectedMediaIndex].url.includes('embed') ? mediaItems[selectedMediaIndex].url : mediaItems[selectedMediaIndex].url.replace('watch?v=', 'embed/')}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Product Video"
                                    />
                                ) : (
                                    <video
                                        src={mediaItems[selectedMediaIndex].url}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                )
                            ) : (
                                <img
                                    src={mediaItems[selectedMediaIndex].url}
                                    alt={product.product_name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            )}

                            {mediaItems.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setSelectedMediaIndex((prev) =>
                                                prev === 0 ? mediaItems.length - 1 : prev - 1
                                            )
                                        }
                                        aria-label="Previous media"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#D8234B] hover:text-white shadow-md transition transform duration-300 hover:scale-110"
                                    >
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSelectedMediaIndex((prev) =>
                                                prev === mediaItems.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                        aria-label="Next media"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#D8234B] hover:text-white shadow-md transition transform duration-300 hover:scale-110"
                                    >
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {mediaItems.length > 1 && (
                            <div className="flex justify-center gap-3">
                                {mediaItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedMediaIndex(idx)}
                                        aria-label={`Select media ${idx + 1}`}
                                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border transition-all duration-300 ring-offset-2 ${
                                            selectedMediaIndex === idx
                                                ? 'border-[#D8234B] ring-2 ring-[#D8234B] ring-opacity-60'
                                                : 'border-gray-200 hover:border-[#D8234B]'
                                        }`}
                                    >
                                        {item.type === 'video' ? (
                                            <div className="relative w-full h-full">
                                                {isYoutubeUrl(item.url) ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-black/50 text-white">
                                                        <PlayIcon className="w-7 h-7" />
                                                    </div>
                                                ) : (
                                                    <video
                                                        src={item.url + '#t=0.1'}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                    />
                                                )}
                                                {!isYoutubeUrl(item.url) && (
                                                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                                        <PlayIcon className="w-7 h-7 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <img
                                                src={item.url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details Section */}
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-wide text-[#D8234B]">
                                {product.category?.category_name || 'Uncategorized'}
                            </p>
                            {product.tag && (
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                    {product.tag.tag_name}
                                </p>
                            )}
                            <h1 className="text-4xl font-extralight text-gray-900 tracking-tight">
                                {product.product_name}
                            </h1>
                            <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                            {averageRating > 0 && (
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex items-center text-yellow-400 text-xl select-none" aria-label={`Average rating: ${averageRating} out of 5`}>
                                        {'★'.repeat(Math.round(averageRating))}
                                        {'☆'.repeat(5 - Math.round(averageRating))}
                                    </div>
                                    <span className="text-sm text-gray-600">{averageRating} / 5 ({reviews?.length || 0} reviews)</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-5">
                            <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                                ₹{parseFloat(currentVariant.final_price || currentVariant.price).toFixed(2)}
                            </span>
                            {isAuthenticated && (
                                <button
                                    onClick={handleToggleWishlist}
                                    aria-pressed={isInWishlist}
                                    className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-red-50 transition duration-300"
                                >
                                    {isInWishlist ? (
                                        <HeartIconSolid className="w-6 h-6 text-red-600 animate-pulse" />
                                    ) : (
                                        <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-600" />
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Variants</label>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((variant, idx) => (
                                    <button
                                        key={variant.variant_id}
                                        onClick={() => handleVariantClick(idx)}
                                        disabled={variant.stock === 0}
                                        className={`px-5 py-3 rounded-lg border text-sm font-medium transition duration-300 ${
                                            selectedVariantIndex === idx
                                                ? 'bg-[#D8234B] text-white border-[#D8234B] shadow-lg'
                                                : variant.stock === 0
                                                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#D8234B] hover:bg-red-50'
                                        }`}
                                    >
                                        {variant.variant_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {currentVariant.stock > 0 && currentVariant.stock < 10 && (
                            <p className="text-sm text-amber-600 font-medium">
                                Only {currentVariant.stock} left in stock
                            </p>
                        )}
                        {currentVariant.stock === 0 && (
                            <p className="text-sm text-red-600 font-semibold">Out of stock</p>
                        )}

                        {cartItem ? (
                            <div className="flex items-center gap-4 w-full max-w-md">
                                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden w-full shadow-sm">
                                    <button
                                        onClick={handleDecreaseQuantity}
                                        className="px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors border-r border-gray-300"
                                        aria-label="Decrease quantity"
                                    >
                                        <MinusIcon className="w-6 h-6 text-gray-700" />
                                    </button>
                                    <div className="flex-1 text-center font-semibold text-gray-900 select-none">
                                        {cartItem.quantity}
                                    </div>
                                    <button
                                        onClick={handleIncreaseQuantity}
                                        disabled={cartItem.quantity >= currentVariant.stock}
                                        className="px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors border-l border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Increase quantity"
                                    >
                                        <PlusIcon className="w-6 h-6 text-gray-700" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => dispatch(openCart())}
                                    className="px-8 py-4 bg-[#D8234B] text-white rounded-xl hover:bg-[#b21c3f] transition-colors whitespace-nowrap shadow-md"
                                >
                                    Go to Cart
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 w-full max-w-md">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={currentVariant.stock === 0}
                                    className="flex-1 bg-[#D8234B] hover:bg-[#b21c3f] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-md"
                                    aria-disabled={currentVariant.stock === 0}
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    {currentVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                {isAuthenticated && (
                                    <button
                                        onClick={handleToggleWishlist}
                                        className="px-5 py-4 border border-gray-300 rounded-xl hover:border-[#D8234B] hover:bg-red-50 transition-colors"
                                        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        {isInWishlist ? (
                                            <HeartIconSolid className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <HeartIcon className="w-6 h-6 text-gray-700" />
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Shiprocket Delivery */}
                        <div className="pt-6 border-t border-gray-200 max-w-md">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Check Delivery Date</h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter Pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D8234B] focus:border-transparent shadow-sm"
                                    aria-label="Enter pincode"
                                />
                                <button
                                    onClick={checkDelivery}
                                    disabled={checkingDelivery || pincode.length !== 6}
                                    className={`px-5 py-3 bg-[#D8234B] text-white text-sm font-semibold rounded-lg hover:bg-[#b21c3f] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors shadow-md`}
                                >
                                    {checkingDelivery ? 'Checking...' : 'Check'}
                                </button>
                            </div>
                            {deliveryError && (
                                <p className="mt-3 text-sm text-red-600 font-medium">{deliveryError}</p>
                            )}
                            {deliveryDate && (
                                <p className="mt-3 text-sm text-green-600 font-semibold">{deliveryDate}</p>
                            )}
                        </div>

                        {/* Other Variants */}
                        {product.variants.length > 1 && (
                            <div className="pt-8 border-t border-gray-200 max-w-md">
                                <h3 className="text-sm font-semibold text-gray-700 mb-5">Other Variants</h3>
                                <div className="space-y-3">
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
                                                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-shadow shadow-sm group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden">
                                                        {(() => {
                                                            const previewImg = (() => {
                                                                if (Array.isArray(variant.images) && variant.images.length) {
                                                                    const firstImage = variant.images.find(img => !img.is_video) || variant.images[0];
                                                                    return firstImage?.image_url;
                                                                }
                                                                return variant.image_url || product.main_image;
                                                            })();
                                                            return (
                                                                <img
                                                                    src={previewImg}
                                                                    alt={variant.variant_name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    loading="lazy"
                                                                />
                                                            );
                                                        })()}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#D8234B]">
                                                        {variant.variant_name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        ₹{parseFloat(variant.final_price || variant.price).toFixed(2)}
                                                    </p>
                                                    {variant.stock === 0 && (
                                                        <span className="text-xs text-red-600 font-semibold">
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

                {/* Details & Benefits Accordions */}
                <div className="mt-14 space-y-8 max-w-6xl mx-auto">
                    <AccordionGroup>
                        {product.key_ingredients && (
                            <AccordionItem title="Key Ingredients">
                                <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-line">{product.key_ingredients}</div>
                            </AccordionItem>
                        )}
                        {product.know_about_product && (
                            <AccordionItem title="Know About Product">
                                {isYoutubeUrl(product.know_about_product) ? (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden shadow">
                                        <iframe
                                            src={product.know_about_product.includes('embed') ? product.know_about_product : product.know_about_product.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title="Product Information Video"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{product.know_about_product}</p>
                                )}
                            </AccordionItem>
                        )}
                        {Array.isArray(product.benefits) && product.benefits.length > 0 && (
                            <AccordionItem title="Benefits">
                                <ul className="space-y-4">
                                    {product.benefits.map((b, i) => (
                                        <li key={i} className="border-b border-gray-100 pb-3">
                                            <p className="font-semibold text-gray-900 mb-1">• {b.benefit_title}</p>
                                            <p className="text-sm text-gray-600">{b.benefit_description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionItem>
                        )}
                    </AccordionGroup>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 border-t border-gray-200 pt-12 max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-light tracking-tight text-gray-900">Customer Reviews</h2>
                        {isAuthenticated && (
                            <a href="#write-review" className="text-sm text-[#D8234B] underline hover:text-[#b21c3f]">Write a review</a>
                        )}
                    </div>
                    {reviewsStatus === 'idle' && <p className="text-sm text-gray-500">Loading reviews...</p>}
                    <ReviewList reviews={reviews} />
                    {isAuthenticated && user && (
                        <div id="write-review" className="mt-10">
                            <h3 className="text-lg font-medium mb-4 text-gray-900">Share Your Experience</h3>
                            <ReviewForm productId={product.product_id} token={null} userId={user.user_id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Accordion Components
function AccordionGroup({ children }) {
    return <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">{children}</div>;
}

function AccordionItem({ title, children }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="p-6">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between text-left text-gray-900 text-lg font-semibold hover:text-[#D8234B] transition-colors"
                aria-expanded={open}
                aria-controls={`${title}-content`}
            >
                <span>{title}</span>
                <span className="ml-4 text-gray-400 select-none" aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            {open && <div id={`${title}-content`} className="mt-5">{children}</div>}
        </div>
    );
}
