// frontend/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    return data.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();
    return data.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await response.json();
    return data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await response.json();
    return data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return { id, ...data };
  }
);

export const deleteVariant = createAsyncThunk(
  'products/deleteVariant',
  async ({  variantId }) => {
    const response = await fetch(`${API_URL}/products/variants/${variantId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return { variantId, ...data };
  }
);

export const updateStock = createAsyncThunk(
  'products/updateStock',
  async ({ variantId, stock }) => {
    const response = await fetch(`${API_URL}/products/variants/${variantId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    const data = await response.json();
    return data;
  }
);

export const updateVariant = createAsyncThunk(
  'products/updateVariant',
  async ({ productId, variantId, variantData }) => {
    const response = await fetch(`${API_URL}/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variantData)
    });
    const data = await response.json();
    return data;
  }
);


export const getAllTags = createAsyncThunk(
    'products/tags',
    async () => {
        const response = await fetch(`${API_URL}/products/tags`);
        const data = await response.json();
        return data.data;
    }
)

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.product_id !== action.payload.id);
      })
      .addCase(deleteVariant.fulfilled, (state, action) => {
        if (state.selectedProduct) {
          state.selectedProduct.variants = state.selectedProduct.variants.filter(v => v.id !== action.payload.variantId);
        }
      })
      .addCase(updateVariant.fulfilled, (state, action) => {
        if (state.selectedProduct) {
          const index = state.selectedProduct.variants.findIndex(v => v.id === action.payload.data.id);
          if (index !== -1) {
            state.selectedProduct.variants[index] = action.payload.data;
          }
        }
      })
        .addCase(getAllTags.pending, (state) => {
            state.loading = true;
        })
        .addCase(getAllTags.fulfilled, (state, action) => {
            state.loading = false;
            state.tags = action.payload;
        })
        .addCase(getAllTags.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

  }
});

export const { clearSelectedProduct } = productsSlice.actions;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export default productsSlice.reducer;