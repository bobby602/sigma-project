import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
// ✅ Fix import - login is exported from authSlice.js
import { login, clearError } from '../../Store/authSlice'; 
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(state => state.auth);
  
  // Use ref to prevent multiple navigation calls
  const hasNavigated = useRef(false);

  // Fixed useEffect with proper dependency handling
  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true;
      
      console.log('Navigating user:', user);
      
      // Navigate based on user role
      if (user.StAdmin === '1') {
        navigate('/MainPage', { replace: true });
      } else if (user.StAdmin === '2') {
        navigate('/SalesPage', { replace: true });
      } else {
        navigate('/PriceList', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Error handling with cleanup
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Reset navigation flag when component unmounts
  useEffect(() => {
    return () => {
      hasNavigated.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.warning('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    try {
      await dispatch(login({ username, password })).unwrap();
      toast.success('เข้าสู่ระบบสำเร็จ');
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled by the useEffect above
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(120deg, #2980b9, #8e44ad)',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      {/* เพิ่ม Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-1/3 w-8 h-8 bg-white/15 rounded-full animate-ping"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* 🎨 แก้เฉพาะส่วน Logo ให้สวยขึ้น */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="relative inline-block mb-6"
          >
            {/* Beautiful Sigma Logo Container */}
            <div className="relative w-24 h-24 mx-auto">
              {/* Outer gradient ring with Sigma colors */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-red-500 animate-pulse shadow-xl"></div>
              
              {/* Inner white circle */}
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center shadow-inner">
                {/* Sigma symbol with brand colors */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-600 to-red-500">
                    Σ
                  </div>
                  <div className="text-xs font-semibold text-gray-600 -mt-1">
                    SIGMA
                  </div>
                </div>
              </div>
              
              {/* Animated rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-spin" 
                   style={{ animationDuration: '8s' }}></div>
              
              {/* Secondary slower ring */}
              <div className="absolute inset-2 rounded-full border border-blue-300/30 animate-spin" 
                   style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
            </div>

            {/* Logo glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl animate-pulse"></div>
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2" 
              style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            ยินดีต้อนรับ
          </h1>
          <p className="text-gray-600 mb-1">Sigma Group Thailand</p>
          <p className="text-gray-500 text-sm">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Login Form - เหมือนเดิมทุกอย่าง */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="กรอกชื่อผู้ใช้"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              required
            />
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="กรอกรหัสผ่าน"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember Me */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between"
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                จดจำการเข้าสู่ระบบ
              </span>
            </label>
          </motion.div>

          {/* Submit Button - เพิ่ม style ตาม CSS ที่ให้มา */}
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-white font-semibold py-3 px-4 rounded-xl focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            style={{
              background: 'linear-gradient(120deg, #2980b9, #8e44ad)',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
            
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </span>
          </motion.button>
        </form>

        {/* เพิ่ม Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
            © 2025 Sigma Group Thailand
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative background lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-1 h-20 bg-white/10 transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-1 h-16 bg-white/10 transform -rotate-45"></div>
        <div className="absolute top-1/2 left-10 w-1 h-12 bg-white/10 transform rotate-12"></div>
        <div className="absolute top-1/3 right-10 w-1 h-14 bg-white/10 transform -rotate-12"></div>
      </div>
    </div>
  );
};

export default LoginPage;