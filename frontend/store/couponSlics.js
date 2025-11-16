import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Validate coupon
export const validateCoupon = createAsyncThunk(
    'coupon/validateCoupon',
    async ({ coupon_code, cart_items, subtotal, user_id, source_collection_id }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/coupons/validate`, {
                coupon_code,
                cart_items,
                subtotal,
                user_id,
                source_collection_id
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to validate coupon' });
        }
    }
);

// ⭐ NEW: Fetch coupons available for checkout (collection / user / global)
export const getAvailableCoupons = createAsyncThunk(
    'coupon/getAvailableCoupons',
    async ({ user_id, collection_id }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/coupons/available`, {
                user_id,
                source_collection_id: collection_id
            });
            return response.data.coupons;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch available coupons' });
        }
    }
);

// Get all active coupons
export const getActiveCoupons = createAsyncThunk(
    'coupon/getActiveCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/coupons/active`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch coupons' });
        }
    }
);

// Get user's personal coupons
export const getUserCoupons = createAsyncThunk(
    'coupon/getUserCoupons',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/coupons/user/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch user coupons' });
        }
    }
);

const couponSlice = createSlice({
    name: 'coupon',
    initialState: {
        appliedCoupon: null,
        availableCoupons: [],   // ⭐ dynamic coupons for checkout
        userCoupons: [],
        validationLoading: false,
        validationError: null,
        loading: false,
        error: null,
        discount: 0,
        discountApplied: false
    },
    reducers: {
        applyCoupon: (state, action) => {
            state.appliedCoupon = action.payload.coupon;
            state.discount = action.payload.discount;
            state.discountApplied = true;
            state.validationError = null;
        },
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            state.discount = 0;
            state.discountApplied = false;
            state.validationError = null;
        },
        clearCouponError: (state) => {
            state.validationError = null;
            state.error = null;
        },
        resetCouponState: (state) => {
            state.appliedCoupon = null;
            state.availableCoupons = [];
            state.userCoupons = [];
            state.validationLoading = false;
            state.validationError = null;
            state.loading = false;
            state.error = null;
            state.discount = 0;
            state.discountApplied = false;
        },
        setDiscount: (state, action) => {
            state.discount = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // 🚀 Validate Coupon
            .addCase(validateCoupon.pending, (state) => {
                state.validationLoading = true;
                state.validationError = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.validationLoading = false;
                state.appliedCoupon = action.payload.coupon;
                state.discount = action.payload.discount;
                state.discountApplied = true;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.validationLoading = false;
                state.validationError = action.payload?.message || 'Failed to validate coupon';
                state.appliedCoupon = null;
                state.discount = 0;
                state.discountApplied = false;
            })

            // ⭐ NEW: Available Coupons
            .addCase(getAvailableCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAvailableCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.availableCoupons = action.payload;
            })
            .addCase(getAvailableCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to load available coupons';
            })

            // Get Active Coupons
            .addCase(getActiveCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getActiveCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.availableCoupons = action.payload.coupons;
            })
            .addCase(getActiveCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch coupons';
            })

            // Get User Coupons
            .addCase(getUserCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.userCoupons = action.payload.coupons;
            })
            .addCase(getUserCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch user coupons';
            });
    }
});

export const {
    applyCoupon,
    removeCoupon,
    clearCouponError,
    resetCouponState,
    setDiscount
} = couponSlice.actions;

export default couponSlice.reducer;
