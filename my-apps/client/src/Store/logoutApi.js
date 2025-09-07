import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_CONFIG from '../config/api';

// Flag to prevent multiple logout calls
let isLoggingOut = false;

// Use unique action type to avoid conflict
export const LogoutApi = createAsyncThunk(
  'auth/logoutApi',  // Changed from 'auth/logout' to avoid conflict
  async (_, { rejectWithValue, getState }) => {
    // Prevent multiple calls
    if (isLoggingOut) {
      console.log('Logout already in progress, skipping...');
      return { success: true, message: 'Already logging out' };
    }

    try {
      isLoggingOut = true;
      
      // Get user info from Redux state or sessionStorage
      const state = getState();
      let userInfo = null;
      
      if (state.auth?.user) {
        userInfo = state.auth.user;
      } else {
        try {
          const storedToken = sessionStorage.getItem('token');
          if (storedToken) {
            userInfo = JSON.parse(storedToken);
          }
        } catch (parseError) {
          console.warn('Token parse error during logout:', parseError);
        }
      }

      console.log('Logging out user:', userInfo?.Login || userInfo?.Name || 'Unknown');

      // Call server logout API (if available)
      try {
        const storedRefreshToken = sessionStorage.getItem('refreshToken');
        if (storedRefreshToken && userInfo) {
          const refreshTokenValue = JSON.parse(storedRefreshToken);
          
          await axios.post(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
            username: userInfo.Login,
            token: refreshTokenValue
          });
          console.log('Server logout successful');
        }
      } catch (apiError) {
        console.warn('Server logout failed (continuing with local logout):', apiError.message);
        // Don't throw error because local logout is more important
      }

      // Clear storage safely
      const keysToRemove = [
        'token',
        'accessToken', 
        'refreshToken',
        'token2'
      ];
      
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });

      console.log('Session storage cleared successfully');

      return {
        success: true,
        user: userInfo?.Login || userInfo?.Name || 'Unknown',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Logout process error:', error);
      
      // Even if error occurs, still clear session for security
      const keysToRemove = ['token', 'accessToken', 'refreshToken', 'token2'];
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });

      return rejectWithValue({
        message: error.message || 'Logout failed',
        timestamp: new Date().toISOString()
      });

    } finally {
      // Reset flag after process completes
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
    }
  }
);