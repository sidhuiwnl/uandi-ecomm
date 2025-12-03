import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import roleReducer from './roleSlice';
import categoriesReducer from './categoriesSlice';
import productsReducer from './productsSlice';
import productAttributesReducer from './productAttributesSlice';
import blogReducer from './slices/blogSlice';
import testimonialReducer from './slices/testimonialSlice';
import reelReducer from './slices/reelSlice';
import videoReducer from './slices/videoSlice';
import profileReducer from './profileSlice';
import reviewsReducer from './slices/reviewsSlice';
import adminReviewReducer from './slices/adminReviewSlice';
import collectionsReducer from './collectionsSlice';
import couponReducer from './couponSlice';
import cartReducer from './slices/cartSlice';
import addressReducer from './slices/addressSlice';
import ordersReducer from './ordersSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    categories: categoriesReducer,
    products: productsReducer,
    productAttributes: productAttributesReducer,
    videos: videoReducer,

    blog: blogReducer,
        testimonials: testimonialReducer,
        reels: reelReducer,
        profile: profileReducer,
        reviews: reviewsReducer,
        adminReviews: adminReviewReducer,
        collections: collectionsReducer,
        coupons: couponReducer,
        cart: cartReducer,
        addresses: addressReducer,
        orders: ordersReducer,
        wishlist: wishlistReducer
  },
});