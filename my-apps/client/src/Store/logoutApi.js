import axios from 'axios';
import API_CONFIG from '../config/api';

export const LogoutApi = () => {
  return async (dispatch) => {
    const performLogout = async () => {
      try {
        // ตรวจสอบว่ามีข้อมูลใน sessionStorage หรือไม่
        const storedToken = sessionStorage.getItem('token');
        const storedRefreshToken = sessionStorage.getItem('refreshToken');
        
        if (!storedToken || !storedRefreshToken) {
          console.warn('No token found for logout');
          return;
        }

        const userToken = JSON.parse(storedToken);
        const refreshTokenValue = JSON.parse(storedRefreshToken);
        
        console.log('🚪 Logging out user:', userToken.Login);
        
        // ✅ ใช้ API_CONFIG และ path ที่ถูกต้อง
        const res = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
          username: userToken.Login,
          token: refreshTokenValue
        });
        
        console.log('✅ Logout successful:', res.data);
        return res.data;
        
      } catch (error) {
        console.error('❌ Error during logout:', error);
        // แม้ logout API ล้มเหลว ก็ยังต้อง clear session
      } finally {
        // ทำความสะอาด session storage เสมอ
        sessionStorage.clear();
      }
    };

    try {
      await performLogout();
    } catch (error) {
      console.error('Logout process failed:', error);
      // แม้เกิด error ก็ยัง clear session
      sessionStorage.clear();
    }
  };
};