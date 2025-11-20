"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews } from "@/store/slices/reviewsSlice";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { use } from "react";

export default function ProductPage({ params }) {
  const { id } = use(params); // unwrap the whole params promise

  const productId = id;
  console.log("Product ID:", productId);
  const dispatch = useDispatch();
  const reviews = useSelector((s) => s.reviews.items);
  const user = useSelector((s) => s.auth.user);

  const [ratingFilter, setRatingFilter] = useState("");

  // const token = user?.token || ""; // TODO: get from cookies/auth
  const userId = user?.user_id || ""; // TODO: get from auth

  console.log("User ID:", userId);

  useEffect(() => {
    dispatch(fetchReviews({ productId, rating: ratingFilter }));
  }, [productId, ratingFilter]);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <h1 className="text-3xl font-bold">Product #{productId}</h1>

      {/* Rating Filter */}
      <div className="flex gap-3 items-center">
        <label className="font-medium">Filter by Rating:</label>
        <select
          className="border rounded px-2 py-1"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>
      </div>

      {/* Review Form */}
      <div className="border rounded p-5 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
        <ReviewForm productId={productId} userId={userId}/>
      </div>

      {/* Reviews List */}
      <div className="border rounded p-5 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
