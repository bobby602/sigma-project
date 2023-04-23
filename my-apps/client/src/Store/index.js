import { configureStore } from '@reduxjs/toolkit';
import reserveSlice from './reserve-slice';
import productSlice from './product-slice';


const store = configureStore({
  reducer: {product: productSlice.reducer , reserve: reserveSlice.reducer},
});

export default store;
