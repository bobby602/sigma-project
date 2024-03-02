import { productActions } from './product-slice';
import axios from 'axios';
import {useAxiosPrivate} from '../Util/useAxiosAPI';

const API =useAxiosPrivate();

export const fetchCartData = (e) => {
    return async (dispatch) => {
      const fetchData = async () => {
        const res = await API.post('/table',{e});
        const actualData = await res.data.result;
        const actualData2 = await res.data.Data4;
        return {actualData,actualData2};
      };
      let err = null;
      try {
        const productData = await fetchData();
        dispatch(
            productActions.replaceproduct({productData,e})
        );
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
  };

  export const fetchSubData = (e) => {
    return async (dispatch) => {
      const fetchData = async () => {
        let err = null;
        const res = await API.get(`/subTable?itemCode=${encodeURIComponent(e)}`);
  
        if (!res.ok) {
          throw new Error('Could not fetch cart data!');
        }
  
        const actualData = await res.json();
  
        return actualData.result.recordset;
      };
      let err = null;
      try {
        
        const productData = await fetchData();
        
        dispatch(
            productActions.subTable({productData})
        );
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
  };

  export const updateData = (e) => {
    return async (dispatch) => {
      let err = null;
      const fetchData = async () => {
        const res = API.put(`/productList`,e);
        // return actualData.result.recordset;
      };
  
      try {
        console.log(e)
        const productData = await fetchData();
        dispatch(
            productActions.updateTable({e})
        );
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
  };
  export const fetchPriceList = (e) => {

    return async (dispatch) => {
      let err = null;
      const fetchData = async () => {
        const res = await API.get('/priceList');
        const actualData = await res.data.result.recordset;
        console.log(actualData)
        return actualData;
      };
  
      try {
        const priceData = await fetchData();
        dispatch(
            productActions.PriceTable({priceData})
        );
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
  };
  export const updatePriceData = (e) => {
    return async (dispatch) => {
      let err = null;
      const fetchData = async () => {
        const res = API.put(`/priceList`,e);
        // return actualData.result.recordset;
      };
  
      try {
        const productData = await fetchData();
        dispatch(
            productActions.updatePriceTable({e})
        );
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
  };
  export const updatePriceList = (e) => {
    return async (dispatch) => {
      let err = null;
      const fetchData = async () => {
        const res = API.post(`/priceList/updatePriceList`,e);
        const actualData = await res;

        return actualData.data.departData.recordset;

      };
  
      try {
        const productData = await fetchData();
        console.log(productData)
        dispatch(
            productActions.updatePriceList({e,productData})
        );
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
  };