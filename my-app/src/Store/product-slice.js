import { createSlice,current } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    data: [],
    isLoading: false,
    filter:[],
    subTable:[],
    priceList:[],
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
          return e;
      }else{
        return;
      }
      });
      state.data = state.filter;
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
    PriceTable(state,action){
      const Item = action.payload; 
      console.log(Item)
      state.priceList = Item;
    },
    updateTable(state,action){
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
      console.log(type)
      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = dd + '/' + mm + '/' + yyyy;
      console.log(today)
      if(value !=null){  
        value = Number(value);      
        value = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }else{ 
        value = '0.00';
      }
      state.filter = state.filter.map((e)=>{
          if(e.itemcode == item.itemcode && type =='cost'){
            let returnValue = {...e};
            returnValue.CostN = value;
            returnValue.DateCn = today;
            return returnValue;
          }else if(e.itemcode == item.itemcode && type =='price'){
            let returnValue = {...e};
            returnValue.Price = value;
            returnValue.datePrice = today;
            return returnValue;
          }else if(e.itemcode == item.itemcode && type =='priceRe'){
            let returnValue = {...e};
            returnValue.PriceRE = value;
            returnValue.datePriceRe = today;
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