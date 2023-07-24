import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { userList } from './userList'


  export const fetchData = () => {
  
    return async (dispatch) => {
      const getUserData = async () => {
        
      
        const res = await axios.get('http://localhost:9001/customerList');
        console.log(res.data.result.recordset)
        return res.data.result.recordset;
      };
  
      try {
        const userData = await getUserData();
        dispatch(
          userList.fetchUserInfo({userData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

  export const fetchSummaryUserbyDate = (input,saleCode) => {
  
    return async (dispatch) => {
      const getSummaryUserbyDate = async () => {
        const res = await axios.post(`http://localhost:9001/customerList/selectSummaryUser`,{input,saleCode});
        
        return res.data.finalResult;
      };
  
      try {
        const userSummaryData = await getSummaryUserbyDate();
        dispatch(
          userList.fetchSummaryUserByDate({userSummaryData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

  export const searchCustomer = () => {
    return async (dispatch) => {
      const getSearchData = async () => {
        const res = await axios.get(`http://localhost:9001/customerList/custReg`);
        console.log(res.data.result)
        return res.data.result.recordset;
      };
  
      try {
        const searchData = await getSearchData();
        dispatch(
          userList.getCustReg({searchData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

