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
      const type = action.payload.e;
      const data = action.payload.productData;
      console.log(type)
      state.filter = data.filter((e)=>{
      if (type.includes(e.TyItemDm)){
          return {...state,e};
      }else{
        return;
      }
      });
      // state.filter = action.payload;
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