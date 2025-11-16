import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* -------------------------------------------
   1️⃣ Fetch All Collections (GET /collections/get-all)
-------------------------------------------- */
export const fetchCollections = createAsyncThunk(
    "collections/fetchCollections",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/collections/get-all`);
            if (!res.ok) throw new Error("Failed to fetch collections");

            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* -------------------------------------------
   2️⃣ Map Products to Collection (POST /collections/map-products)
-------------------------------------------- */
    export const mapProductsToCollection = createAsyncThunk(
        "collections/mapProductsToCollection",
        async ({ collection_id, product_ids }, { rejectWithValue }) => {
            try {
                const res = await fetch(`${API_URL}/collections/map-products`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ collection_id, product_ids })
                });

                if (!res.ok) throw new Error("Failed to map products");

                const json = await res.json();
                return json.data; // { collection_id, product_ids }
            } catch (error) {
                return rejectWithValue(error.message);
            }
        }
    );

/* -------------------------------------------
   3️⃣ Get Collection Products (GET /collections/:id/products)
-------------------------------------------- */
export const getCollectionProducts = createAsyncThunk(
    "collections/getCollectionProducts",
    async (collection_id, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/collections/${collection_id}/products`);
            if (!res.ok) throw new Error("Failed to fetch collection products");

            return await res.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCollectionOrder = createAsyncThunk(
    "collections/updateCollectionOrder",
    async ({ collection_id, updatedOrder }, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `${API_URL}/collections/${collection_id}/update-sort-order`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ updatedOrder })
                }
            );

            if (!res.ok) throw new Error("Failed to update sort order");

            const json = await res.json();

            return {
                updatedOrder,        // send to reducer
                message: json.message
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* -------------------------------------------
   Slice
-------------------------------------------- */
const collectionSlice = createSlice({
    name: "collections",
    initialState: {
        items: [],                  // all collections
        selectedCollection: null,   // collection + products
        loading: false,
        error: null,
        success: false
    },

    reducers: {
        resetStatus: (state) => {
            state.success = false;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder

            /* Fetch all collections */
            .addCase(fetchCollections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollections.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;  // list of collections
            })
            .addCase(fetchCollections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* Map products */
            .addCase(mapProductsToCollection.pending, (state) => {
                state.loading = true;
                state.success = false;
            })
            .addCase(mapProductsToCollection.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(mapProductsToCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* Get Collection + Mapped Products */
            .addCase(getCollectionProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedCollection = null;
            })
            .addCase(getCollectionProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCollection = action.payload;
                // { collection: {...}, products: [...] }
            })
            .addCase(getCollectionProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateCollectionOrder.pending, (state) => {
            state.loading = true;
            })
            .addCase(updateCollectionOrder.fulfilled, (state, action) => {
                state.loading = false;

                if (state.selectedCollection?.products) {
                    const newOrder = action.payload.updatedOrder;

                    // create a quick index lookup for new sort order
                    const sortMap = {};
                    newOrder.forEach(item => {
                        sortMap[item.product_id] = item.sort_order;
                    });

                    // update state products' sort_order
                    state.selectedCollection.products = state.selectedCollection.products
                        .map((p) => ({
                            ...p,
                            sort_order: sortMap[p.product_id]
                        }))
                        .sort((a, b) => a.sort_order - b.sort_order);
                }
            })
            .addCase(updateCollectionOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    }
});

export const { resetStatus } = collectionSlice.actions;

export default collectionSlice.reducer;
