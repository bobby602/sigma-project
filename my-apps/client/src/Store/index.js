import { configureStore } from '@reduxjs/toolkit';
import reserveSlice from './reserve-slice';
import productSlice from './product-slice';
import userAction from './userList';


const store = configureStore({
  reducer: {product: productSlice.reducer , reserve: reserveSlice.reducer , user: userAction.reducer},
});

export default store;
