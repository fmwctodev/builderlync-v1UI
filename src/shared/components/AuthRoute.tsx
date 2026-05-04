import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { hasLogoutFlag, clearLogoutFlag } from '../utils/logoutFlag';

interface AuthRouteProps {
  children: React.ReactNode;
}

/**
 * AuthRoute - Protects auth pages from authenticated users
 *
 * Prevents redirect loops by:
 * 1. Checking logout flag first (allows immediate login during logout)
 * 2. Only checking Supabase session (ignoring stale Redux state)
 * 3. Navigation guard prevents double-redirects
 * 4. Simple redirect logic without race conditions
 */
export const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const isRedirecting = useRef(false);

  useEffect(() => {
    // Prevent double-checks if already redirecting
    if (isRedirecting.current) {
      return;
    }

    const checkSession = async () => {
      // If logout is in progress, clear flag and show login immediately
      if (hasLogoutFlag()) {
        clearLogoutFlag();
        setHasValidSession(false);
        setIsCheckingSession(false);
        return;
      }

      // Check only Supabase session (don't rely on Redux - it can be stale)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionValid = !!session;
        setHasValidSession(sessionValid);

        // Mark as redirecting if we have a valid session
        if (sessionValid) {
          isRedirecting.current = true;
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setHasValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If valid session exists, redirect to organizations
  if (hasValidSession) {
    return <Navigate to="/organizations" replace />;
  }

  return <>{children}</>;
};