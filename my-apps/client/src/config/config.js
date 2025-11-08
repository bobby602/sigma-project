// src/config/config.js
// 🎯 Centralized Configuration สำหรับทั้งระบบ

/**
 * Environment Configuration
 * อ่านจาก .env.development หรือ .env.production
 */
const ENV = {
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || '/api',
  
  // Environment
  ENV: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Logging
  ENABLE_LOGGING: process.env.REACT_APP_ENABLE_LOGGING === 'true',
  
  // App Info
  APP_NAME: 'Sigma Group Thailand',
  APP_VERSION: '2.0.0',
};

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Main Resources
  PRODUCTS: '/products',
  PRICES: '/prices',
  RESERVATIONS: '/reservations',
  CUSTOMERS: '/customers',
  LINE: '/line',
  
  // Legacy endpoints (backward compatibility)
  LEGACY: {
    PRODUCT_LIST: '/productList',
    PRICE_LIST: '/priceList',
    RESERVE_LIST: '/reserveList',
    CUSTOMER_LIST: '/customerList',
  },
};

/**
 * Logging Utility
 * จะทำงานทั้ง Development และ Production
 * เก็บ log ใน localStorage เพื่อ debug ใน production
 */
class Logger {
  constructor() {
    this.enabled = ENV.ENABLE_LOGGING;
    this.maxLogs = 100; // เก็บ log สูงสุด 100 รายการ
    this.storageKey = 'sigma_app_logs';
  }

  /**
   * บันทึก log ลง localStorage
   */
  saveToStorage(logEntry) {
    if (!this.enabled) return;
    
    try {
      const logs = this.getLogs();
      logs.push(logEntry);
      
      // เก็บแค่ 100 รายการล่าสุด
      const limitedLogs = logs.slice(-this.maxLogs);
      localStorage.setItem(this.storageKey, JSON.stringify(limitedLogs));
    } catch (error) {
      // Silent fail ถ้า localStorage เต็ม
      console.warn('Failed to save log to storage:', error);
    }
  }

  /**
   * สร้าง log entry พร้อม timestamp
   */
  createLogEntry(level, message, data = null) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  /**
   * Log INFO level
   */
  info(message, data) {
    const entry = this.createLogEntry('INFO', message, data);
    
    if (ENV.IS_DEVELOPMENT) {
      console.log(`ℹ️ ${message}`, data || '');
    }
    
    this.saveToStorage(entry);
  }

  /**
   * Log SUCCESS level
   */
  success(message, data) {
    const entry = this.createLogEntry('SUCCESS', message, data);
    
    if (ENV.IS_DEVELOPMENT) {
      console.log(`✅ ${message}`, data || '');
    }
    
    this.saveToStorage(entry);
  }

  /**
   * Log WARNING level
   */
  warn(message, data) {
    const entry = this.createLogEntry('WARNING', message, data);
    
    console.warn(`⚠️ ${message}`, data || '');
    this.saveToStorage(entry);
  }

  /**
   * Log ERROR level
   */
  error(message, data) {
    const entry = this.createLogEntry('ERROR', message, data);
    
    console.error(`❌ ${message}`, data || '');
    this.saveToStorage(entry);
  }

  /**
   * Log API Request
   */
  apiRequest(method, url, params = null, data = null) {
    const message = `API Request: ${method} ${url}`;
    this.info(message, { method, url, params, data });
  }

  /**
   * Log API Response
   */
  apiResponse(method, url, status, data = null) {
    const message = `API Response: ${method} ${url} - ${status}`;
    
    if (status >= 200 && status < 300) {
      this.success(message, { status, data });
    } else if (status >= 400) {
      this.error(message, { status, data });
    } else {
      this.info(message, { status, data });
    }
  }

  /**
   * Log API Error
   */
  apiError(method, url, error) {
    const message = `API Error: ${method} ${url}`;
    this.error(message, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: ENV.IS_DEVELOPMENT ? error.stack : undefined,
    });
  }

  /**
   * ดึง logs ทั้งหมดจาก localStorage
   */
  getLogs() {
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * ล้าง logs
   */
  clearLogs() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('✅ Logs cleared');
    } catch (error) {
      console.error('❌ Failed to clear logs:', error);
    }
  }

  /**
   * Export logs เป็น JSON file
   */
  exportLogs() {
    const logs = this.getLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sigma-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * แสดง logs ใน console
   */
  printLogs() {
    const logs = this.getLogs();
    console.table(logs);
    return logs;
  }
}

// Export singleton instance
export const logger = new Logger();

// ทำให้เข้าถึงได้ทั่วทั้งแอพผ่าน window (สำหรับ debug)
if (typeof window !== 'undefined') {
  window.sigmaLogger = logger;
}

export default ENV;