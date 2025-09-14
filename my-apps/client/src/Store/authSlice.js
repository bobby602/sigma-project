import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../config/api';

// ✅ Helper function to safely parse JSON or return original value
const safeJSONParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    // ถ้า parse ไม่ได้ แสดงว่าเป็น string อยู่แล้ว (เช่น JWT token)
    return value;
  }
};

// ✅ Helper function to safely stringify value
const safeJSONStringify = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

// ✅ Async thunk for login with comprehensive error handling
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log('🚀 Sending login request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`);
      console.log('📝 Login data:', { username, password: '***' });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📊 Response status:', response.status);
      console.log('✅ Response ok:', response.ok);

      // Handle rate limiting (429)
      if (response.status === 429) {
        console.log('⏱️ Rate limited - too many requests');
        throw new Error('ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
      }

      if (!response.ok) {
        let errorMessage = 'เข้าสู่ระบบไม่สำเร็จ';
        
        try {
          // Try to parse JSON error response
          const errorData = await response.json();
          console.log('❌ Error response data:', errorData);
          errorMessage = errorData.message || errorData.result || errorMessage;
        } catch (parseError) {
          // If JSON parse fails, get text response
          try {
            const textResponse = await response.text();
            console.log('📄 Error text response:', textResponse);
            
            if (textResponse.includes('Too many')) {
              errorMessage = 'ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
            } else {
              errorMessage = textResponse || errorMessage;
            }
          } catch (textError) {
            console.log('⚠️ Could not parse error response as text either');
          }
        }
        
        // แมป status code เป็น error message ที่เข้าใจง่าย
        if (response.status === 401) {
          errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        } else if (response.status === 403) {
          errorMessage = 'ไม่มีสิทธิ์เข้าใช้งานระบบ';
        } else if (response.status === 500) {
          errorMessage = 'เกิดข้อผิดพลาดระบบ กรุณาลองใหม่อีกครั้ง';
        } else if (response.status >= 500) {
          errorMessage = 'เซิร์ฟเวอร์ไม่สามารถให้บริการได้ชั่วคราว';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Success response data:', data);
      
      // Handle different response formats
      let user, accessToken, refreshToken;
      
      if (data.success) {
        // New format
        user = data.user;
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
      } else if (data.result && data.result[0] && data.result[0][0]) {
        // Legacy backend format
        user = data.result[0][0];
        accessToken = data.accessToken || data.access_token || data.token;
        refreshToken = data.refreshToken || data.refresh_token;
      } else {
        console.log('❌ Unexpected response format');
        throw new Error('รูปแบบการตอบกลับไม่ถูกต้อง');
      }
      
      if (!user) {
        console.log('❌ No user data in response');
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      if (!accessToken) {
        console.log('❌ No access token in response');
        throw new Error('ไม่พบ access token');
      }

      // ✅ Store tokens และ user data อย่างสอดคล้องกัน
      try {
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', JSON.stringify(user)); // backward compatibility
        sessionStorage.setItem('accessToken', safeJSONStringify(accessToken));
        
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', safeJSONStringify(refreshToken));
        }

        console.log('💾 Login successful, stored data:', {
          user: user.Login || user.Name || 'Unknown',
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenType: typeof accessToken,
          refreshTokenType: typeof refreshToken
        });
      } catch (storageError) {
        console.error('❌ Error storing auth data:', storageError);
        throw new Error('ไม่สามารถบันทึกข้อมูลการเข้าสู่ระบบได้');
      }

      return {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return rejectWithValue(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  }
);

// ✅ Async thunk for logout with comprehensive cleanup
export const logout = createAsyncThunk(
  'auth/logout',
  async (navigate, { getState, rejectWithValue }) => {
    try {
      console.log('🚪 Starting logout process...');
      
      const state = getState();
      const accessToken = state.auth?.accessToken;
      
      // Call logout API if token exists
      if (accessToken) {
        try {
          console.log('📞 Calling logout API...');
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${typeof accessToken === 'string' ? accessToken : JSON.stringify(accessToken)}`,
            },
          });
          
          console.log('📊 Logout API response:', response.status);
          
          if (!response.ok) {
            console.warn('⚠️ Logout API failed, but continuing with client-side logout');
          }
        } catch (apiError) {
          console.error('❌ Logout API error (continuing anyway):', apiError);
        }
      }
      
      // Clear all session storage
      console.log('🧹 Clearing session storage...');
      const keysToRemove = [
        'token', 'user', 'accessToken', 'refreshToken',
        'authToken', 'userInfo', 'loginData' // เผื่อมี key อื่นๆ
      ];
      
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key); // เผื่อมีเก็บใน localStorage
      });
      
      // Navigate to login page if navigate function provided
      if (navigate && typeof navigate === 'function') {
        console.log('🔄 Navigating to login page...');
        setTimeout(() => navigate('/Login'), 100); // เล็กน้อย delay เผื่อ state update
      }
      
      console.log('✅ Logout completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if API fails, still clear local data
      sessionStorage.clear();
      localStorage.clear();
      
      // Still navigate to login on error
      if (navigate && typeof navigate === 'function') {
        setTimeout(() => navigate('/Login'), 100);
      }
      
      return rejectWithValue(error.message || 'เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  }
);

// ✅ Check if user is already logged in (from session storage) with robust parsing
const getInitialAuthState = () => {
  try {
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    const storedAccessToken = sessionStorage.getItem('accessToken');
    const storedRefreshToken = sessionStorage.getItem('refreshToken');
    
    console.log('🔍 Checking stored auth data:', {
      hasUser: !!storedUser,
      hasToken: !!storedToken,
      hasAccessToken: !!storedAccessToken,
      hasRefreshToken: !!storedRefreshToken
    });
    
    // ต้องมี user data และ access token
    if ((storedUser || storedToken) && storedAccessToken) {
      const user = safeJSONParse(storedUser) || safeJSONParse(storedToken);
      const accessToken = safeJSONParse(storedAccessToken);
      const refreshToken = safeJSONParse(storedRefreshToken);
      
      // Validate user object
      if (user && (user.Login || user.Name || user.id) && accessToken) {
        console.log('✅ Valid auth data found, user:', user.Login || user.Name || user.id);
        return {
          isAuthenticated: true,
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      } else {
        console.log('⚠️ Invalid user data structure');
      }
    }
  } catch (error) {
    console.error('❌ Error parsing stored auth data:', error);
    
    // Clear corrupted data
    const keysToRemove = ['token', 'user', 'accessToken', 'refreshToken'];
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
  }
  
  console.log('🔒 No valid auth data found');
  return {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
  };
};

const initialAuthState = getInitialAuthState();

// ✅ Auth slice with comprehensive state management
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialAuthState,
    isLoading: false,
    error: null,
    lastLoginAttempt: null,
    loginCount: 0, // Track login attempts for rate limiting
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      
      // Update storage
      sessionStorage.setItem('accessToken', safeJSONStringify(accessToken));
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', safeJSONStringify(refreshToken));
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      sessionStorage.setItem('user', JSON.stringify(state.user));
      sessionStorage.setItem('token', JSON.stringify(state.user)); // backward compatibility
    },
    // Manual logout reducer
    manualLogout: (state) => {
      console.log('🔒 Manual logout triggered');
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
      
      // Clear storage
      sessionStorage.clear();
      localStorage.clear();
    },
    // Reset login attempts
    resetLoginAttempts: (state) => {
      state.loginCount = 0;
      state.lastLoginAttempt = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        console.log('⏳ Login pending...');
        state.isLoading = true;
        state.error = null;
        state.lastLoginAttempt = Date.now();
        state.loginCount = (state.loginCount || 0) + 1;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('✅ Login fulfilled');
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.loginCount = 0; // Reset on successful login
      })
      .addCase(login.rejected, (state, action) => {
        console.log('❌ Login rejected:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        console.log('⏳ Logout pending...');
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        console.log('✅ Logout successful');
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoading = false;
        state.error = null;
        state.loginCount = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(logout.rejected, (state, action) => {
        console.log('⚠️ Logout rejected (but still clearing state)');
        // Even on error, clear auth state
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ✅ Export actions
export const { 
  clearError, 
  setTokens, 
  updateUser, 
  manualLogout, 
  resetLoginAttempts 
} = authSlice.actions;

// ✅ Selectors for easy state access
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;

// ✅ Export both reducer and slice
export const authReducer = authSlice.reducer;
export default authSlice;