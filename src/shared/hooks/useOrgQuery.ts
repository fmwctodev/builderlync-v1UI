import { useCurrentOrganization } from '../context/OrgContext';
import { supabase } from '../lib/supabase';

/**
 * Custom hook for organization-scoped Supabase queries
 * Automatically injects organization_id into queries for data isolation
 *
 * @example
 * const contacts = useOrgQuery('contacts', async (orgId) => {
 *   const { data } = await supabase
 *     .from('contacts')
 *     .select('*')
 *     .eq('organization_id', orgId);
 *   return data;
 * });
 */
export function useOrgQuery<T>(
  queryKey: string,
  queryFn: (organizationId: string) => Promise<T | null>,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
  }
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { currentOrganizationId, isLoading: orgLoading } = useCurrentOrganization();
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!currentOrganizationId) {
      setError(new Error('No organization selected'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await queryFn(currentOrganizationId);
      setData(result);
    } catch (err) {
      console.error(`Error in useOrgQuery [${queryKey}]:`, err);
      setError(err instanceof Error ? err : new Error('Query failed'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId, queryKey, queryFn]);

  React.useEffect(() => {
    const enabled = options?.enabled !== false;
    if (enabled && !orgLoading && currentOrganizationId) {
      fetchData();
    }
  }, [currentOrganizationId, orgLoading, fetchData, options?.enabled]);

  return {
    data,
    isLoading: orgLoading || isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Helper to create a Supabase query builder with organization_id automatically applied
 */
export function createOrgQuery(table: string, organizationId: string) {
  return supabase
    .from(table)
    .select('*')
    .eq('organization_id', organizationId);
}

/**
 * Type-safe organization query helper
 */
export async function fetchOrgData<T>(
  table: string,
  organizationId: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<T[] | null> {
  let query = supabase
    .from(table)
    .select(options?.select || '*')
    .eq('organization_id', organizationId);

  // Apply additional filters
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply ordering
  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending !== false });
  }

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching org data from ${table}:`, error);
    throw error;
  }

  return data as T[];
}

// Add React import
import React from 'react';
