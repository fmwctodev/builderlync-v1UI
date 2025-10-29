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

  return <>{children}</>;
};