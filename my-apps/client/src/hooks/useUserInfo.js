// src/hooks/useUserInfo.js
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import AuthContext from '../Store/auth-context';

export const useUserInfo = () => {
  const authCtx = useContext(AuthContext);
  
  // ลองใช้ data จาก AuthContext หรือ Redux
  const reduxUser = useSelector(state => state.auth?.user || state.User?.currentUser);
  
  // ดึงข้อมูลจาก sessionStorage
  const getStoredUser = () => {
    try {
      const storedToken = sessionStorage.getItem('token');
      return storedToken ? JSON.parse(storedToken) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  };

  const storedUser = getStoredUser();
  
  // ลำดับความสำคัญ: Redux -> AuthContext -> SessionStorage
  const user = reduxUser || authCtx.token || storedUser;
  
  // กำหนด userRole ตาม StAdmin
  const getUserRole = (stAdmin) => {
    switch (stAdmin) {
      case '1':
        return 'ผู้ดูแลระบบ';
      case '2':
        return 'พนักงานขาย';
      case '3':
        return 'พนักงานทั่วไป';
      default:
        return 'ผู้ใช้งาน';
    }
  };

  const userInfo = {
    name: user?.Name || user?.Login || null,  // ✅ ใช้ Login ถ้าไม่มี Name
    role: user?.StAdmin || null,
    saleCode: user?.SaleCode || user?.saleCode || null,
    login: user?.Login || null
  };

  const userRole = getUserRole(userInfo.role);

  console.log('🔍 useUserInfo debug:', {
    user,
    userInfo,
    userRole,
    reduxUser,
    authCtxToken: authCtx.token,
    storedUser
  });

  return {
    userInfo,
    userRole,
    isLoggedIn: !!userInfo.name
  };
};