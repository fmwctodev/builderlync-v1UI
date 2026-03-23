import { supabase } from '../../../../shared/lib/supabase';
import type { SocialAccountGroup } from '../types';

export async function getAccountGroups(orgId: string): Promise<SocialAccountGroup[]> {
  const { data, error } = await supabase
    .from('sierra_social_account_groups')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAccountGroupById(id: string): Promise<SocialAccountGroup | null> {
  const { data, error } = await supabase
    .from('sierra_social_account_groups')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createAccountGroup(
  orgId: string,
  name: string,
  accountIds: string[],
  createdBy: string,
  description?: string
): Promise<SocialAccountGroup> {
  const { data, error } = await supabase
    .from('sierra_social_account_groups')
    .insert({
      organization_id: orgId,
      name,
      account_ids: accountIds,
      created_by: createdBy,
      description: description ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccountGroup(
  id: string,
  updates: Partial<SocialAccountGroup>
): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_account_groups')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAccountGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_account_groups')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
