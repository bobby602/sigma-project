// src/Store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import productSlice from './product-slice';
import userAction from './userList'; // slice ชื่อ 'User'
import reserveSlice from './reserve-slice';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,        // สำหรับ login/logout
    product: productSlice.reducer,  // สำหรับ product data  
    user: userAction.reducer,       // ✅ ใช้ 'user' เป็นหลัก (lowercase)
    User: userAction.reducer,       // ✅ เก็บ 'User' สำหรับ backward compatibility
    reserve: reserveSlice.reducer,  // สำหรับ reserve data
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