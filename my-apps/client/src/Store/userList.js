import { createSlice,current } from '@reduxjs/toolkit';

const userAction = createSlice({
  name: 'User',
  initialState: {
    userData:[],
    otherUserData:[],
    summaryItems: [],
    summaryPagination: { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
    summaryTotalRow: null,
    summaryuserData:[],
    summaryFilterData:[],
    custUserData:[],
    custFilterUserData:[],
    CustRegData:[],
    CustRegDataByCustCode:[],
    filterData:[],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false }
  },
  reducers: {
      setPagedCustomers(state, action) {
        const { userData, pagination } = action.payload || {};
        state.userData = Array.isArray(userData) ? userData : [];
        state.filterData = Array.isArray(userData) ? userData : [];
        state.pagination = {
          page: pagination?.page ?? 1,
          limit: pagination?.limit ?? 20,
          total: pagination?.total ?? (Array.isArray(userData) ? userData.length : 0),
          totalPages: pagination?.totalPages ?? 1,
          hasNext: !!pagination?.hasNext,
          hasPrev: !!pagination?.hasPrev,
        };
      },
      setSummaryServerPage(state, action) {
        // action.payload = { items, page, limit, total, totalPages, hasPrev, hasNext, totalRow }
        const p = action.payload || {};
        state.summaryItems = Array.isArray(p.items) ? p.items : [];
        state.summaryPagination = {
          page: Number(p.page || 1),
          limit: Number(p.limit || 20),
          total: Number(p.total || 0),
          totalPages: Number(p.totalPages || 1),
          hasPrev: !!p.hasPrev,
          hasNext: !!p.hasNext
        };
        state.summaryTotalRow = p.totalRow || null;
      },
      fetchUserInfo(state,action){
        state.userData = action.payload.userData;
        state.filterData = action.payload.userData;
      },
      fetchMonthlyUser(state,action){
        state.summaryuserData = action.payload.userMonthlyData;
      },
      fetchSummaryUserByDate(state,action){
         const raw = action.payload?.userSummaryData || action.payload || [];
        const arr = Array.isArray(raw) ? raw : Object.values(raw || {});
        state.summaryItems = arr.filter(r => r?.CustCode !== 'รวม');
        state.summaryTotalRow = arr.find?.(r => r?.CustCode === 'รวม') || null;
        state.summaryPagination = {
          page: 1, limit: arr.length, total: arr.length, totalPages: 1, hasPrev: false, hasNext: false
        };
      },
      // SearchSummaryUser(state,action){
      //   let searchVal = action.payload;
      //   let UserData = state.summaryuserData;
      //   const myArray = Object.values(UserData).map((e) => {return {...e}});
      //   console.log(searchVal);
      //   console.log(current(UserData))
      //   const result = myArray.filter((e)=>{
      //       if(e.CustName ==undefined){
      //         e.CustName  = '';
      //       }
      //     if(e.CustName.includes(searchVal)){
      //       return {...e};
      //     }else if(e.CustCode.includes(searchVal)){
      //       return {...e};
      //     }
      //   })  
      //   if(searchVal == ""){
      //     state.summaryuserData = UserData;
      //   }else{
      //     state.summaryuserData = result;
      //   }
      // },
      fetchCustomer(state,action){
        state.custUserData = action.payload.customerData;
        state.custFilterUserData = action.payload.customerData;
      },
      searchCustCode(state,action){
        let searchVal = action.payload;
        let UserData = state.custUserData;
        const myArray = Object.values(UserData).map((e) => {return {...e}});
        const result = myArray.filter((e)=>{
          if(e.ItemName ==undefined){
            e.ItemName  = '';
          }
          if(e.ItemCode ==undefined){
            e.ItemCode  = '';
          }

          if(e.ItemName.includes(searchVal)){
            return {...e};
          }else if(e.ItemCode.includes(searchVal)){
            return {...e};
          }
       })  
       if(searchVal == ""){
        state.custFilterUserData = UserData;
       }else{
        state.custFilterUserData = result;
       }
       
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
        console.log('🔍 Filtering for custCode:', item);
        console.log('🔍 Available custCodes:', CustRegData?.map(e => e.CustCode).slice(0, 10));
        let result  = CustRegData.filter((e)=>{
          if(e.CustCode == item){
            return {...e}
          }
        })
        console.log('🔍 Filter result:', result.length, 'items found');
        state.CustRegDataByCustCode = result;
      }
  }
});

export const userList = userAction.actions;
export default userAction;