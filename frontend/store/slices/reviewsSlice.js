import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// fetch reviews for product
export const fetchReviews = createAsyncThunk('reviews/fetch', async ({ productId, rating, page }) => {
  const params = new URLSearchParams();
  if (rating) params.append('rating', rating);
  if (page) params.append('page', page);
  const url = `/reviews/product/${productId}?${params.toString()}`;
  const res = await API.get(url);
  return res.data;
});

// create review (multipart form-data)
export const createReview = createAsyncThunk('reviews/create', async ({ formData, token }) => {
  console.log("Creating review with formData:", formData);
  const res = await API.post('/reviews', formData, {
  withCredentials: true,
  });
  return res.data;
});

// admin update
export const adminUpdateReview = createAsyncThunk('reviews/adminUpdate', async ({ id, patch, token }) => {
  const res = await API.put(`/admin/reviews/${id}`, patch, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
});

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: { items: [], status: 'idle' },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.fulfilled, (state, action) => { state.items = action.payload; state.status = 'succeeded'; })
      .addCase(createReview.fulfilled, (state, action) => { state.items.unshift(action.payload); });
  }
});

export default reviewsSlice.reducer;
