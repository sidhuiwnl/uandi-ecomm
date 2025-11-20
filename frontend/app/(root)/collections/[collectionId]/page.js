"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCollectionProducts } from "@/store/collectionsSlice";
import { addToCart } from "@/store/slices/cartSlice"; // Import addToCart action
import { useParams } from "next/navigation";
import Link from "next/link";

export default function Page() {

    const getLowestPriceVariant = (product) => {
        if (!product.variants || product.variants.length === 0) {
            // No variants, no price
            return {
                variant_id: product.product_id,
                price: null
            };
        }

        // Normalize variants with fallback
        const variantList = product.variants.map(v => ({
            variant_id: v.variant_id,
            price: v.final_price || v.price || null
        }));

        // Filter out variants without price
        const validVariants = variantList.filter(v => v.price !== null);

        if (validVariants.length === 0) {
            return {
                variant_id: product.product_id,
                price: null
            };
        }

        // Return variant with the lowest price
        return validVariants.reduce((min, v) => v.price < min.price ? v : min);
    };



    const { collectionId } = useParams();
    const dispatch = useDispatch();

    const { selectedCollection, loading, error } = useSelector(
        (state) => state.collections
    );

    const { items: cartItems } = useSelector((state) => state.cart); // Get cart items

    const collectionData = selectedCollection?.collection;
    const products = selectedCollection?.products || [];

    useEffect(() => {
        if (collectionId) {
            dispatch(getCollectionProducts(collectionId));
        }
    }, [dispatch, collectionId]);

    // Add to Cart Handler
    const handleAddToCart = (product) => {
        const lowestVariant = getLowestPriceVariant(product);

        if (!lowestVariant.price) {
            alert("Product price not available");
            return;
        }

        const cartData = {
            product_id: product.product_id,
            variant_id: lowestVariant.variant_id,
            quantity: 1,
            price: lowestVariant.price,
            main_image: product.main_image,
            source_collection_id: collectionId
        };

        console.log("Adding to cart:", cartData);
        dispatch(addToCart(cartData));
    };


    // Check if product is already in cart
    const isInCart = (productId, variantId) => {
        return cartItems.some(item =>
            item.product_id === productId && item.variant_id === variantId
        );
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* ERROR STATE */}
            {error && (
                <p className="text-center text-red-500 text-lg py-4">{error}</p>
            )}

            {/* HEADER */}
            <div className="mb-6">
                {loading ? (
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Loading…
                    </h1>
                ) : (
                    <h1 className="text-3xl font-semibold text-neutral-900">
                        {collectionData?.collection_name}
                    </h1>
                )}

                {!loading && (
                    <p className="text-sm text-neutral-500 mt-1">
                        {products.length} product(s)
                    </p>
                )}
            </div>

            {/* LOADING */}
            {loading && (
                <p className="text-center text-gray-500 text-lg py-6">
                    Fetching products...
                </p>
            )}

            {/* EMPTY */}
            {!loading && products.length === 0 && (
                <p className="text-center text-gray-500 py-10">
                    No products in this collection.
                </p>
            )}

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {products.map((product) => {
                    const lowestPrice = getLowestPriceVariant(product).price;
                    const alreadyInCart = isInCart(product.product_id, getLowestPriceVariant(product).variant_id);

                    return (
                        <div
                            key={product.product_id}
                            className="
                                bg-white
                                border border-gray-200
                                rounded-xl
                                shadow-sm
                                hover:shadow-md
                                hover:scale-[1.02]
                                transition-all
                                flex flex-col
                            "
                        >
                            {/* Clickable Image + Product Info */}
                            <Link
                                href={`/product/${product.product_id}`}
                                className="flex-1 cursor-pointer"
                            >
                                {/* IMAGE */}
                                <div className="h-40 bg-gray-100 rounded-t-xl overflow-hidden">
                                    <img
                                        src={product.main_image}
                                        alt={product.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* INFO */}
                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-neutral-800">
                                        {product.product_name}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                        {product.description}
                                    </p>

                                    {/* PRICE */}
                                    <p className="mt-2 text-sm font-medium text-green-600">
                                        {lowestPrice ? `₹${lowestPrice}` : 'Not available'}
                                    </p>
                                </div>
                            </Link>

                            {/* ADD TO CART BUTTON */}
                            <button
                                className={`
                                    w-full
                                    py-2
                                    text-sm
                                    rounded-b-xl
                                    transition-all
                                    cursor-pointer
                                    active:scale-[0.98]
                                    ${alreadyInCart
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : lowestPrice
                                        ? 'bg-black text-white hover:bg-gray-900'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
                                `}
                                onClick={() => handleAddToCart(product)}
                                disabled={alreadyInCart || !lowestPrice}
                            >
                                {alreadyInCart ? 'Added to Cart ✓' : 'Add to Cart'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}