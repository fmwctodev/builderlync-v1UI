import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../modules/roof-runner/store/hooks';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const hasBillingAccess = !!(
    user?.is_beta_user ||
    user?.has_active_subscription ||
    user?.subscription_status === 'active' ||
    user?.subscription_status === 'trialing'
  );

  if (user && token) {
    if (!hasBillingAccess) {
      return <Navigate to={`/billing?email=${encodeURIComponent(user.email || '')}`} replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
