import { productActions } from './product-slice';
import axios from 'axios';
export const fetchCartData = (e) => {

    return async (dispatch) => {
      const fetchData = async () => {
        const res = await fetch('http://1.0.169.153:9001/table');
  
        if (!res.ok) {
          throw new Error('Could not fetch cart data!');
        }
  
        const actualData = await res.json();
        return actualData.result;
      };
  
      try {
        const productData = await fetchData();
        dispatch(
            productActions.replaceproduct({productData,e})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

  export const fetchSubData = (e) => {
    return async (dispatch) => {
      const fetchData = async () => {

        const res = await fetch(`http://1.0.169.153:9001/subTable?itemCode=${encodeURIComponent(e)}`);
  
        if (!res.ok) {
          throw new Error('Could not fetch cart data!');
        }
  
        const actualData = await res.json();
  
        return actualData.result.recordset;
      };
  
      try {
        const productData = await fetchData();
        
        dispatch(
            productActions.subTable({productData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

  export const updateData = (e) => {
    return async (dispatch) => {
      const fetchData = async () => {
        const res = axios.put(`http://1.0.169.153:9001/productList`,e);
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
      }
    };
  };
  export const fetchPriceList = (e) => {

    return async (dispatch) => {
      const fetchData = async () => {
        const res = await fetch('http://1.0.169.153:9001/priceList');
  
        if (!res.ok) {
          throw new Error('Could not fetch cart data!');
        }
  
        const actualData = await res.json();
        return actualData.result.recordset;
      };
  
      try {
        const priceData = await fetchData();
        dispatch(
            productActions.PriceTable({priceData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };