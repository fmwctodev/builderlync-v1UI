import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { useAppDispatch, useAppSelector } from '../../modules/roof-runner/store/hooks';
import { logout } from '../store/slices/authSlice';
import { forceLogout, hasLogoutFlag } from '../utils/logoutFlag';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  subscription_status?: string;
  subscription_tier?: string;
  selected_plan?: string;
}

interface OrganizationMembership {
  organization: Organization;
  role: string;
}

/**
 * OrganizationSelector - Allows users to select which organization to access
 *
 * Shown when:
 * - User is not in any organization context
 * - User belongs to multiple organizations
 * - User explicitly wants to switch organizations
 */
export function OrganizationSelector() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadOrganizations = async () => {
      // Don't load organizations if logout is in progress
      if (hasLogoutFlag()) {
        return;
      }

      try {
        // Check both Supabase session AND Redux auth state
        const { data: { user } } = await supabase.auth.getUser();

        // If no Supabase user but we have Redux user (external API auth), that's OK
        // We'll show a message that they need to complete Supabase migration
        if (!user && !reduxUser) {
          console.log('⚠️ No Supabase or Redux user found, redirecting to login');
          navigate('/auth/login');
          return;
        }

        // If we have a Redux user but no Supabase user, show migration notice
        if (!user && reduxUser) {
          console.log('ℹ️ User authenticated via external API but not migrated to Supabase yet');
          setError('Your account needs to be set up. Please contact support or try logging out and back in.');
          setIsLoading(false);
          return;
        }

        // Fetch all organizations user is a member of
        // Step 1: Get membership records (no join to avoid recursion)
        const { data: memberships, error: membershipsError } = await supabase
          .from('user_organizations')
          .select('organization_id,role,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (membershipsError) throw membershipsError;

        if (!memberships || memberships.length === 0) {
          setOrganizations([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Fetch organization details separately
        const orgIds = memberships.map(m => m.organization_id);
        const { data: organizations, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url, subscription_status')
          .in('id', orgIds);

        if (orgsError) throw orgsError;

        // Step 3: Combine memberships with organization data
        const orgs = memberships
          .map(m => {
            const org = organizations?.find(o => o.id === m.organization_id);
            if (!org) {
              console.warn(`⚠️ Organization ${m.organization_id} found in memberships but not in organizations table`);
              return null;
            }
            return {
              organization: org as Organization,
              role: m.role
            };
          })
          .filter(o => o !== null) as OrganizationMembership[];

        console.log(`✅ Found ${orgs.length} accessible organizations for user`);
        setOrganizations(orgs);

        // If no valid organizations found (memberships exist but orgs don't), create a default one
        if (orgs.length === 0 && memberships.length > 0) {
          console.log('⚠️ User has memberships but no accessible organizations - creating default organization');

          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const defaultOrgName = currentUser.user_metadata?.company_name ||
                                   currentUser.user_metadata?.full_name ||
                                   currentUser.email?.split('@')[0] ||
                                   'My Organization';

            const defaultSlug = defaultOrgName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
              .substring(0, 50);

            try {
              const { data: newOrgId, error: createError } = await supabase.rpc(
                'setup_new_organization',
                {
                  p_user_id: currentUser.id,
                  p_org_name: defaultOrgName,
                  p_org_slug: defaultSlug,
                }
              );

              if (createError) {
                console.error('❌ Failed to create default organization:', createError);
                throw createError;
              }

              console.log('✅ Default organization created, reloading...');
              window.location.reload();
              return;
            } catch (createErr) {
              console.error('❌ Error creating default organization:', createErr);
              setError('Failed to set up your account. Please try logging out and back in, or contact support.');
              setIsLoading(false);
              return;
            }
          }
        }

        // If user has exactly one organization, redirect directly
        if (orgs.length === 1 && !hasLogoutFlag()) {
          const org = orgs[0].organization;
          console.log('✅ Single organization found, redirecting immediately to:', org.slug);
          localStorage.setItem('currentOrganizationId', org.id);
          localStorage.setItem('currentOrganizationSlug', org.slug);
          navigate(`/org/${org.slug}/dashboard`, { replace: true });
        }
      } catch (err) {
        console.error('Error loading organizations:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load organizations';

        if (errorMessage.includes('infinite recursion') || errorMessage.includes('42P17')) {
          setError('Database configuration error. Please refresh the page or contact support.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizations();
  }, [navigate, reduxUser]);

  const handleSelectOrganization = (org: Organization) => {
    localStorage.setItem('currentOrganizationId', org.id);
    localStorage.setItem('currentOrganizationSlug', org.slug);
    navigate(`/org/${org.slug}/dashboard`);
  };

  const handleDirectLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Use force logout utility that handles timeout and failures
      await forceLogout(async () => {
        await supabase.auth.signOut();
      });

      // Clear Redux state (always execute)
      dispatch(logout());

      // Clear all organization-related storage
      localStorage.removeItem('currentOrganizationId');
      localStorage.removeItem('currentOrganizationSlug');

      // Force a full page reload to /auth/login
      // This bypasses React Router and ensures clean state
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, force logout
      // The forceLogout utility already set the flag
      window.location.href = '/auth/login';
    }
  };

  const handleBackToLogin = () => {
    // Use window.location to bypass React Router and AuthRoute redirect
    window.location.href = '/auth/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Retry
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Create New Organization
              </button>
              <button
                onClick={handleDirectLogout}
                disabled={isLoggingOut}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
        <CreateOrganizationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </>
    );
  }

  if (organizations.length === 0) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Organizations Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't belong to any organizations yet. Create a new organization to get started or wait for an invitation.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Create Organization
              </button>
              <button
                onClick={handleBackToLogin}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Back to Login
              </button>
              <button
                onClick={handleDirectLogout}
                disabled={isLoggingOut}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
        <CreateOrganizationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Select Organization
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose which organization you want to access
            </p>
          </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map(({ organization, role }) => (
            <button
              key={organization.id}
              onClick={() => handleSelectOrganization(organization)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-left border-2 border-transparent hover:border-red-500"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {organization.logo_url ? (
                    <img
                      src={organization.logo_url}
                      alt={organization.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-300 font-semibold text-xl">
                        {organization.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {organization.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {role}
                  </p>
                  {organization.subscription_status && (
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      organization.subscription_status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {organization.subscription_status}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center text-red-600 dark:text-red-400">
                <span className="text-sm font-medium">Access Dashboard</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Create New Organization
          </button>
          <button
            onClick={handleDirectLogout}
            disabled={isLoggingOut}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
        </div>
      </div>
      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
