// Store/reserve-slice.js
import { createSlice } from '@reduxjs/toolkit';

const reserveSlice = createSlice({
  name: 'reserve',
  initialState: {
    data: [],
    isLoading: false,
    error: null,
    filter: [],
    summary: null,
  },
  reducers: {
    reserveProduct(state, action) {
      const data = action.payload.productReserveData;
      state.data = Array.isArray(data) ? data : [];
      state.error = null;
    },
    
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError(state) {
      state.error = null;
    },
    
    clearReserveData(state) {
      state.data = [];
      state.error = null;
    },
    
    setSummary(state, action) {
      state.summary = action.payload;
    },
    
    setFilter(state, action) {
      state.filter = action.payload;
    },
  },
});

export const reserveActions = reserveSlice.actions;

export default reserveSlice;