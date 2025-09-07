import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../config/api';

// Async thunk for login with rate limit handling
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log('Sending login request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`);
      console.log('Login data:', { username, password: '***' });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Handle rate limiting (429)
      if (response.status === 429) {
        console.log('Rate limited - too many requests');
        throw new Error('ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
      }

      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        
        try {
          // Try to parse JSON error response
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.result || errorMessage;
        } catch (parseError) {
          // If JSON parse fails, get text response
          try {
            const textResponse = await response.text();
            console.log('Error text response:', textResponse);
            
            if (textResponse.includes('Too many')) {
              errorMessage = 'ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
            } else {
              errorMessage = textResponse || errorMessage;
            }
          } catch (textError) {
            console.log('Could not parse error response as text either');
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success response data:', data);
      
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
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
      } else {
        console.log('Unexpected response format');
        throw new Error('รูปแบบการตอบกลับไม่ถูกต้อง');
      }
      
      if (!user) {
        console.log('No user data in response');
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      // Store tokens and user data
      sessionStorage.setItem('token', JSON.stringify(user));
      sessionStorage.setItem('accessToken', JSON.stringify(accessToken));
      sessionStorage.setItem('refreshToken', JSON.stringify(refreshToken));
      sessionStorage.setItem('user', JSON.stringify(user));

      console.log('Login successful, stored data:', {
        user: user,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      return {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ เพิ่ม Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (navigate, { getState, rejectWithValue }) => {
    try {
      console.log('🚪 Starting logout process...');
      
      const state = getState();
      const accessToken = state.auth.accessToken;
      
      // Call logout API if token exists
      if (accessToken) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          });
          
          console.log('Logout API response:', response.status);
        } catch (apiError) {
          console.error('Logout API error (continuing anyway):', apiError);
        }
      }
      
      // Clear all session storage
      console.log('🧹 Clearing session storage...');
      sessionStorage.clear();
      localStorage.clear();
      
      // Navigate to login page if navigate function provided
      if (navigate) {
        console.log('🔄 Navigating to login page...');
        navigate('/Login');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if API fails, still clear local data
      sessionStorage.clear();
      localStorage.clear();
      
      // Still navigate to login on error
      if (navigate) {
        navigate('/Login');
      }
      
      return rejectWithValue(error.message);
    }
  }
);

// Check if user is already logged in (from session storage)
const getInitialAuthState = () => {
  try {
    const token = sessionStorage.getItem('token');
    const accessToken = sessionStorage.getItem('accessToken');
    
    if (token && accessToken) {
      return {
        isAuthenticated: true,
        user: JSON.parse(token),
        accessToken: JSON.parse(accessToken),
        refreshToken: JSON.parse(sessionStorage.getItem('refreshToken')),
      };
    }
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
  }
  
  return {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
  };
};

const initialAuthState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialAuthState,
    loading: false,
    error: null,
    lastLoginAttempt: null, // Track last login attempt for rate limiting
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      sessionStorage.setItem('accessToken', JSON.stringify(action.payload.accessToken));
      sessionStorage.setItem('refreshToken', JSON.stringify(action.payload.refreshToken));
    },
    // Manual logout reducer (เก็บไว้เผื่อใช้)
    manualLogout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        console.log('Login pending...');
        state.loading = true;
        state.error = null;
        state.lastLoginAttempt = Date.now();
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('Login rejected:', action.payload);
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
      })
      // ✅ เพิ่ม Logout cases
      .addCase(logout.pending, (state) => {
        console.log('Logout pending...');
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        console.log('✅ Logout successful');
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        console.log('⚠️ Logout rejected (but still clearing state)');
        // Even on error, clear auth state
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setTokens, manualLogout } = authSlice.actions;
export default authSlice;