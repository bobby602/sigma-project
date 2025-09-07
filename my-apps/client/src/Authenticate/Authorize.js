import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const Authorize = () => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const location = useLocation();

  // เพิ่ม Loading state
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // เพิ่มการเช็ค authentication
  if (!isAuthenticated || !user) {
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  const userRole = user.StAdmin;
  const currentPath = location.pathname;

  // ปรับปรุงระบบ role permissions ให้ชัดเจน
  const rolePermissions = {
  '1': { 
    allowed: [
      '/MainPage', 
      '/SalesPage', 
      '/CustomerPage', 
      '/SummaryPages',
      '/CustPage',
      '/ProductList',
      '/PriceList',
      '/UserPage'
    ],
    defaultRoute: '/MainPage'
  },
  '2': { 
    allowed: [
      '/SalesPage',
      '/CustomerPage',
      '/ProductList',
      '/PriceList',
      '/SummaryPages',
      '/CustPage'
    ],
    defaultRoute: '/SalesPage'
  },
  '3': { 
    allowed: ['/PriceList'],
    defaultRoute: '/PriceList'
  }
}

// Get user's permissions (default to most restrictive if role not found)
  const permissions = rolePermissions[userRole] || rolePermissions['3'];

  // Check if current route is allowed
  const isRouteAllowed = permissions.allowed.some(route => 
    currentPath.startsWith(route)
  );

  // Special handling for root path
  if (currentPath === '/' || currentPath === '') {
    return <Navigate to={permissions.defaultRoute} replace />;
  }

  // Redirect if trying to access unauthorized route
  if (!isRouteAllowed) {
    console.log(`⚠️ User role ${userRole} not authorized for ${currentPath}`);
    return <Navigate to={permissions.defaultRoute} replace />;
  }

  // Render child routes if authorized
  return <Outlet />;
};

export default Authorize;