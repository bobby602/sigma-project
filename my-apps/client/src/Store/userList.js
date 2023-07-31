import { createSlice,current } from '@reduxjs/toolkit';

const userAction = createSlice({
  name: 'User',
  initialState: {
    userData:[],
    otherUserData:[],
    summaryuserData:[],
    summaryFilterData:[],
    custUserData:[],
    CustRegData:[],
    CustRegDataByCustCode:[],
    filterData:[]
  },
  reducers: {
      fetchUserInfo(state,action){
        state.userData = action.payload.userData;
        state.filterData = action.payload.userData;
      },
      fetchMonthlyUser(state,action){
        state.summaryuserData = action.payload.userMonthlyData;
      },
      fetchSummaryUserByDate(state,action){
        state.summaryuserData = action.payload.userSummaryData;
      },
      SearchSummaryUser(state,action){
        let searchVal = action.payload;
        let UserData = state.summaryuserData;
        const myArray = Object.values(UserData).map((e) => {return {...e}});
        console.log(searchVal);
        console.log(current(UserData))
        const result = myArray.filter((e)=>{
            if(e.CustName ==undefined){
              e.CustName  = '';
            }
          if(e.CustName.includes(searchVal)){
            return {...e};
          }else if(e.CustCode.includes(searchVal)){
            return {...e};
          }
        })  
        if(searchVal == ""){
          state.summaryuserData = UserData;
        }else{
          state.summaryuserData = result;
        }
      },
      fetchCustomer(state,action){
        state.custUserData = action.payload.customerData;
      },
      searchCustomer(state,action){
        let UserData = state.userData;
        let CustRegData = state.CustRegData;
        let searchVal = action.payload;
        let resultSearch = CustRegData.filter((e)=>{
          if (e.ItemName.includes(searchVal)){
            return {...e};
          }else if (e.ItemNameS.includes(searchVal)){
            return {...e};
          }
        })  
        const as = resultSearch.map((e)=>{
          return e.CustCode;
        })
        const result = UserData.filter((e)=>{
            if(as.includes(e.Code)){
              return {...e};
            }
         })  
         if(searchVal == ""){
          state.filterData = UserData;
         }else{
          state.filterData = result;
         }
      },
      searchCustomerName(state,action){
        let searchVal = action.payload;
        let UserData = state.userData;
        const result = UserData.filter((e)=>{
          if(e.Code.includes(searchVal)){
            return {...e};
          }else if(e.Name.includes(searchVal)){
            return {...e};
          }
       })  
       if(searchVal == ""){
        state.filterData = UserData;
       }else{
        state.filterData = result;
       }
       
      },
      getCustReg(state,action){
        console.log(action.payload.searchData)
        state.CustRegData = action.payload.searchData;
      },
      getCustRegByCustCode(state,action){
        const item = action.payload;
        let CustRegData = state.CustRegData;
        let result  = CustRegData.filter((e)=>{
          if(e.CustCode == item){
            return {...e}
          }
        })
        state.CustRegDataByCustCode = result;
      }
  }
});

export const userList = userAction.actions;
export default userAction;