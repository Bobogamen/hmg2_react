import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../user/UserContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loadingUser } = useUser();

  // 🔥 WAIT until user is loaded
  if (loadingUser) {
    return null; // or spinner
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = user.roles?.some(role =>
    allowedRoles.includes(role)
  );

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;