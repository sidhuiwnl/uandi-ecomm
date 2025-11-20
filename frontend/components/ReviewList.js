"use client";

export default function ReviewList({ reviews }) {
  if (!reviews?.length) {
    return <div className="text-gray-500">No reviews yet.</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div
          key={r.review_id}
          className="border rounded p-4 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {r.review_title || "Untitled Review"}
            </h3>

            <span className="text-yellow-500 text-lg">
              {"★".repeat(r.ratings)}
            </span>
          </div>

          {/* {r.verified && (
            <span className="text-green-600 text-sm font-bold">
              ✔ Verified Purchase
            </span>
          )} */}

          <p className="mt-2 text-gray-700">{r.review_description}</p>

          {r.images_json && r.images_json.length > 0 && (
            <div className="mt-4 flex gap-4 overflow-x-auto">
              {r.images_json.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Review Image ${idx + 1}`}
                  className="h-32 w-auto object-cover rounded border"
                />
              ))}
            </div>
          )}          
  

          <p className="text-xs text-gray-400 mt-2">
            {new Date(r.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
