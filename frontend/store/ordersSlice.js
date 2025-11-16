// store/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create order
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async ({ orderData, orderItems }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/orders/create`, {
                order: orderData,
                order_items: orderItems
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to create order' });
        }
    }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
    'order/getOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/orders/${orderId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch order' });
        }
    }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
    'order/getUserOrders',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/orders/getOrders/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
        }
    }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
    'order/updateOrderStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to update order status' });
        }
    }
);



const orderSlice = createSlice({
    name: 'order',
    initialState: {
        currentOrder: null,
        orders: [],
        loading: false,
        error: null,
        creating: false,
        createError: null
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearOrderError: (state) => {
            state.error = null;
            state.createError = null;
        },
        resetOrderState: (state) => {
            state.currentOrder = null;
            state.orders = [];
            state.loading = false;
            state.error = null;
            state.creating = false;
            state.createError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.creating = false;
                state.currentOrder = action.payload.order;
                state.createError = null;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.creating = false;
                state.createError = action.payload?.message || 'Failed to create order';
            })
            // Get Order by ID
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.order;
                state.error = null;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch order';
            })
            // Get User Orders
            .addCase(getUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.error = null;
            })
            .addCase(getUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch orders';
            })
            // Update Order Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentOrder && state.currentOrder.order_id === action.payload.order.order_id) {
                    state.currentOrder = action.payload.order;
                }
                // Update in orders list if exists
                const index = state.orders.findIndex(order => order.order_id === action.payload.order.order_id);
                if (index !== -1) {
                    state.orders[index] = action.payload.order;
                }
                state.error = null;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update order status';
            });
    }
});


export default orderSlice.reducer;