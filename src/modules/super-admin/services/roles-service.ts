import { supabase } from './supabase-client';
import { Role, RoleScope, RolePermissions } from '../types';

export interface GetRolesParams {
  scope?: RoleScope | 'all';
  accountId?: string;
}

export async function getRoles(params: GetRolesParams = {}): Promise<Role[]> {
  const { scope, accountId } = params;

  let query = supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: true });

  if (scope && scope !== 'all') {
    query = query.eq('scope', scope);
  }

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching roles:', error);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return (data || []) as Role[];
}

export async function getGlobalRoles(): Promise<Role[]> {
  return getRoles({ scope: 'global' });
}

export async function getRoleById(roleId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching role:', error);
    throw new Error(`Failed to fetch role: ${error.message}`);
  }

  return data as Role;
}

export async function createRole(roleData: {
  name: string;
  description?: string;
  scope: RoleScope;
  account_id?: string | null;
  is_default?: boolean;
  permissions: RolePermissions;
}): Promise<string> {
  const { data, error } = await supabase
    .from('roles')
    .insert(roleData)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating role:', error);
    throw new Error(`Failed to create role: ${error.message}`);
  }

  return data.id;
}

export async function updateRole(
  roleId: string,
  updates: Partial<Role>
): Promise<void> {
  const { error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', roleId);

  if (error) {
    console.error('Error updating role:', error);
    throw new Error(`Failed to update role: ${error.message}`);
  }
}

export async function deleteRole(roleId: string): Promise<void> {
  const usersWithRole = await supabase
    .from('platform_users')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', roleId);

  if (usersWithRole.count && usersWithRole.count > 0) {
    throw new Error(
      `Cannot delete role: ${usersWithRole.count} user(s) are assigned to this role`
    );
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (error) {
    console.error('Error deleting role:', error);
    throw new Error(`Failed to delete role: ${error.message}`);
  }
}

export async function duplicateRole(roleId: string): Promise<string> {
  const originalRole = await getRoleById(roleId);

  if (!originalRole) {
    throw new Error('Role not found');
  }

  const newRoleData = {
    name: `Copy of ${originalRole.name}`,
    description: originalRole.description,
    scope: originalRole.scope,
    account_id: originalRole.account_id,
    is_default: false,
    permissions: originalRole.permissions,
  };

  return createRole(newRoleData);
}

export async function getRoleUserCount(roleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('platform_users')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', roleId);

  if (error) {
    console.error('Error counting users for role:', error);
    return 0;
  }

  return count || 0;
}

export async function checkRoleNameExists(
  name: string,
  scope: RoleScope,
  accountId?: string | null,
  excludeRoleId?: string
): Promise<boolean> {
  let query = supabase
    .from('roles')
    .select('id')
    .eq('name', name)
    .eq('scope', scope);

  if (scope === 'account') {
    query = query.eq('account_id', accountId);
  } else {
    query = query.is('account_id', null);
  }

  if (excludeRoleId) {
    query = query.neq('id', excludeRoleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking role name:', error);
    return false;
  }

  return (data && data.length > 0) || false;
}

export const DEFAULT_PERMISSIONS: RolePermissions = {
  dashboard: 'none',
  contacts: 'none',
  opportunities: 'none',
  jobs: 'none',
  claims: 'none',
  ai: 'none',
  marketing: 'none',
  sites: 'none',
  billing: 'none',
  reports: 'none',
  admin: 'none',
};

export const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  contacts: 'Contacts',
  opportunities: 'Opportunities',
  jobs: 'Jobs',
  claims: 'Claims',
  ai: 'Sierra AI',
  marketing: 'Marketing',
  sites: 'Sites',
  billing: 'Billing',
  reports: 'Reporting',
  admin: 'Account Admin',
};

export const MODULES = Object.keys(MODULE_LABELS).map(key => ({
  key,
  label: MODULE_LABELS[key],
}));
