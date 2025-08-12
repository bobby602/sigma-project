import axios from 'axios';
import API_CONFIG from '../config/api'; // ใช้ config ที่เราสร้างไว้

export const refreshToken = async () => {
  try {
    // ตรวจสอบว่ามีข้อมูลใน sessionStorage หรือไม่
    const storedToken = sessionStorage.getItem('token');
    const storedRefreshToken = sessionStorage.getItem('refreshToken');
    
    if (!storedToken || !storedRefreshToken) {
      throw new Error('No token found in storage');
    }

    const userToken = JSON.parse(storedToken);
    const refreshTokenValue = JSON.parse(storedRefreshToken);
    
    console.log('🔄 Refreshing token for user:', userToken.Login);
    
    // ✅ ใช้ API_CONFIG และ path ที่ถูกต้อง
    const res = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
      username: userToken.Login,
      token: refreshTokenValue
    });

    console.log('✅ Token refreshed successfully');
    return res.data;
    
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    
    // ถ้า refresh token ไม่ถูกต้อง ให้ logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.clear();
      window.location.href = '/Login';
    }
    
    throw error;
  }
};