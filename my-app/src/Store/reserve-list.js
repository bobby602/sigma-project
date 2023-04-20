import axios from 'axios';
import { reserveActions } from './reserve-slice';
export const fetchReserveData = (e,a) => {

  return async (dispatch) => {
    const fetchReserveData = async () => {
      const res = await axios.post('http://1.0.169.153:9001/reserveList',{e,a});
      const actualData = await res.data.result.recordset;

      return actualData;
    };
    let err = null;
    try {
      const productReserveData = await fetchReserveData();
      dispatch(
          reserveActions.reserveProduct({productReserveData})
      );
    } catch (error) {
      console.log(error);
      err = error;
    }
  };
};


export const deleteReserveData = (e,a) => {
  console.log(a)
  return async (dispatch) => {
    const deleteReserveRecord = async () => {
      const res = await axios.post('http://1.0.169.153:9001/reserveList/deleteRecord',{a});
      const actualData = await res.data.result.recordset;
      return true;
    };
    let err = null;
    try {
      const removeProductReserveData = await deleteReserveRecord();
      console.log('test');
    } catch (error) {
      console.log(error);
      err = error;
    }
  };
};

export const insertReserveData = (e,a,item,saleName) => {
  console.log(item)
  return async (dispatch) => {
    const insertReserveRecord = async () => {
      const res = await axios.post('http://1.0.169.153:9001/reserveList/insertRecord',{a,item,saleName});
      const actualData = await res.data.result.recordset;
      return true;
    };
    let err = null;
    try {
      const insertProductReserveData = await insertReserveRecord();
    } catch (error) {
      console.log(error);
      err = error;
    }
  };
};