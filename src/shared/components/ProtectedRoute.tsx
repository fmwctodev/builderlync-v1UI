import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../modules/roof-runner/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const hasBillingAccess = !!(
    user?.is_beta_user ||
    user?.has_active_subscription ||
    user?.subscription_status === 'active' ||
    user?.subscription_status === 'trialing'
  );

  if (!user || !token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasBillingAccess) {
    const billingPath = `/billing?email=${encodeURIComponent(user.email || '')}`;

    if (location.pathname !== '/billing' && location.pathname !== '/billing/success' && location.pathname !== '/billing/cancel') {
      return <Navigate to={billingPath} replace />;
    }
  }

  return <>{children}</>;
};
