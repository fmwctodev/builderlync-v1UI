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

      // Mock organization data
      const mockOrg: Organization = {
        id: 'mock-org-id',
        name: 'BuilderLync Demo',
        slug: orgSlug,
        logo_url: undefined,
        primary_color: '#ef4444',
        enabled_modules: ['abc-supply', 'crm', 'marketing', 'project-management', 'edge-view', 'roof-runner'],
        subscription_status: 'active',
        subscription_tier: 'pro'
      };

      setCurrentOrganization(mockOrg);
      localStorage.setItem('currentOrganizationId', mockOrg.id);
      localStorage.setItem('currentOrganizationSlug', mockOrg.slug);
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
          // Default to demo organization
          await loadOrganization('demo');
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
