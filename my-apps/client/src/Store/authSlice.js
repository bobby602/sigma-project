import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../config/api';

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log('🔄 Sending login request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`);
      console.log('📤 Login data:', { username, password: '***' });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response data:', errorData);
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      console.log('📦 Success response data:', data);
      
      // ✅ แก้ให้รับ response format ที่ถูกต้อง
      let user, accessToken, refreshToken;
      
      if (data.success) {
        // Format ใหม่
        user = data.user;
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
      } else if (data.result && data.result[0] && data.result[0][0]) {
        // Format เก่าของ backend
        user = data.result[0][0];
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
      } else {
        console.log('❌ Unexpected response format');
        throw new Error('Unexpected response format');
      }
      
      if (!user) {
        console.log('❌ No user data in response');
        throw new Error('No user data received');
      }
      
      // Store tokens and user data
      sessionStorage.setItem('token', JSON.stringify(user));
      sessionStorage.setItem('accessToken', JSON.stringify(accessToken));
      sessionStorage.setItem('refreshToken', JSON.stringify(refreshToken));

      console.log('✅ Login successful, stored data:', {
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
      console.error('💥 Login error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear session storage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token2');
      sessionStorage.clear();
      
      return true;
    } catch (error) {
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
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        console.log('🔄 Login pending...');
        state.loading = true;
        state.error = null;
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
        console.log('❌ Login rejected:', action.payload);
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setTokens } = authSlice.actions;
export default authSlice;