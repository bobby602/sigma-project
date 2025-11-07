const RAW = (process.env.REACT_APP_API_URL || '/api').trim();
// ตัดเครื่องหมาย / ซ้ำ แล้วคุมให้เป็น relative ได้เสมอ
const BASE_URL = RAW.replace(/\/+$/,'') || '/api';

const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    // Auth
    LOGIN:   '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT:  '/auth/logout',

    // Main
    PRODUCT_LIST:  '/products',
    PRICE_LIST:    '/prices',
    RESERVE_LIST:  '/reservations',
    CUSTOMER_LIST: '/customers',
    LINE:          '/line',

    // Legacy (ถ้าต้องรองรับของเดิม)
    LEGACY: {
      PRODUCT_LIST: '/productList',
      PRICE_LIST:   '/priceList',
      RESERVE_LIST: '/reserveList',
      CUSTOMER_LIST:'/customerList',
      LINE:         '/line'
    }
  }
};
export default API_CONFIG;