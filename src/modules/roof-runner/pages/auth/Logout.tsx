import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../../../shared/store/slices/authSlice';
import { supabase } from '../../../../shared/lib/supabase';
import { forceLogout } from '../../../../shared/utils/logoutFlag';

/**
 * Logout Component
 *
 * Handles user logout with force logout capability to ensure
 * users can always logout even if network requests fail.
 */
const Logout: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Use force logout utility that handles timeout and failures
        await forceLogout(async () => {
          await supabase.auth.signOut();
        });

        // Clear Redux state (always execute)
        dispatch(logout());

        // Clear all organization-related storage
        localStorage.removeItem('currentOrganizationId');
        localStorage.removeItem('currentOrganizationSlug');

        // Force full page reload to login
        // This ensures clean state and AuthRoute sees logout flag
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Error during logout:', error);
        // Even if there's an error, force logout
        // The forceLogout utility already set the flag
        window.location.href = '/auth/login';
      }
    };

    handleLogout();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;
