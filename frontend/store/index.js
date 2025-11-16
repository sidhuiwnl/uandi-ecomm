import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import roleReducer from './roleSlice';
import categoriesReducer from './categoriesSlice';
import productsReducer from './productsSlice';
import blogReducer from './slices/blogSlice';
import testimonialReducer from './slices/testimonialSlice';
import reelReducer from './slices/reelSlice';
import cartReducer from './slices/cartSlice';
import addressReducer from './slices/addressSlice';
import collectionReducer from './collectionsSlice';
import couponReducer from './couponSlics';
import ordersReducer from './ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    categories: categoriesReducer,
    products: productsReducer,
    cart: cartReducer,
    blogs: blogReducer,
    testimonials: testimonialReducer,
    reels: reelReducer,
    addresses: addressReducer,
    collections: collectionReducer,
    coupons: couponReducer,
    orders: ordersReducer,
  },
});