import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  subscriptionTier: string | null;
  isLoading: boolean;
  error: string | null;
  setOrganization: (orgSlug: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
  hasAccess: (module: string) => boolean;
  isProOrHigher: () => boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  // DEV MODE: Use mock organization
  const mockOrg: Organization = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Development Organization',
    slug: 'dev-org',
    logo_url: undefined,
    primary_color: '#dc2626',
    enabled_modules: ['all'],
    subscription_status: 'active',
    subscription_tier: 'enterprise',
  };

  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(mockOrg);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrganization = useCallback(async (orgSlug: string) => {
    // DEV MODE: Skip database calls, use mock org
    console.log('🔓 DEV MODE: Using mock organization');
    setIsLoading(false);
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

  const isProOrHigher = useCallback((): boolean => {
    if (!currentOrganization?.subscription_tier) return false;
    const tier = currentOrganization.subscription_tier.toLowerCase();
    return tier === 'pro' || tier === 'enterprise';
  }, [currentOrganization]);

  // Initialize organization from URL or localStorage
  useEffect(() => {
    // DEV MODE: No initialization needed, mock org is already set
    console.log('🔓 DEV MODE: Organization context initialized with mock data');
    setIsLoading(false);
  }, []);

  const value: OrgContextType = {
    currentOrganization,
    currentOrganizationId: currentOrganization?.id || null,
    currentOrganizationSlug: currentOrganization?.slug || null,
    subscriptionTier: currentOrganization?.subscription_tier || null,
    isLoading,
    error,
    setOrganization,
    refreshOrganization,
    hasAccess,
    isProOrHigher,
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

const defaultOrgContext: OrgContextType = {
  currentOrganization: null,
  currentOrganizationId: null,
  currentOrganizationSlug: null,
  subscriptionTier: null,
  isLoading: true,
  error: null,
  setOrganization: async () => {},
  refreshOrganization: async () => {},
  hasAccess: () => false,
  isProOrHigher: () => false,
};

export function useCurrentOrganizationSafe(): OrgContextType {
  const context = useContext(OrgContext);
  if (context === undefined) {
    return defaultOrgContext;
  }
  return context;
}
