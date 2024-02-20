import axios from 'axios';

export const LogoutApi = () => {
    
  return async (dispatch) => {
    const getLogout = async () => {
      console.log(JSON.parse(sessionStorage.getItem('token')).Login);
      const res = await axios.post('http://localhost:9001/logout',{username:JSON.parse(sessionStorage.getItem('token')).Login,token:JSON.parse(sessionStorage.getItem('refreshToken'))});
      console.log(res);
      return res.data;
    };
    try {
      await getLogout();
      
    } catch (error) {
      console.log(error);
    }
  }
};