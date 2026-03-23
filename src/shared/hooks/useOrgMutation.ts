import { useCurrentOrganization } from '../context/OrgContext';
import { supabase } from '../lib/supabase';
import { useState, useCallback } from 'react';

/**
 * Custom hook for organization-scoped mutations (INSERT, UPDATE, DELETE)
 * Automatically injects organization_id into write operations
 *
 * @example
 * const createContact = useOrgMutation(async (orgId, data) => {
 *   const { data: contact, error } = await supabase
 *     .from('contacts')
 *     .insert({ ...data, organization_id: orgId })
 *     .select()
 *     .single();
 *   return contact;
 * });
 *
 * // Usage
 * await createContact({ name: 'John Doe', email: 'john@example.com' });
 */
export function useOrgMutation<TData = any, TResult = any>(
  mutationFn: (organizationId: string, data: TData) => Promise<TResult>
): {
  mutate: (data: TData) => Promise<TResult | null>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
} {
  const { currentOrganizationId } = useCurrentOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data: TData): Promise<TResult | null> => {
      if (!currentOrganizationId) {
        const err = new Error('No organization selected');
        setError(err);
        throw err;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await mutationFn(currentOrganizationId, data);
        return result;
      } catch (err) {
        console.error('Error in useOrgMutation:', err);
        const error = err instanceof Error ? err : new Error('Mutation failed');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentOrganizationId, mutationFn]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    reset,
  };
}

/**
 * Helper for inserting data with organization_id
 */
export async function insertOrgData<T>(
  table: string,
  organizationId: string,
  data: Omit<T, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<T> {
  const { data: result, error } = await supabase
    .from(table)
    .insert({ ...data, organization_id: organizationId })
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }

  return result as T;
}

/**
 * Helper for updating data with organization_id verification
 */
export async function updateOrgData<T>(
  table: string,
  organizationId: string,
  id: string,
  data: Partial<T>
): Promise<T> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }

  return result as T;
}

/**
 * Helper for deleting data with organization_id verification
 */
export async function deleteOrgData(
  table: string,
  organizationId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
}

/**
 * Batch insert helper
 */
export async function batchInsertOrgData<T>(
  table: string,
  organizationId: string,
  records: Omit<T, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[]
): Promise<T[]> {
  const recordsWithOrg = records.map(record => ({
    ...record,
    organization_id: organizationId,
  }));

  const { data, error } = await supabase
    .from(table)
    .insert(recordsWithOrg)
    .select();

  if (error) {
    console.error(`Error batch inserting into ${table}:`, error);
    throw error;
  }

  return data as T[];
}
