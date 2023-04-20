import { createSlice,current } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'product',
  initialState: {
    data: [],
    isLoading: false,
    filter:[],
    subTable:[],
    priceList:[],
    departNameList:[],
    type:[],
    DepartName:[],
  },
  reducers: {
    replaceproduct(state, action) {
      const type = action.payload.e;
      const data = action.payload.productData.actualData;
      const depart = action.payload.productData.actualData2;
    
      let dataFil = data.map((e)=>{
        return e;
      });
      if(dataFil.length == 11){
        state.filter = [];
      }else{
        state.filter = dataFil.map((e)=>{
              return e;
        })
      }
      const distinct = (value,index,self) =>{
        return self.indexOf(value) === index;
      }
  
      state.data = state.filter;
      // state.filter = action.payload;
    },
    filterProduct(state,action){
      const Item = action.payload;
      if(Array.isArray(Item)){
      }else{
        state.filter = state.data.filter((e)=>{
          if (e.Name.toLowerCase().includes(Item.toLowerCase())){
                   return {...state ,e};
           }
         }) 
      } 
    },
    filterPriceList(state,action){
      const Item = action.payload;
      state.priceList = state.data.filter((e)=>{
        console.log(e.NameFG)
        if (e.NameFGS.toLowerCase().includes(Item.toLowerCase())){
            return {...e};
        }else if (e.NameFG.toLowerCase().includes(Item.toLowerCase())){
          return {...e};
        }
       })  
    },
    filterPriceType(state,action){
      const type = action.payload;
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
      if(type.length !=0){
        state.priceList = state.data.filter((e)=>{
          if (type.includes(e.DepartName)){
            console.log({...e})
              return {...e};
          }
        });
      }else{
        state.priceList = state.data;
      }
    },
    PriceTable(state,action){
      let test;
      let count;
      const distinct = (value,index,self) =>{
        return self.indexOf(value) === index;
      }
      const Item = action.payload; 
      console.log(Item)
      let departName = Item.priceData.map((e,index)=>{
        count = index;
            return e.DepartName;
        })
      test = departName.filter(distinct);
      state.departNameList = departName.filter(distinct);
   
      let priceArr = [];
      test.map((e,index)=>{
        priceArr.push({
            AmtF10:'',
            AmtF25:'',
            AmtF50:'',
            AmtF100:'',
            COP : '' ,
            CP : '',
            CU : '',
            DateAdd : '',
            DepartCpde:'',
            DepartName:e,
            ItemCode: e,
            NameFG: '',
            NameFGS : '',
            Reserve : '',
            NoteF:'',
            PackD:'r',
            PackR:'',
            PackSale:'',
            Price10:'',
            Price25:'',
            Price50:'',
            Price100:'',
            RPackRpt:'',
            Rpack:'',
            RpackSale:'',
            TOT:'',
            code:e,
            containProduct:'',
            datePriceList:'',
            name:'',
            number:String(count+index+2),
            priceList:''
          })
      })
      Item.priceData.map((e)=>{
        priceArr.push(e)
      })
      let priceArrSort = [];
      let map1 = new Map();
      for(let j = 0;j<test.length;j++){
        let varChange = test[j];
          for(let i = 0; i<priceArr.length;i++){
 
            if(varChange == priceArr[i].DepartName){
              map1.set(priceArr[i],i)
            }
          }
      }    
      let countNum = 0 ;
      // map1 = new Map([...map1.entries()].sort((a, b) => (a[0].PackD == 'r' && a[0].departName == b[0].departName)?-1:0));
      console.log(map1)
       Array.from(map1, ([key, value]) => {
        priceArrSort[countNum] = key;
        countNum++;
      });
      console.log(priceArrSort)

      state.priceList = priceArrSort;
      state.data = state.priceList;
    },
    updateTable(state,action){
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
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
            returnValue.price = value;
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
    updatePriceTable(state,action){
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = dd + '/' + mm + '/' + yyyy;
      if(value !=null){  
        value = Number(value);      
        value = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }else{
        value = '0.00';
      }
      state.priceList = state.priceList.map((e)=>{
          if(e.ItemCode == item.ItemCode && type =='note' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.NoteF = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='price10' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.Price10 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='AmtF10' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.AmtF10 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='price25' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.Price25 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='AmtF25' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.AmtF25 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='price50' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.Price50 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='AmtF50' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.AmtF50 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='price100' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.Price100 = value;
            return returnValue;
          }else if(e.ItemCode == item.ItemCode && type =='AmtF100' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.AmtF100 = value;
            return returnValue;
          }else{
            return e;
          }
      })
    },
    updatePriceList(state,action){
      const departGroup = action.payload.productData[0];
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = dd + '/' + mm + '/' + yyyy;
      if(value !=null ){  
        value = Number(value);      
        value = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }else{
        value = '0.00';
      }
      state.priceList = state.priceList.map((e)=>{
          if(e.ItemCode == item.ItemCode && type =='priceList' && e.code == item.code && e.NameFGS == item.NameFGS){
            let returnValue = {...e};
            returnValue.priceList = value;
            returnValue.datePriceList = today;
            returnValue.Price10 = value - (value * departGroup.Disc10/100);
            returnValue.Price25 = value - (value * departGroup.Disc25/100);
            returnValue.Price50 = value - (value * departGroup.Disc50/100);
            returnValue.Price100 = value - (value * departGroup.Disc100/100);
            returnValue.AmtF10 =  departGroup.AmtF10;
            returnValue.AmtF25 =  departGroup.AmtF25;
            returnValue.AmtF50 =  departGroup.AmtF50;
            returnValue.AmtF100 =  departGroup.AmtF100;
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