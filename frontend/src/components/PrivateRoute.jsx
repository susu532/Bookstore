import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../pages/Login';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!getAuthToken();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
