"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { createReview } from "@/store/slices/reviewsSlice";

export default function ReviewForm({ productId, token, userId }) {
  const dispatch = useDispatch();

  console.log("ReviewForm props - productId:", productId, "userId:", userId);

  const [ratings, setRatings] = useState(5);
  const [review_title, setTitle] = useState("");
  const [review_description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const submitReview = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("product_id", productId);
    fd.append("user_id", userId);
    fd.append("ratings", ratings);  
    fd.append("review_title", review_title);
    fd.append("review_description", review_description);

    console.log("FormData contents:");
for (let p of fd.entries()) console.log(p);

    Array.from(images).forEach((file) => fd.append("images", file));

    await dispatch(createReview({ formData: fd, token }));

    // reset
    setRatings(5);
    setTitle("");
    setDescription("");
    setImages([]);
  };

  return (
    <form onSubmit={submitReview} className="space-y-4">
      <div>
        <label className="font-medium">Rating</label>
        <select
          className="border rounded px-2 py-1 ml-3"
          value={ratings}
          onChange={(e) => setRatings(e.target.value)}
        >
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>
      </div>

      <div>
        <label className="font-medium">Title</label>
        <input
          className="border w-full rounded px-2 py-1"
          value={review_title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="font-medium">Description</label>
        <textarea
          className="border w-full rounded px-2 py-1"
          value={review_description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="font-medium">Upload Images</label>
        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
          className="mt-1"
        />
      </div>

      <button className="bg-black text-white px-4 py-2 rounded">
        Submit Review
      </button>
    </form>
  );
}
