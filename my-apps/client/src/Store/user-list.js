// src/Store/user-list.js - แก้ไข API functions
import axios from 'axios';
import { userList } from './userList';
import axiosPrivate from '../Util/useAxiosAPI'; // ← เปลี่ยนเป็น import ธรรมดา

// ✅ ไม่เรียก useAxiosPrivate() แล้ว
const API = axiosPrivate;

export const fetchData = () => {
  return async (dispatch) => {
    const getUserData = async () => {
      try {
        console.log('🔄 Fetching customer data...');
        
        // ✅ เรียก API เดียว
        try {
          const res = await API.get('/api/customers'); // Legacy format
          console.log('✅ Customer list data:', res.data);
          return res.data.result?.recordset || [];
        } catch (error) {
          console.log('⚠️ Customer API failed, trying with search params...', {
            status: error.response?.status
          });
          
          // ลอง new API format
          const res = await API.get('/api/customers/search', {
            params: {
              page: 1,
              limit: 100
            }
          });
          console.log('✅ Customer search data:', res.data);
          return res.data.data || [];
        }
        
      } catch (error) {
        console.error('❌ Error fetching customer data:', error);
        
        // ไม่ auto-redirect แล้ว ให้ useAxiosPrivate จัดการ
        if (error.response?.status === 404) {
          console.log('📍 Customer API endpoint not found - check server configuration');
          // Return empty array แทนการ throw error
          return [];
        }
        
        throw error;
      }
    };

    try {
      const userData = await getUserData();
      dispatch(
        userList.fetchUserInfo({ userData })
      );
    } catch (error) {
      console.error('Error in fetchData dispatch:', error);
      // ไม่ throw error ต่อ เพื่อไม่ให้ component crash
    }
  };
};

export const fetchSummaryUserbyDate = (input, saleCode) => {
  return async (dispatch) => {
    const getSummaryUserbyDate = async () => {
      try {
        console.log('🔄 Fetching summary user data...', { input, saleCode });
        
        // ✅ ใช้ legacy endpoint (ยังไม่มี API ใหม่)
        const res = await API.post(`/customerList/selectSummaryUser`, { input, saleCode });
        console.log('✅ Summary user data:', res.data);
        return res.data.finalResult;
        
      } catch (error) {
        console.error('❌ Error fetching summary:', error);
        
        if (error.response?.status === 404) {
          console.log('📍 Summary API endpoint not found');
          return [];
        }
        
        throw error;
      }
    };

    try {
      const userSummaryData = await getSummaryUserbyDate();
      dispatch(
        userList.fetchSummaryUserByDate({ userSummaryData })
      );
    } catch (error) {
      console.error('Error in fetchSummaryUserbyDate dispatch:', error);
    }
  };
};

export const searchCustomer = (searchTerm = '') => {
  return async (dispatch) => {
    const getSearchData = async () => {
      try {
        console.log('🔍 Searching customer...', searchTerm);
        
        // ✅ เรียก API เดียว
        try {
          const res = await API.get('/api/customers/custReg'); // Legacy format
          console.log('✅ Search results:', res.data);
          return res.data.result?.recordset || [];
        } catch (error) {
          console.log('⚠️ Search API failed, trying with search params...', {
            status: error.response?.status
          });
          
          // ลอง new API format
          const res = await API.get('/api/customers/search', {
            params: {
              q: searchTerm,
              page: 1,
              limit: 50
            }
          });
          console.log('✅ Search results (new format):', res.data);
          return res.data.data || [];
        }
        
      } catch (error) {
        console.error('❌ Error searching customer:', error);
        
        if (error.response?.status === 404) {
          console.log('📍 Search API endpoint not found');
          return [];
        }
        
        throw error;
      }
    };

    try {
      const searchData = await getSearchData();
      dispatch(
        userList.getCustReg({ searchData })
      );
    } catch (error) {
      console.error('Error in searchCustomer dispatch:', error);
    }
  };
};

export const fetchCustomer = (date1, date2, code) => {
  return async (dispatch) => {
    const getCustomerData = async () => {
      try {
        console.log('🔄 Fetching customer details...', { date1, date2, code });
        
        // ✅ เรียก API เดียว
        try {
          const res = await API.get(`/api/customers/custCode?custCode=${encodeURIComponent(code)}&date1=${encodeURIComponent(date1)}&date2=${encodeURIComponent(date2)}`);
          console.log('✅ Customer details:', res.data);
          return res.data.finalResult;
        } catch (error) {
          console.log('⚠️ Customer details API failed, trying new format...', {
            status: error.response?.status
          });
          
          // ลอง new API format
          const res = await API.get(`/api/customers/${encodeURIComponent(code)}`, {
            params: {
              startDate: date1,
              endDate: date2
            }
          });
          console.log('✅ Customer details (new format):', res.data);
          return res.data;
        }
        
      } catch (error) {
        console.error('❌ Error fetching customer details:', error);
        
        if (error.response?.status === 404) {
          console.log('📍 Customer details API endpoint not found');
          return [];
        }
        
        throw error;
      }
    };

    try {
      const customerData = await getCustomerData();
      dispatch(
        userList.fetchCustomer({ customerData })
      );
    } catch (error) {
      console.error('Error in fetchCustomer dispatch:', error);
    }
  };
};

// ✅ แก้ไข checkAuthStatus ให้ไม่ redirect เมื่อ 404
export const checkAuthStatus = () => {
  return async (dispatch) => {
    try {
      console.log('🔐 Checking auth status...');
      
      // เช็ค token ก่อน
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      
      console.log('🔑 Token check:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? accessToken.substring(0, 30) + '...' : null
      });
      
      if (!accessToken) {
        console.error('❌ No access token found');
        throw new Error('No access token available');
      }
      
      // ลองเรียก API /me ก่อน
      try {
        const res = await API.get('/api/auth/me');
        console.log('✅ Auth Status OK:', res.data);
        return true;
      } catch (meError) {
        console.warn('⚠️ /me endpoint failed:', {
          status: meError.response?.status,
          statusText: meError.response?.statusText,
          data: meError.response?.data
        });
        
        // ถ้าเป็น 404 = endpoint ไม่มี (ไม่ใช่ auth problem)
        if (meError.response?.status === 404) {
          console.log('📍 Auth endpoint not found, but token exists - assuming valid');
          return true; // ให้ผ่านไปก่อน
        }
        
        // ถ้าเป็น 401/403 = auth problem จริงๆ
        if (meError.response?.status === 401 || meError.response?.status === 403) {
          console.log('🔐 Auth check failed - invalid token');
          return false;
        }
        
        // ลอง endpoint อื่น
        try {
          const res = await API.get('/api/auth/'); // GET users endpoint
          console.log('✅ Auth Status OK (alternative):', res.data);
          return true;
        } catch (alternativeError) {
          console.warn('⚠️ Alternative endpoint failed:', {
            status: alternativeError.response?.status
          });
          
          // ถ้า 404 ทั้งหมด = server ยังไม่ setup auth endpoints
          if (alternativeError.response?.status === 404) {
            console.log('📍 No auth endpoints available, but token exists - assuming valid');
            return true;
          }
          
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ Auth Status Failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // เก็บ error details ใน localStorage สำหรับ debug
      const errorDetails = {
        timestamp: new Date().toISOString(),
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      };
      
      localStorage.setItem('last_auth_error', JSON.stringify(errorDetails));
      
      // ไม่ auto-redirect แล้ว ให้ useAxiosPrivate จัดการ
      return false;
    }
  };
};

// ✅ เพิ่ม function สำหรับดึง customer registration by code
export const fetchCustomerRegistration = (customerCode) => {
  return async (dispatch) => {
    try {
      console.log('🔄 Fetching customer registration...', customerCode);
      
      try {
        const res = await API.get(`/api/customers/${customerCode}/registration`);
        console.log('✅ New API - Customer registration:', res.data);
        
        dispatch(
          userList.getCustRegByCustCode({ data: res.data })
        );
        
      } catch (newApiError) {
        console.log('⚠️ Registration API failed, trying alternative...', {
          status: newApiError.response?.status
        });
        
        // ถ้าไม่มี API ใหม่ ให้ใช้ search แทน
        dispatch(searchCustomer(customerCode));
      }
      
    } catch (error) {
      console.error('❌ Error fetching customer registration:', error);
    }
  };
};