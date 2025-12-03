"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCollectionProducts } from "@/store/collectionsSlice";
import { addToCart, openCart } from "@/store/slices/cartSlice";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/store/slices/wishlistSlice";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function Page() {
  const { collectionId } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { selectedCollection, loading, error } = useSelector((state) => state.collections);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const collectionData = selectedCollection?.collection;
  const rawProducts = selectedCollection?.products || [];

  useEffect(() => {
    if (collectionId) {
      dispatch(getCollectionProducts(collectionId));
    }
  }, [dispatch, collectionId]);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Backend now provides variants with images & category; ensure fallback if missing
  const products = useMemo(() => {
    return rawProducts.map((p) => {
      const seen = new Set();
      const variants = (p.variants || [])
        .filter(v => v && v.variant_id && !seen.has(v.variant_id) && parseFloat(v.final_price || v.price || 0) > 0 && (seen.add(v.variant_id) || true))
        .map((v, idx) => {
          let images = v.images || [];
          if (idx === 0 && p.main_image && !images.some(img => img.image_url === p.main_image)) {
            images = [{ image_url: p.main_image }, ...images];
          }
          return { ...v, images };
        });
      return { ...p, variants };
    });
  }, [rawProducts]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      alert("Please log in to use the wishlist feature");
      return;
    }

    // Find the product and its first variant
    const product = products?.find((p) => p.product_id === productId);
    if (!product || !product.variants?.[0]) {
      console.error("Product or variant not found");
      return;
    }

    const variant_id = product.variants[0].variant_id;

    // Check if already in wishlist
    const isInWishlist = wishlistItems?.some(
      (item) => item.product_id === productId && item.variant_id === variant_id
    );

    if (isInWishlist) {
      await dispatch(removeFromWishlist({ product_id: productId, variant_id }));
    } else {
      await dispatch(addToWishlist({ product_id: productId, variant_id }));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {error && <p className="text-center text-red-500 text-lg py-4">{error}</p>}
      <div className="mb-6">
        {loading ? (
          <h1 className="text-2xl font-semibold text-neutral-900">Loading…</h1>
        ) : (
          <h1 className="text-3xl font-semibold text-neutral-900">{collectionData?.collection_name}</h1>
        )}
        {!loading && <p className="text-sm text-neutral-500 mt-1">{products.length} product(s)</p>}
      </div>
      {loading && <p className="text-center text-gray-500 text-lg py-6">Fetching products...</p>}
      {!loading && products.length === 0 && <p className="text-center text-gray-500 py-10">No products in this collection.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const isInWishlist = wishlistItems?.some(
            (item) => item.product_id === product.product_id
          );
          
          return (
            <ProductCard
              key={product.product_id}
              product={product}
              isAuthenticated={isAuthenticated}
              inWishlist={isInWishlist}
              onToggleWishlist={toggleWishlist}
              onNavigate={(id) => router.push(`/products/${id}`)}
              onAddToCart={({ product: p, variant }) => {
                if (!variant) return;
                const price = parseFloat(variant.final_price || variant.price || 0);
                if (!price) return;
                dispatch(
                  addToCart({
                    product_id: p.product_id,
                    product_name: p.product_name,
                    variant_id: variant.variant_id,
                    variant_name: variant.variant_name,
                    price,
                    quantity: 1,
                    main_image: p.main_image,
                    source_collection_id: collectionId,
                  })
                );
                dispatch(openCart());
              }}
            />
          );
        })}
      </div>
    </div>
  );
}