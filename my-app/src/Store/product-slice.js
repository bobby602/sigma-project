import { createSlice,current } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    data: [],
    isLoading: false,
    filter:[],
    subTable:[],
    type:[],
  },
  reducers: {
    replaceproduct(state, action) {
      const type = action.payload.e;
      const data = action.payload.productData;
      let Str ='';
      let i =0;
      if(type){
          const typeStr = type.map((e)=>{
            Str=  Str +e+',';
            i++;
          })
        Str =Str.substring(0, Str.length - 1)
        state.type = Str;
        }  
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
    subTable(state,action){
      const Item = action.payload.productData;
      state.subTable = Item.filter((e)=>{
           return e;
      })  
    },
    updateTable(state,action){
      const value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      console.log(value)
      state.filter = state.filter.map((e)=>{
          if(e.itemcode == item.itemcode){
            let returnValue = {...e};
            returnValue.CostN = value;
            return returnValue;
          }else{
            return e;
          }
      })
    },
  },
});

export const productActions = productSlice.actions;

export default productSlice;