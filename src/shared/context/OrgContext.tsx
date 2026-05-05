import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isStagingMode, STAGING_MOCK_ORG } from '../utils/stagingAuth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  enabled_modules?: string[];
  subscription_status?: string;
  subscription_tier?: string;
  selected_plan?: string;
}

interface OrgContextType {
  currentOrganization: Organization | null;
  currentOrganizationId: string | null;
  currentOrganizationSlug: string | null;
  isLoading: boolean;
  error: string | null;
  setOrganization: (orgSlug: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
  hasAccess: (module: string) => boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganization = useCallback(async (orgSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Staging bypass: skip supabase calls and serve a mock org so QA /
      // design review can navigate without real backend access.
      if (isStagingMode()) {
        setCurrentOrganization({
          ...STAGING_MOCK_ORG,
          slug: orgSlug || STAGING_MOCK_ORG.slug,
          name: STAGING_MOCK_ORG.name,
        });
        setIsLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get organization by slug and verify user has access
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          logo_url,
          primary_color,
          enabled_modules,
          subscription_status
        `)
        .eq('slug', orgSlug)
        .maybeSingle();

      if (orgError) throw orgError;

      if (!org) {
        console.warn(`⚠️ Organization with slug "${orgSlug}" not found`);

        // Check if user has ANY organizations
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1);

        if (!memberships || memberships.length === 0) {
          // User has no organizations at all - create a default one
          console.log('ℹ️ User has no organizations, creating default organization...');

          const defaultOrgName = user.user_metadata?.company_name ||
                                 user.user_metadata?.full_name ||
                                 user.email?.split('@')[0] ||
                                 'My Organization';

          const defaultSlug = defaultOrgName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .substring(0, 50);

          const { data: newOrgId, error: createError } = await supabase.rpc(
            'setup_new_organization',
            {
              p_user_id: user.id,
              p_org_name: defaultOrgName,
              p_org_slug: defaultSlug,
            }
          );

          if (createError) {
            console.error('❌ Failed to create default organization:', {
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
              code: createError.code
            });
            throw new Error(`Failed to create organization: ${createError.message}. Please try again or contact support.`);
          }

          console.log('✅ Default organization created with ID:', newOrgId);

          // Now load the newly created organization
          const { data: newOrg, error: newOrgError } = await supabase
            .from('organizations')
            .select(`
              id,
              name,
              slug,
              logo_url,
              primary_color,
              enabled_modules,
              subscription_status
            `)
            .eq('slug', defaultSlug)
            .maybeSingle();

          if (newOrgError || !newOrg) {
            throw new Error('Failed to load newly created organization');
          }

          setCurrentOrganization(newOrg);
          localStorage.setItem('currentOrganizationId', newOrg.id);
          localStorage.setItem('currentOrganizationSlug', newOrg.slug);

          // Redirect to the correct slug
          window.location.href = `/org/${newOrg.slug}`;
          return;
        } else {
          // User has organizations but this slug doesn't exist - redirect to selector
          throw new Error('Organization not found. Please select a different organization.');
        }
      }

      // Verify user is a member of this organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id, role, is_active')
        .eq('organization_id', org.id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (membershipError || !membership) {
        throw new Error('You do not have access to this organization');
      }

      setCurrentOrganization(org);

      // Store in localStorage for quick access
      localStorage.setItem('currentOrganizationId', org.id);
      localStorage.setItem('currentOrganizationSlug', org.slug);
    } catch (err) {
      console.error('Error loading organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization');
      setCurrentOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setOrganization = useCallback(async (orgSlug: string) => {
    await loadOrganization(orgSlug);
  }, [loadOrganization]);

  const refreshOrganization = useCallback(async () => {
    if (currentOrganization?.slug) {
      await loadOrganization(currentOrganization.slug);
    }
  }, [currentOrganization?.slug, loadOrganization]);

  const hasAccess = useCallback((module: string): boolean => {
    if (!currentOrganization) return false;
    const enabledModules = currentOrganization.enabled_modules || [];
    return enabledModules.includes(module);
  }, [currentOrganization]);

  // Initialize organization from URL or localStorage
  useEffect(() => {
    const initializeOrganization = async () => {
      // Try to get org slug from URL path
      const pathParts = window.location.pathname.split('/');
      const orgSlugFromUrl = pathParts[2]; // /org/:orgSlug/...

      if (orgSlugFromUrl && pathParts[1] === 'org') {
        await loadOrganization(orgSlugFromUrl);
      } else {
        // Try localStorage as fallback
        const cachedSlug = localStorage.getItem('currentOrganizationSlug');
        if (cachedSlug) {
          await loadOrganization(cachedSlug);
        } else {
          // No org context available, try to load user's first organization
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // First, get the organization_id from memberships (no join to avoid recursion)
            const { data: memberships } = await supabase
              .from('organization_members')
              .select('organization_id')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .limit(1);

            if (memberships && memberships.length > 0) {
              // Then fetch the organization details separately
              const { data: org } = await supabase
                .from('organizations')
                .select('id, name, slug')
                .eq('id', memberships[0].organization_id)
                .single();

              if (org) {
                await loadOrganization(org.slug);
              }
            }
          }
        }
        setIsLoading(false);
      }
    };

    initializeOrganization();
  }, [loadOrganization]);

  const value: OrgContextType = {
    currentOrganization,
    currentOrganizationId: currentOrganization?.id || null,
    currentOrganizationSlug: currentOrganization?.slug || null,
    isLoading,
    error,
    setOrganization,
    refreshOrganization,
    hasAccess,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useCurrentOrganization() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useCurrentOrganization must be used within an OrgProvider');
  }
  return context;
}
