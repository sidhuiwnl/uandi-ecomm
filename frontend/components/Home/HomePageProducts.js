"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/productsSlice";
import ProductCard from "@/components/ProductCard";
import { addToCart, openCart } from "@/store/slices/cartSlice";

export default function HomePageProducts() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Randomize & pick 4 products with viable images for ProductCard
  const randomFour = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Filter to products that have at least one variant with images so ProductCard can render
    const eligible = products.filter(
      (p) => p.variants && p.variants[0] && p.variants[0].images && p.variants[0].images.length > 0
    );
    if (eligible.length === 0) return [];
    // Simple Fisher-Yates shuffle copy
    const arr = [...eligible];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 4);
  }, [products]);

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="w-full py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading featured products…</p>
        </div>
      </div>
    );
  }

  if (randomFour.length === 0) {
    return (
      <div className="w-full py-8 text-center text-sm text-gray-500">
        No products available to display.
      </div>
    );
  }

  return (
    <section className="mt-8 mx-1 md:mx-7 py-8">
      <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
            Just For You
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Handpicked products to elevate your skincare routine.
          </p>
        </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {randomFour.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            isAuthenticated={isAuthenticated}
            inWishlist={wishlist.includes(product.product_id)}
            onToggleWishlist={toggleWishlist}
            onNavigate={(id) => window.location.href = `/products/${id}`}
            onAddToCart={({ product: p, variant }) => {
              if (!variant) return;
              const price = parseFloat(variant.final_price || variant.price || 0);
              if (!price) return;
              const cartItem = {
                product_id: p.product_id,
                product_name: p.product_name,
                variant_id: variant.variant_id,
                variant_name: variant.variant_name,
                price,
                quantity: 1,
                main_image: p.main_image,
              };
              dispatch(addToCart(cartItem));
              dispatch(openCart());
            }}
          />
        ))}
      </div>

      <div>
        <div className="mt-10 text-center">
          <a
            href="/products"
            aria-label="Browse all products"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#D8234B] font-semibold text-white transition-transform focus:outline-none focus:ring-4"
            
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18" />
              <path d="M13 5l7 7-7 7" />
            </svg>
            <span>Browse All Products</span>
          </a>
        </div>
      </div>
    </section>
  );
}