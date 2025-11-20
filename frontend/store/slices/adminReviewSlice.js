import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAdminReviews = createAsyncThunk(
  "adminReviews/fetch",
  async ({ rating, product_id, sort, page, from_date, to_date }) => {
    const params = new URLSearchParams();

    if (rating) params.append("rating", rating);
    if (product_id) params.append("product_id", product_id);
    if (sort) params.append("sort", sort);
    if (page) params.append("page", page);
    if (from_date) params.append("from_date", from_date);
    if (to_date) params.append("to_date", to_date);

    const res = await axios.get(`${API_URL}/admin/reviews?${params.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });

    return res.data;
  }
);



export const updateAdminReview = createAsyncThunk(
  "adminReviews/update",
  async ({ id, patch }) => {
    const res = await axios.put(`${API_URL}/admin/reviews/${id}`, patch, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    return res.data;
  }
);

export const deleteAdminReview = createAsyncThunk(
  "adminReviews/delete",
  async (id) => {
    await axios.delete(`${API_URL}/admin/reviews/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    return id;
  }
);

const slice = createSlice({
  name: "adminReviews",
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(updateAdminReview.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (r) => r.review_id === action.payload.review_id
        );
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAdminReview.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.review_id !== action.payload);
      });
  },
});

export default slice.reducer;
