import axios from 'axios';
import AuthContext from '../Store/auth-context';
import {useContext, useEffect} from 'react';

 

   export const refreshToken =  async () => {
  
    try {
      console.log(JSON.parse(sessionStorage.getItem('token')).Login);
      const res = await axios.post('http://1.0.169.153:9001/refresh',{username:JSON.parse(sessionStorage.getItem('token')).Login,token:JSON.parse(sessionStorage.getItem('refreshToken'))});

      return res.data;
      
    } catch (error) {
      console.log(error);
    }
  };





