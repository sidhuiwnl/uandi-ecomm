import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ================================================================
   1️⃣  VALIDATE COUPON
================================================================ */
export const validateCoupon = createAsyncThunk(
    "coupon/validateCoupon",
    async ({ coupon_code, cart_items, subtotal, user_id, source_collection_id }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/coupons/validate`, {
                coupon_code,
                cart_items,
                subtotal,
                user_id,
                source_collection_id,
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to validate coupon" });
        }
    }
);

/* ================================================================
   2️⃣  CREATE COUPON (Admin)
================================================================ */
export const createCoupon = createAsyncThunk(
    "coupon/createCoupon",
    async (couponData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/coupons/create`, couponData);
            return response.data; // success, coupon_id
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to create coupon" });
        }
    }
);

/* ================================================================
   3️⃣  GET AVAILABLE COUPONS
================================================================ */
export const getAvailableCoupons = createAsyncThunk(
    "coupon/getAvailableCoupons",
    async ({ user_id, collection_id }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/coupons/available`, {
                user_id,
                source_collection_id: collection_id,
            });

            return response.data.coupons;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch available coupons" });
        }
    }
);

/* ================================================================
   4️⃣  GET ALL COUPONS (Admin Panel)
   Route: GET /coupons/create
================================================================ */
export const getAllCoupons = createAsyncThunk(
    "coupon/getAllCoupons",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/coupons`);
            return response.data.coupons || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch coupons" });
        }
    }
);

/* ================================================================
   5️⃣  GET ACTIVE COUPONS
================================================================ */
export const getActiveCoupons = createAsyncThunk(
    "coupon/getActiveCoupons",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/coupons/active`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch active coupons" });
        }
    }
);

/* ================================================================
   6️⃣  GET USER COUPONS
================================================================ */
export const getUserCoupons = createAsyncThunk(
    "coupon/getUserCoupons",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/coupons/user/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Failed to fetch user coupons" });
        }
    }
);

/* ================================================================
   7️⃣  SLICE
================================================================ */
const couponSlice = createSlice({
    name: "coupon",

    initialState: {
        appliedCoupon: null,
        availableCoupons: [],
        userCoupons: [],

        validationLoading: false,
        validationError: null,

        loading: false, // for lists
        error: null,

        discount: 0,
        discountApplied: false,

        createLoading: false,
        createSuccess: false,
        createError: null,
    },

    reducers: {
        applyCoupon: (state, action) => {
            state.appliedCoupon = action.payload.coupon;
            state.discount = action.payload.discount;
            state.discountApplied = true;
        },

        removeCoupon: (state) => {
            state.appliedCoupon = null;
            state.discount = 0;
            state.discountApplied = false;
        },

        clearCouponError: (state) => {
            state.validationError = null;
            state.createError = null;
        },

        resetCouponState: (state) => {
            state.appliedCoupon = null;
            state.availableCoupons = [];
            state.userCoupons = [];
            state.discount = 0;
            state.discountApplied = false;
        },
    },

    extraReducers: (builder) => {
        builder

            /* =========================================================
               ✔ Validate Coupon
            ========================================================= */
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
                state.validationError = action.payload?.message;
                state.appliedCoupon = null;
                state.discount = 0;
                state.discountApplied = false;
            })

            /* =========================================================
               ✔ Create Coupon
            ========================================================= */
            .addCase(createCoupon.pending, (state) => {
                state.createLoading = true;
                state.createSuccess = false;
                state.createError = null;
            })
            .addCase(createCoupon.fulfilled, (state) => {
                state.createLoading = false;
                state.createSuccess = true;
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload?.message;
            })

            /* =========================================================
               ✔ Get Available Coupons
            ========================================================= */
            .addCase(getAvailableCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAvailableCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.availableCoupons = action.payload;
            })
            .addCase(getAvailableCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            /* =========================================================
               ✔ Get Active Coupons
            ========================================================= */
            .addCase(getActiveCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getActiveCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.availableCoupons = action.payload.coupons;
            })
            .addCase(getActiveCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            /* =========================================================
               ✔ Get User Coupons
            ========================================================= */
            .addCase(getUserCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.userCoupons = action.payload.coupons;
            })
            .addCase(getUserCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            /* =========================================================
               ✔ Get ALL Coupons (Admin)
            ========================================================= */
            .addCase(getAllCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.availableCoupons = action.payload; // Admin list
            })
            .addCase(getAllCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    },
});

export const {
    applyCoupon,
    removeCoupon,
    clearCouponError,
    resetCouponState,
} = couponSlice.actions;

export default couponSlice.reducer;