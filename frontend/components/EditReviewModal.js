"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateAdminReview } from "@/store/slices/adminReviewSlice";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function EditReviewModal({ review, onClose }) {
  const dispatch = useDispatch();

  const [ratings, setRatings] = useState(review.ratings);
  const [title, setTitle] = useState(review.review_title);
  const [description, setDescription] = useState(review.review_description);
  const [verified, setVerified] = useState(review.verified);
  const initialImages = review.images_json || [];
  const [images, setImages] = useState(initialImages);
  const [saving, setSaving] = useState(false);

  const removeImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  const save = async () => {
    setSaving(true);
    await dispatch(
      updateAdminReview({
        id: review.review_id,
        patch: {
          ratings,
          review_title: title,
          review_description: description,
          verified,
          images,
        },
      })
    );
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-5 flex items-center justify-between border-b border-gray-100 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Review</h2>
            <p className="text-gray-500 text-sm mt-1">Review ID: #{review.review_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatings(r)}
                  className="transition-transform hover:scale-110"
                >
                  <StarIconSolid
                    className={`w-8 h-8 ${
                      r <= ratings ? "text-yellow-400" : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-600 font-medium self-center text-sm">
                {ratings} out of 5
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Review Title</label>
            <input
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              placeholder="Enter review title..."
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-sm"
              placeholder="Enter review description..."
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Verified Badge Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Verified Purchase</label>
              <p className="text-xs text-gray-500 mt-1">Mark this review as verified</p>
            </div>
            <button
              onClick={() => setVerified(!verified)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                verified ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  verified ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Review Images</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Review ${i + 1}`}
                      className="w-full h-24 object-cover rounded-xl shadow-sm border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-white transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-sm hover:shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
