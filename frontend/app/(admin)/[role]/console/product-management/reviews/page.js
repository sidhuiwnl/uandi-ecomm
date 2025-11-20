"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminReviews,
  deleteAdminReview,
} from "@/store/slices/adminReviewSlice";
import { Combobox } from "@headlessui/react";
import EditReviewModal from "@/components/EditReviewModal";
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon, StarIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function AdminReviewsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.adminReviews);

  const [ratingFilter, setRatingFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /** 🔥 UNIQUE PRODUCT LIST */
  const productList = useMemo(() => {
    const unique = new Map();
    items.forEach((r) => {
      unique.set(r.product_id, r.product_name);
    });
    return Array.from(unique, ([id, name]) => ({ id, name }));
  }, [items]);

  /** 🔥 APPLY FILTERS */
  useEffect(() => {
    dispatch(
      fetchAdminReviews({
        rating: ratingFilter,
        product_id: productFilter,
        sort,
        page,
        from_date: fromDate,
        to_date: toDate,
      })
    );
  }, [ratingFilter, productFilter, sort, page, fromDate, toDate]);

  const handleDelete = (id) => {
    if (confirm("Delete this review permanently?")) dispatch(deleteAdminReview(id));
  };

  /** Clear all filters */
  const clearFilters = () => {
    setRatingFilter("");
    setProductFilter("");
    setFromDate("");
    setToDate("");
    setProductSearch("");
  };

  /** Active filter count */
  const activeFilterCount = [ratingFilter, productFilter, fromDate, toDate].filter(Boolean).length;

  /** Filtered list for search */
  const filteredProducts =
    productSearch === ""
      ? productList
      : productList.filter((p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase())
        );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* TOP HEADER CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Reviews Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Reviews</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{items.length}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Average Rating</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {items.length > 0 
                  ? (items.reduce((acc, r) => acc + r.ratings, 0) / items.length).toFixed(1)
                  : "0.0"}
              </h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <StarIconSolid className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Active Filters Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Filters</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeFilterCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FunnelIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS SECTION - Modified to allow dropdown overflow */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        
        {/* Filter Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Controls - No overflow hidden, proper z-index */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-sm"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter - FIXED with proper z-index */}
          <div className="space-y-2 relative z-30">
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <Combobox value={productFilter} onChange={(value) => {
              setProductFilter(value);
              setProductSearch("");
            }}>
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <Combobox.Input
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="Search products..."
                    displayValue={(id) => {
                      if (!id) return productSearch;
                      const product = productList.find((p) => p.id === id);
                      return product ? product.name : productSearch;
                    }}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <Combobox.Button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                  </Combobox.Button>
                </div>

                <Combobox.Options className="absolute z-50 bg-white border border-gray-200 w-full mt-2 rounded-xl shadow-xl max-h-60 overflow-auto">
                  <Combobox.Option value="" className="cursor-pointer">
                    {({ active, selected }) => (
                      <div
                        className={`px-4 py-2.5 text-sm transition-colors ${
                          active ? "bg-purple-50 text-purple-700" : "text-gray-700"
                        } ${selected ? "font-semibold" : ""}`}
                      >
                        All Products
                      </div>
                    )}
                  </Combobox.Option>

                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-2.5 text-sm text-gray-500">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <Combobox.Option key={p.id} value={p.id} className="cursor-pointer">
                        {({ active, selected }) => (
                          <div
                            className={`px-4 py-2.5 text-sm transition-colors ${
                              active ? "bg-purple-50 text-purple-700" : "text-gray-700"
                            } ${selected ? "font-semibold" : ""}`}
                          >
                            {p.name}
                          </div>
                        )}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* REVIEW TABLE */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading reviews...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <StarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600 text-sm">Try adjusting your filters to see more results</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Review List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((r) => (
                  <tr key={r.review_id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {r.user_full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {r.user_full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">Customer</p>
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium max-w-xs truncate">
                        {r.product_name}
                      </p>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`w-4 h-4 ${
                              i < r.ratings ? "text-yellow-400" : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({r.ratings})</span>
                      </div>
                    </td>

                    {/* Review */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-[200px] truncate">
                        {r.review_description}
                      </p>
                      {r.images_json && r.images_json.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {r.images_json.slice(0, 3).map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt=""
                              className="w-8 h-8 object-cover rounded border border-gray-200"
                            />
                          ))}
                          {r.images_json.length > 3 && (
                            <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                              +{r.images_json.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {new Date(r.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingReview(r)}
                          className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.review_id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{page}</span>
            </span>

            <button
              disabled={items.length === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
        />
      )}
    </div>
  );
}
