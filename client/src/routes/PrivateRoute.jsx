import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
  const { user } = useAuth();
  
  return user ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute; 