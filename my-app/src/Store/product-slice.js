import { createSlice,current } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    data: [],
    changed: false,
    filter:[],
  },
  reducers: {
    replaceproduct(state, action) {
      state.data = action.payload;
      state.filter = action.payload;
    },
    filterProduct(state,action){
      const Item = action.payload;
      state.filter = state.data.filter((e)=>{
       if (e.Name.toLowerCase().includes(Item.toLowerCase())){
                return {...state ,e};
        }
      })  
    },
  },
});

export const productActions = productSlice.actions;

export default productSlice;