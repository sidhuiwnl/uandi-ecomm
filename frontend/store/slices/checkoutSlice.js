import { createSlice } from "@reduxjs/toolkit";

const checkoutSlice = createSlice({
    name: "checkout",
    initialState: {
        source: null, // 'cart' | 'routine'
        items: [],
    },
    reducers: {
        setCheckoutFromCart(state, action) {
            state.source = "cart";
            state.items = action.payload;
        },
        setCheckoutFromRoutine(state, action) {
            state.source = "routine";
            state.items = action.payload;
        },
        clearCheckout(state) {
            state.source = null;
            state.items = [];
        },
    },
});

export const {
    setCheckoutFromCart,
    setCheckoutFromRoutine,
    clearCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
