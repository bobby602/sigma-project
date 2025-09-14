// src/Store/user-list.js - แก้ไข API functions
import axios from 'axios';
import { userList } from './userList';
import axiosPrivate from '../Util/useAxiosAPI'; // ← เปลี่ยนเป็น import ธรรมดา

const API = axiosPrivate;

export const fetchData = () => {
  return async (dispatch) => {
    const getUserData = async () => {
      try {
        console.log('🔄 Fetching customer data...');
        try {
          const res = await API.get('/api/customers'); // Legacy format
          console.log('✅ Customer list data:', res.data);
          return res.data.result?.recordset || [];
        } catch (error) {
          console.log('⚠️ Customer API failed, trying with search params...', {
            status: error.response?.status
          });
          
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
        
        if (error.response?.status === 404) {
          console.log('📍 Customer API endpoint not found - check server configuration');
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
    }
  };
};

export const fetchSummaryUserbyDate = (input, saleCode) => {
  return async (dispatch) => {
    const getSummaryUserbyDate = async () => {
      try {
        console.log('🔄 Fetching summary user data...', { input, saleCode });
        
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
        try {
          const res = await API.get('/api/customers/custReg'); 
          console.log('✅ Search results:', res.data);
          return res.data.result?.recordset || [];
        } catch (error) {
          console.log('⚠️ Search API failed, trying with search params...', {
            status: error.response?.status
          });
          
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
      console.log('Dispatching searchCustomer with data:', searchData);
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
        try {
          const res = await API.get(`/api/customers/custCode?custCode=${encodeURIComponent(code)}&date1=${encodeURIComponent(date1)}&date2=${encodeURIComponent(date2)}`);
          console.log('✅ Customer details:', res.data);
          return res.data.finalResult;
        } catch (error) {
          console.log('⚠️ Customer details API failed, trying new format...', {
            status: error.response?.status
          });
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

export const checkAuthStatus = () => {
  return async (dispatch) => {
    try {
      console.log('🔐 Checking auth status...');
      
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
        
        if (meError.response?.status === 404) {
          console.log('📍 Auth endpoint not found, but token exists - assuming valid');
          return true;
        }
        
        if (meError.response?.status === 401 || meError.response?.status === 403) {
          console.log('🔐 Auth check failed - invalid token');
          return false;
        }
        
        try {
          const res = await API.get('/api/auth/'); 
          console.log('✅ Auth Status OK (alternative):', res.data);
          return true;
        } catch (alternativeError) {
          console.warn('⚠️ Alternative endpoint failed:', {
            status: alternativeError.response?.status
          });
          
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

export const fetchCustomersPage = (page = 1, limit = 20) => {
  return async (dispatch) => {
    try {
      console.log('🔄 Fetching customers (server-side paging):', { page, limit });

      const res = await API.get('/api/customers', { params: { page, limit } });
      // เซิร์ฟเวอร์ของคุณคืนรูปแบบนี้อยู่แล้ว
      // {
      //   result: { recordset: [...] },
      //   pagination: { page, limit, total, totalPages, hasNext, hasPrev }
      // }
      const list =
        res?.data?.result?.recordset ??
        res?.data?.data ??
        [];

      const p = res?.data?.pagination ?? {};
      const total = p.total ?? list.length;
      const totalPages = p.totalPages ?? Math.max(1, Math.ceil(total / limit));

      const pagination = {
        page: p.page ?? page,
        limit: p.limit ?? limit,
        total,
        totalPages,
        hasNext: p.hasNext ?? (page < totalPages),
        hasPrev: p.hasPrev ?? (page > 1),
      };

      // เก็บหน้า + ข้อมูลหน้าปัจจุบันไว้ที่ Redux
      dispatch(userList.setPagedCustomers({ userData: list, pagination }));

      return { list, pagination };
    } catch (error) {
      console.error('❌ Error fetching customers (paged):', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      // 404 ก็ให้ลิสต์ว่าง แต่อย่าพัง
      if (error?.response?.status === 404) {
        const pagination = { page, limit, total: 0, totalPages: 1, hasNext: false, hasPrev: false };
        dispatch(userList.setPagedCustomers({ userData: [], pagination }));
        return { list: [], pagination };
      }
      throw error;
    }
  };
};