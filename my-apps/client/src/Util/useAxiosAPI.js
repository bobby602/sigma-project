// src/Util/useAxiosAPI.js
import axios from 'axios';
import { sanitizeToken } from './auth'; // <-- ปรับ path ให้ตรง

const BASE_URL = 'http://localhost:9001';

/** กัน default ที่อาจถูกตั้งไว้ที่อื่น */
axios.defaults.withCredentials = false;

/** สร้าง instance สำหรับเรียก API (ใช้ Bearer token อย่างเดียว) */
const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // สำคัญ: ไม่ใช้คุกกี้ → ตัดปัญหา CORS credential
});

/** Request Interceptor: แนบ Authorization ให้ทุก request (ยกเว้น auth endpoints) */
axiosPrivate.interceptors.request.use(
  (config) => {
    const raw = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    const token = sanitizeToken(raw);

    const url = (config.url || '').toLowerCase();
    const isAuthEndpoint =
      url.startsWith('/api/auth/login') || url.startsWith('/api/auth/refresh');

    if (token && !isAuthEndpoint) {
      config.headers = config.headers ?? {};
      // ป้องกัน Bearer ซ้ำ
      const cur = String(config.headers.Authorization || '');
      config.headers.Authorization = cur.startsWith('Bearer ') ? cur : `Bearer ${token}`;
    }

    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/** Response Interceptor: จัดการ 401 → refresh token แล้ว retry, อื่น ๆ ปล่อยให้ caller จัดการ */
axiosPrivate.interceptors.response.use(
  (response) => {
    // debug สั้น ๆ
    // console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, { status: response.status });
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = (originalRequest.url || '').toLowerCase?.() || '';

    console.error(`❌ API Error: ${originalRequest.method?.toUpperCase?.()} ${originalRequest.url}`, {
      status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // ไม่พยายาม refresh ถ้าเป็น endpoint auth เอง หรือไม่มีสถานะ (Network/CORS)
    const isAuthEndpoint =
      url.startsWith('/api/auth/login') || url.startsWith('/api/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const rawRT = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
        const refreshToken = sanitizeToken(rawRT);
        if (!refreshToken) throw new Error('No refresh token');

        const refreshRes = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const newAT = sanitizeToken(refreshRes.data?.accessToken);
        const newRT = sanitizeToken(refreshRes.data?.refreshToken);

        if (!newAT) throw new Error('No accessToken from refresh');

        // อัปเดต storage (ใช้ sessionStorage เป็นหลัก)
        sessionStorage.setItem('accessToken', newAT);
        if (newRT) sessionStorage.setItem('refreshToken', newRT);

        // อัปเดต header แล้ว retry
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAT}`;

        console.log('✅ Token refreshed, retrying:', originalRequest.url);
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        ['accessToken','refreshToken','token','token2','user'].forEach(k => {
          sessionStorage.removeItem(k);
          localStorage.removeItem(k);
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 403, 404, 500 — โยนให้ caller ตัดสินใจ
    return Promise.reject(error);
  }
);

/** ส่งออกเป็นฟังก์ชัน/อินสแตนซ์ สำหรับใช้ทุกที่ */
export const useAxiosPrivate = () => axiosPrivate;
export const axiosPrivateInstance = axiosPrivate;
export default axiosPrivate;
