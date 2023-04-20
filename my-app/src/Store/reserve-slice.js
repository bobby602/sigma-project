import { createSlice,current } from '@reduxjs/toolkit';


const reserveSlice = createSlice({
  name: 'reserve',
  initialState: {
    data: [],
    isLoading: false,
    filter:[],

  },
  reducers: {
    reserveProduct(state, action) {
      const data = action.payload.productReserveData;
      state.data = data;
    }
  },
});

export const reserveActions = reserveSlice.actions;

export default reserveSlice;