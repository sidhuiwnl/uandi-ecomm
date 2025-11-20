import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const initialState = {
    addresses: [],
    loading: false,
    error: null,
};

// Helper function to extract error message
const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    return 'An unexpected error occurred';
};

/** Fetch all addresses for a user */
export const fetchAddresses = createAsyncThunk(
    "addresses/fetchAddresses",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/address/user/${userId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch addresses"
            );
        }
    }
);

/** Add a new address */
export const addAddress = createAsyncThunk(
    "addresses/addAddress",
    async (addressData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/address`, addressData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to add address"
            );
        }
    }
);

/** Update an existing address */
export const updateAddress = createAsyncThunk(
    "addresses/updateAddress",
    async ({ id, addressData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/address/${id}`, addressData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to update address"
            );
        }
    }
);

/** Delete an address */
export const deleteAddress = createAsyncThunk(
    "addresses/deleteAddress",
    async ({ id, user_id }, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/address/${id}`, {
                data: { user_id }
            });
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete address"
            );
        }
    }
);


/** Set default address */
export const setDefaultAddress = createAsyncThunk(
    "addresses/setDefaultAddress",
    async ({ address_id, user_id }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/address/set-default`, {
                address_id,
                user_id
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to set default address"
            );
        }
    }
);

/** Get default address */
export const getDefaultAddress = createAsyncThunk(
    "addresses/getDefaultAddress",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/address/default/${userId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Failed to get default address"
            );
        }
    }
);

const addressSlice = createSlice({
    name: "addresses",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearAddresses: (state) => {
            state.addresses = [];
        },
        setAddresses: (state, action) => {
            state.addresses = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all addresses
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload || [];
                state.error = null;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = getErrorMessage(action.payload);
            })

            // Add address
            .addCase(addAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.address_id) {
                    state.addresses.push(action.payload);
                }
                state.error = null;
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = getErrorMessage(action.payload);
            })

            // Update address
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.address_id) {
                    const index = state.addresses.findIndex(
                        (address) => address.address_id === action.payload.address_id
                    );
                    if (index !== -1) {
                        state.addresses[index] = action.payload;
                    }
                }
                state.error = null;
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = getErrorMessage(action.payload);
            })

            // Delete address
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = state.addresses.filter(
                    (address) => address.address_id !== action.payload
                );
                state.error = null;
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = getErrorMessage(action.payload);
            })

            // Set default address
            .addCase(setDefaultAddress.pending, (state) => {
                state.error = null;
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                if (action.payload && action.payload.address_id) {
                    // Update all addresses to reflect the new default status
                    state.addresses = state.addresses.map(address => ({
                        ...address,
                        is_default: address.address_id === action.payload.address_id ? 1 : 0
                    }));
                }
                state.error = null;
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.error = getErrorMessage(action.payload);
            })

            // Get default address
            .addCase(getDefaultAddress.pending, (state) => {
                state.error = null;
            })
            .addCase(getDefaultAddress.fulfilled, (state, action) => {
                if (action.payload) {
                    // Update the addresses list to reflect the default status
                    state.addresses = state.addresses.map(address => ({
                        ...address,
                        is_default: address.address_id === action.payload.address_id ? 1 : 0
                    }));
                }
                state.error = null;
            })
            .addCase(getDefaultAddress.rejected, (state, action) => {
                state.error = getErrorMessage(action.payload);
            });
    },
});

export const { clearError, clearAddresses, setAddresses } = addressSlice.actions;
export default addressSlice.reducer;