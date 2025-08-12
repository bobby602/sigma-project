// src/config/api.js
const API_CONFIG = {
  BASE_URL: 'http://localhost:9001',
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    
    // Main endpoints
    PRODUCT_LIST: '/api/products',
    PRICE_LIST: '/api/prices', 
    RESERVE_LIST: '/api/reservations',
    CUSTOMER_LIST: '/api/customers',
    LINE: '/api/line',
    
    // Legacy endpoints (fallback)
    LEGACY: {
      PRODUCT_LIST: '/productList',
      PRICE_LIST: '/priceList',
      RESERVE_LIST: '/reserveList',
      CUSTOMER_LIST: '/customerList',
      LINE: '/line'
    }
  }
};

export default API_CONFIG;