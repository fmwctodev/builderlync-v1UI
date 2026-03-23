import React from 'react';

interface ProtectedOrgRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedOrgRoute - DEV MODE: Bypasses all auth and org checks
 */
export function ProtectedOrgRoute({ children }: ProtectedOrgRouteProps) {
  console.log('🔓 DEV MODE: Bypassing organization authentication');
  // DEV MODE: Skip all checks and render content directly
  return <>{children}</>;
}
