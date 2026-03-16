import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../modules/roof-runner/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);

  if (!user || !token) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user is beta or has other access (oversmart user protection)
  if (user && !user.is_beta_user && !window.location.pathname.includes('/settings/billing')) {
    // For now, we allow access but this is where the strict redirect would go:
    // navigate('/org/settings/billing'); 
  }

  return <>{children}</>;
};