import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../user/UserContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.some(role => user.roles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;