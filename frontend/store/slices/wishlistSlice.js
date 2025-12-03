import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch wishlist
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { getState }) => {
  const { auth } = getState();
  if (auth.isAuthenticated && auth.user) {
    const { data } = await axios.get(`${API_URL}/wishlist/${auth.user.user_id}`, {
      withCredentials: true,
    });
    return data.items;
  } else {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
  }
});

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ product_id, variant_id }, { dispatch, getState }) => {
    const { auth } = getState();

    if (auth.isAuthenticated && auth.user) {
      await axios.post(
        `${API_URL}/wishlist/add`,
        { user_id: auth.user.user_id, product_id, variant_id },
        { withCredentials: true }
      );
    } else {
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const exists = wishlist.find(
        (i) => i.product_id === product_id && i.variant_id === variant_id
      );

      if (!exists) {
        wishlist.push({ product_id, variant_id, created_at: new Date().toISOString() });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
    }

    dispatch(fetchWishlist());
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async ({ product_id, variant_id }, { dispatch, getState }) => {
    const { auth } = getState();

    if (auth.isAuthenticated && auth.user) {
      await axios.post(
        `${API_URL}/wishlist/remove`,
        { user_id: auth.user.user_id, product_id, variant_id },
        { withCredentials: true }
      );
    } else {
      let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      wishlist = wishlist.filter(
        (i) => !(i.product_id === product_id && i.variant_id === variant_id)
      );
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    dispatch(fetchWishlist());
  }
);

// Clear wishlist
export const clearWishlist = createAsyncThunk('wishlist/clearWishlist', async (_, { dispatch, getState }) => {
  const { auth } = getState();
  if (auth.isAuthenticated && auth.user) {
    await axios.delete(`${API_URL}/wishlist/clear/${auth.user.user_id}`, {
      withCredentials: true,
    });
  } else {
    localStorage.removeItem('wishlist');
  }
  dispatch(fetchWishlist());
});

// Merge guest wishlist with user wishlist after login
export const mergeWishlists = createAsyncThunk('wishlist/mergeWishlists', async (providedUser, { dispatch, getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const user = providedUser || auth.user;
    const isAuthenticated = !!user || auth.isAuthenticated;

    const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (isAuthenticated && user && localWishlist.length > 0) {
      const guestItems = localWishlist.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id
      }));

      await axios.post(`${API_URL}/wishlist/merge`, { user_id: user.user_id, guestItems }, { withCredentials: true });
      localStorage.removeItem('wishlist');
    }

    await dispatch(fetchWishlist()).unwrap();
    return true;
  } catch (e) {
    return rejectWithValue(e?.message || 'Failed to merge wishlists');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    isOpen: false,
  },
  reducers: {
    openWishlist: (state) => {
      state.isOpen = true;
    },
    closeWishlist: (state) => {
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { openWishlist, closeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
