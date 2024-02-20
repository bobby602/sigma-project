import {axiosPrivate} from './axios';
import {useContext, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthContext from '../Store/auth-context';
import   {refreshToken}  from '../Store/refreshToken';
import { tokenLoader ,checkAuthLoader} from './auth';


export const useAxiosPrivate = () =>{


  axiosPrivate.interceptors.request.use( async (config) => {
   
    const token = tokenLoader();
    
    if(token != null && token != 'EXPIRED'){
     const  newtoken = await refreshToken();
     sessionStorage.setItem('accessToken', JSON.stringify(newtoken.accessToken));
     sessionStorage.setItem('refreshToken', JSON.stringify(newtoken.refreshToken));
     config.headers["Authorization"] = "Bearer "+JSON.parse(sessionStorage.getItem('accessToken'));

    }
    return config
  },
  (err) => {
    return Promise.reject(error);
  }
  );
  return axiosPrivate;
}