// src/Util/useAxiosAPI.js - แก้ไข useAxiosPrivate
import axios from 'axios';

const BASE_URL = 'http://localhost:9001';

// สร้าง axios instance
const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - เพิ่ม token
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - จัดการ error
axiosPrivate.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      dataLength: response.data ? Object.keys(response.data).length : 0
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${url}`, {
      status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // 🔍 แยก error types อย่างชัดเจน
    if (status === 404) {
      console.warn(`⚠️ API Endpoint not found: ${url} - This is NOT an auth error`);
      // ไม่ redirect, ให้ component จัดการเอง
      return Promise.reject(error);
    }

    if (status === 500) {
      console.error(`💥 Server error: ${url}`);
      // ไม่ redirect, ให้ component จัดการเอง
      return Promise.reject(error);
    }

    // 🔐 Auth errors เท่านั้นที่ redirect
    if (status === 401) {
      console.log('🔐 Access token expired, trying refresh...');

      // ป้องกัน infinite loop
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
          const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

          if (!refreshToken || !user.Login) {
            throw new Error('No refresh token or user info');
          }

          console.log('🔄 Attempting token refresh...');

          // ลอง refresh token
          const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            token: refreshToken,
            username: user.Login
          });

          if (refreshResponse.data.accessToken) {
            const newAccessToken = refreshResponse.data.accessToken;
            const newRefreshToken = refreshResponse.data.refreshToken;

            // อัปเดต tokens
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // อัปเดต header สำหรับ request เดิม
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            console.log('✅ Token refreshed successfully, retrying original request...');

            // ลอง request เดิมอีกครั้ง
            return axiosPrivate(originalRequest);
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Refresh ไม่ได้ = ต้อง login ใหม่
          console.log('🔐 Refresh token invalid, redirecting to login...');
          
          localStorage.clear();
          sessionStorage.clear();
          
          // ใช้ window.location แทน navigate เพื่อให้แน่ใจว่า redirect
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    if (status === 403) {
      console.log('🚫 Access forbidden - insufficient permissions');
      // อาจจะไม่ต้อง redirect ทันที ให้ component จัดการ
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ✅ Export เป็น function ธรรมดา ไม่ใช่ hook
export const useAxiosPrivate = () => {
  return axiosPrivate;
};

// ✅ Export เป็น instance ให้ใช้นอก component ได้
export const axiosPrivateInstance = axiosPrivate;

// ✅ สำหรับใช้ใน Redux actions
export default axiosPrivate;