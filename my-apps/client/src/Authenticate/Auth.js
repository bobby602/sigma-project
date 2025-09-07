// ✅ Fixed Auth.js - Use Redux instead of Context
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Auth = () => {
  // ✅ Use Redux state instead of Context
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // ✅ Simple conditional rendering without useEffect
  if (isAuthenticated && user) {
    return <Outlet />;
  }
  
  // ✅ Use replace to prevent history pollution
  return <Navigate to="/Login" replace />;
};

export default Auth;