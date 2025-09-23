import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ roles = null }) => {
  const { user } = useAuth();
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Check role-based access if roles are specified
  if (roles && roles.length > 0) {
    const userRole = user.user?.role || user.role;
    if (!roles.includes(userRole)) {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return <Outlet />;
};

export default PrivateRoute; 