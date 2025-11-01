// src/Util/apiClient.js
import axios from 'axios';
import { sanitizeToken } from './auth'; // << ใช้เฉพาะตัวนี้ก็พอ

const BASE_URL =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:9001/api';

axios.defaults.withCredentials = false;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ---- local clearTokens (แทนที่จะ import จาก ./auth) ----
function clearTokensLocal() {
  ['accessToken','refreshToken','token','token2','user'].forEach((k) => {
    try {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    } catch {}
  });
}

/* --------------------- request interceptor --------------------- */
apiClient.interceptors.request.use(
  (config) => {
    const rawAT =
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('accessToken');
    const token = sanitizeToken(rawAT);

    const url = (config.url || '').toLowerCase();
    const isAuthEndpoint =
      url.startsWith('/api/auth/login') || url.startsWith('/api/auth/refresh');

    if (token && !isAuthEndpoint) {
      config.headers = config.headers || {};
      const cur = String(config.headers.Authorization || '');
      config.headers.Authorization = cur.startsWith('Bearer ')
        ? cur
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------- response interceptor --------------------- */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = (original.url || '').toLowerCase?.() || '';
    const isAuthEndpoint =
      url.startsWith('/api/auth/login') || url.startsWith('/api/auth/refresh');

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const rawRT =
          sessionStorage.getItem('refreshToken') ||
          localStorage.getItem('refreshToken');
        const refreshToken = sanitizeToken(rawRT);
        if (!refreshToken) throw new Error('No refresh token');

        const refreshRes = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        const newAT = sanitizeToken(refreshRes.data?.accessToken);
        const newRT = sanitizeToken(refreshRes.data?.refreshToken);

        if (!newAT) throw new Error('No accessToken from refresh');

        sessionStorage.setItem('accessToken', newAT);
        if (newRT) sessionStorage.setItem('refreshToken', newRT);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAT}`;
        return apiClient(original);
      } catch (err) {
        clearTokensLocal();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
