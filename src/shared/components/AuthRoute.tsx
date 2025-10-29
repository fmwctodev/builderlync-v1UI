import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../modules/roof-runner/store/hooks';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);

  if (user && token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};