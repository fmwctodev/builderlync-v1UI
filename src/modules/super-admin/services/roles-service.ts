import { apiClient } from './supabase-client';
import { Role, RoleScope, RolePermissions } from '../types';

export interface GetRolesParams {
  scope?: RoleScope | 'all';
  accountId?: string;
}

export async function getRoles(params: GetRolesParams = {}): Promise<Role[]> {
  const result = await apiClient.get('/super-admin/roles');
  
  // Handle standard ResponseHandler wrapper
  const data = result.success ? result.data : result;
  // If backend returns { data: [...] } inside the wrapper
  const roles = Array.isArray(data) ? data : (data?.data || []);
  
  // Filter by scope if needed
  if (params.scope && params.scope !== 'all') {
    return roles.filter((r: Role) => r.scope === params.scope);
  }

  return roles as Role[];
}

export async function getGlobalRoles(): Promise<Role[]> {
  return getRoles({ scope: 'global' });
}

export async function getRoleById(roleId: string): Promise<Role | null> {
  const result = await apiClient.get(`/super-admin/roles/${roleId}`);
  const data = result.success ? result.data : result;
  return (data?.data || data) as Role;
}

export async function createRole(roleData: {
  name: string;
  description?: string;
  scope: RoleScope;
  account_id?: string | null;
  is_default?: boolean;
  permissions: RolePermissions;
}): Promise<string> {
  const result = await apiClient.post('/super-admin/roles', roleData);
  
  if (!result.success && result.error) {
    throw new Error(result.error);
  }

  const data = result.data?.data || result.data || result;
  return data.id;
}

export async function updateRole(
  roleId: string,
  updates: Partial<Role>
): Promise<void> {
  const result = await apiClient.put(`/super-admin/roles/${roleId}`, updates);
  
  if (!result.success && result.error) {
    throw new Error(result.error);
  }
}

export async function deleteRole(roleId: string): Promise<void> {
  const result = await apiClient.delete(`/super-admin/roles/${roleId}`);
  
  if (!result.success && result.error) {
    throw new Error(result.error);
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

export async function getRoleUserCount(_roleId: string): Promise<number> {
  // TODO: Implement backend endpoint for user count by role
  console.warn('getRoleUserCount not implemented via API yet');
  return 0;
}

export async function checkRoleNameExists(
  _name: string,
  _scope: RoleScope,
  _accountId?: string | null,
  _excludeRoleId?: string
): Promise<boolean> {
  // TODO: Implement backend endpoint for role name check
  return false;
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
