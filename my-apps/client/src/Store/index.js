// ========================================
// FILE: store/index.js (Fixed)
// Path: Store/index.js
// ========================================

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import productSlice from './product-slice';
import userAction from './userList';
import reserveSlice from './reserve-slice';

// ⚠️ ไม่ import productListReducer เพราะ product-list.js เป็น action creators เท่านั้น
// มันไม่มี reducer export (มีแต่ fetchCartData, updateData, etc.)

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    product: productSlice.reducer,      // ✅ ใช้ product-slice สำหรับ product state
    user: userAction.reducer,
    User: userAction.reducer,
    reserve: reserveSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['register']
      }
    })
});

export default store;