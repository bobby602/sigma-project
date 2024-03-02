import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { userList } from './userList';
import {useAxiosPrivate} from '../Util/useAxiosAPI';

const API =useAxiosPrivate();


  export const fetchData = () => {
  
    return async (dispatch) => {
      const getUserData = async () => {
        
        const res = await API.get('/customerList');
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
        const res = await API.post(`/customerList/selectSummaryUser`,{input,saleCode});
        
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
        const res = await API.get(`/customerList/custReg`);
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

  export const fetchCustomer = (date1,date2,code) => {
    return async (dispatch) => {
      const getCustomerData = async () => {
        const res = await API.get(`/customerList/custCode?custCode=${encodeURIComponent(code)}&date1=${encodeURIComponent(date1)}&date2=${encodeURIComponent(date2)}`);
        console.log(res.data.finalResult)
        return res.data.finalResult;
      };
      try {
        const customerData = await getCustomerData();
        dispatch(
          userList.fetchCustomer({customerData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

