import { productActions } from './product-slice';
import axios from 'axios';
import { useAxiosPrivate } from '../Util/useAxiosAPI';

const API = useAxiosPrivate();

export const fetchCartData = (e) => {
  return async (dispatch) => {
    const fetchData = async () => {
      // ✅ ใช้ legacy endpoint
      const res = await API.post(`/productList/table`, { e });
      const actualData = await res.data.result;
      const actualData2 = await res.data.Data4;
      return { actualData, actualData2 };
    };

    try {
      const productData = await fetchData();
      dispatch(
        productActions.replaceproduct({ productData, e })
      );
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };
};

export const fetchSubData = (e) => {
  return async (dispatch) => {
    const fetchData = async () => {
      // ✅ ใช้ legacy endpoint
      const res = await API.get(`/productList/subTable?itemCode=${encodeURIComponent(e)}`);
      
      if (res.status !== 200) {
        throw new Error('Could not fetch sub data!');
      }

      return res.data.result.recordset;
    };

    try {
      const productData = await fetchData();
      dispatch(
        productActions.subTable({ productData })
      );
    } catch (error) {
      console.error('Error fetching sub data:', error);
    }
  };
};

export const updateData = (e) => {
  return async (dispatch) => {
    const fetchData = async () => {
      // ✅ ใช้ legacy endpoint
      const res = await API.put('/productList', e);
      return res.data;
    };

    try {
      console.log('Updating data:', e);
      const productData = await fetchData();
      dispatch(
        productActions.updateTable({ e })
      );
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };
};

export const fetchPriceList = (e) => {
  return async (dispatch) => {
    const fetchData = async () => {
      // ✅ ใช้ legacy endpoint
      const res = await API.get('/priceList');
      const actualData = await res.data.result.recordset;
      console.log('Price list data:', actualData);
      return actualData;
    };

    try {
      const priceData = await fetchData();
      dispatch(
        productActions.PriceTable({ priceData })
      );
    } catch (error) {
      console.error('Error fetching price list:', error);
    }
  };
};

export const updatePriceData = (e) => {
  return async (dispatch) => {
    const fetchData = async () => {
      // ✅ ใช้ legacy endpoint
      const res = await API.put('/priceList', e);
      return res.data;
    };

    try {
      const productData = await fetchData();
      dispatch(
        productActions.updatePriceTable({ e })
      );
    } catch (error) {
      console.error('Error updating price data:', error);
    }
  };
};

export const updatePriceList = (e) => {
  return async (dispatch) => {
    const fetchData = async () => {
      // ✅ ใช้ legacy endpoint
      const res = await API.post(`/priceList/updatePriceList`, e);
      return res.data.departData.recordset;
    };

    try {
      const productData = await fetchData();
      console.log('Updated price list:', productData);
      dispatch(
        productActions.updatePriceList({ e, productData })
      );
    } catch (error) {
      console.error('Error updating price list:', error);
    }
  };
};