import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // DEV MODE: Skip all auth checks
  console.log('🔓 DEV MODE: Bypassing authentication');
  return <>{children}</>;
};