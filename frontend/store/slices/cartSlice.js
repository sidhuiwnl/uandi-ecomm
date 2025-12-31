
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { getState }) => {
  const { auth } = getState();
  if (auth.isAuthenticated) {
    const { user } = auth;
    const { data } = await axios.get(`${API_URL}/cart/${user.user_id}`, {
      withCredentials: true,
    });
    return data.items;
  } else {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
});



export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (item, { dispatch, getState }) => {
      const { auth } = getState();


      const { thumbnail, ...cartItem } = item;

      if (auth.isAuthenticated) {
        const { user } = auth;

        await axios.post(
            `${API_URL}/cart`,
            { ...cartItem, user_id: user.user_id },
            { withCredentials: true }
        );
      } else {

        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingItem = cart.find(
            (i) =>
                i.product_id === cartItem.product_id &&
                i.variant_id === cartItem.variant_id
        );

        if (existingItem) {
          existingItem.quantity += cartItem.quantity;
        } else {
          cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
      }


      dispatch(fetchCart());
    }
);


export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (item, { dispatch, getState }) => {
      const { auth } = getState();

      if (auth.isAuthenticated && auth.user) {
        // For authenticated users - send user_id in the request
        await axios.delete(`${API_URL}/cart/${item.cart_item_id}`, {
          withCredentials: true,
          data: { // For DELETE requests, use data to send payload
            user_id: auth.user.user_id
          }
        });
      } else {
        // For guest users - handle locally
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(i => i.variant_id !== item.variant_id);
        localStorage.setItem('cart', JSON.stringify(cart));
      }

      dispatch(fetchCart()); // Refresh cart after removal
    }
);

export const updateCartItemQuantity = createAsyncThunk('cart/updateCartItemQuantity', async ({ cart_item_id, quantity }, { dispatch, getState }) => {
  const { auth } = getState();
  if (auth.isAuthenticated) {
    await axios.put(`${API_URL}/cart/${cart_item_id}`, { quantity }, {
      withCredentials: true,
    });
  } else {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.variant_id === cart_item_id);
    if (item) {
      item.quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  dispatch(fetchCart());
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
        const { user } = auth;
        await axios.delete(`${API_URL}/cart/clear/${user.user_id}`, {
            withCredentials: true,
        });
    } else {
        localStorage.removeItem('cart');
    }
    dispatch(fetchCart());
});

export const mergeCarts = createAsyncThunk('cart/mergeCarts', async (providedUser, { dispatch, getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const user = providedUser || auth.user;
    const isAuthenticated = !!user || auth.isAuthenticated;

    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Local cart items to merge:", localCart);
    if (isAuthenticated && user && localCart.length > 0) {

      // Normalize items for bulk merge endpoint
      const items = localCart
        .map((i) => {
          const price = Number(i.price ?? i.final_price ?? i.variant_price);
          const quantity = Number(i.quantity ?? 1);
          const product_id = i.product_id;
          const variant_id = i.variant_id ?? i.cart_item_id ?? i.variantId;
          const main_image = i.main_image ?? i.thumbnail ?? i.image ?? i.variant_image ?? null;
          const source_collection_id = i.source_collection_id ?? i.collection_id ?? null;
          return { user_id: user.user_id, product_id, variant_id, quantity, price, main_image, source_collection_id };
        })
        .filter((x) => x.user_id && x.product_id && x.variant_id && !Number.isNaN(x.price) && x.price > 0 && x.quantity > 0);

      if (items.length > 0) {
        await axios.post(`${API_URL}/cart/merge`, { items }, { withCredentials: true });
        localStorage.removeItem('cart');
      }
    }
    await dispatch(fetchCart()).unwrap();
    return true;
  } catch (e) {
    return rejectWithValue(e?.message || 'Failed to merge carts');
  }
});


const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    isOpen: false,
    items: [],
    loading: false,
    error: null,
      checkout_mode: null,
  },
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
      setCartItems: (state, action) => {
          state.items = action.payload;
          state.checkout_mode = "routine";
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(mergeCarts.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { openCart, closeCart,setCartItems  } = cartSlice.actions;

export default cartSlice.reducer;