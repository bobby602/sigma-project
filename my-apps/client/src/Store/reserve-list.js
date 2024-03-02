import axios from 'axios';
import { reserveActions } from './reserve-slice';
import {useAxiosPrivate} from '../Util/useAxiosAPI';

const API =useAxiosPrivate();
export const fetchReserveData = (e,a,type) => {
  return async (dispatch) => {
    const fetchReserveData = async () => {
      const res = await API.post('/reserveList',{e,a,type});
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
  
    return async (dispatch) => {
      const deleteReserveRecord = async () => {
        if(a == "" || a== undefined){
          return false;
        }else{
          const res = await API.post('/reserveList/deleteRecord',{a});
          const actualData = await res.data.result.recordset;
          return true;
        }  
      };
      let err = null;
      try {
        const removeProductReserveData = await deleteReserveRecord().then((data)=>{
          if(data ==undefined || data == ""){
            alert("Please select record before cancel");
            window.location.reload(false);
          }else{
            alert("Removed");
            window.location.reload(false);
          }
        });
      } catch (error) {
        console.log(error);
        err = error;
      }
    };
};
export const insertReserveData = (e,a,item,saleName,type) => {
  return async (dispatch) => {
    const insertReserveRecord = async () => {
      const res = await API.post('/reserveList/insertRecord',{a,item,saleName,type});
      const actualData = await res.data.result.recordset;
      return true;
    };
    let err = null;
    try {
      if(isNaN(a) || a=="" ){
        alert("Please fill in number");
      }else{
        const insertProductReserveData = await insertReserveRecord().then(()=>{
          alert("Reserved Success");
          window.location.reload(false);
        }); 
      }

    } catch (error) {
      console.log(error);
      err = error;
    }
  };
};