import { supabase } from './supabase-client';
import { PlatformUser, UserStatus } from '../types';

export interface GetUsersParams {
  search?: string;
  status?: string;
  roleId?: string;
  accountId?: string;
  limit?: number;
  offset?: number;
}

export async function getUsers(params: GetUsersParams = {}): Promise<PlatformUser[]> {
  const { search, status, roleId, accountId, limit = 50, offset = 0 } = params;

  let query = supabase
    .from('platform_users')
    .select(`
      id,
      email,
      full_name,
      status,
      last_login_at,
      created_at,
      updated_at,
      account_id,
      role_id,
      invited_at,
      invited_by,
      metadata,
      user_id,
      account:enterprise_accounts!account_id (
        id,
        name,
        status,
        plan
      ),
      role:roles!role_id (
        id,
        name,
        description,
        scope,
        permissions
      )
    `)
    .not('user_id', 'is', null)
    .not('account_id', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (roleId && roleId !== 'all') {
    query = query.eq('role_id', roleId);
  }

  if (accountId && accountId !== 'all') {
    query = query.eq('account_id', accountId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (data || []).map(user => ({
    ...user,
    account: user.account ? (Array.isArray(user.account) ? user.account[0] : user.account) : undefined,
    role: user.role ? (Array.isArray(user.role) ? user.role[0] : user.role) : undefined,
  })) as PlatformUser[];
}

export async function getUserById(userId: string): Promise<PlatformUser | null> {
  const { data, error } = await supabase
    .from('platform_users')
    .select(`
      id,
      email,
      full_name,
      status,
      last_login_at,
      created_at,
      updated_at,
      account_id,
      role_id,
      invited_at,
      invited_by,
      metadata,
      account:enterprise_accounts!account_id (
        id,
        name,
        status,
        plan,
        created_at,
        owner_name,
        owner_email
      ),
      role:roles!role_id (
        id,
        name,
        description,
        scope,
        permissions,
        is_default
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    account: data.account ? (Array.isArray(data.account) ? data.account[0] : data.account) : undefined,
    role: data.role ? (Array.isArray(data.role) ? data.role[0] : data.role) : undefined,
  } as PlatformUser;
}

export async function createUser(userData: {
  account_id: string;
  email: string;
  full_name?: string;
  status?: UserStatus;
  role_id?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('platform_users')
    .insert({
      ...userData,
      status: userData.status || 'invited',
      invited_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data.id;
}

export async function updateUser(
  userId: string,
  updates: Partial<PlatformUser>
): Promise<void> {
  const { error } = await supabase
    .from('platform_users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function changeUserStatus(
  userId: string,
  status: UserStatus
): Promise<void> {
  await updateUser(userId, { status });
}

export async function changeUserRole(
  userId: string,
  roleId: string | null
): Promise<void> {
  await updateUser(userId, { role_id: roleId });
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

export async function resendInvite(userId: string): Promise<void> {
  await updateUser(userId, {
    invited_at: new Date().toISOString(),
  });
}

export async function getUserCount(accountId?: string): Promise<number> {
  let query = supabase
    .from('platform_users')
    .select('id', { count: 'exact', head: true })
    .not('user_id', 'is', null);

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting users:', error);
    return 0;
  }

  return count || 0;
}

export async function syncAllUsers(): Promise<{
  success: boolean;
  total?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('sync_organization_members_to_platform_users');

    if (error) throw error;

    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: true,
        total: result.total_processed,
        created: result.created_count,
        updated: result.updated_count,
        skipped: result.skipped_count,
        errors: result.error_count,
      };
    }

    return {
      success: true,
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };
  } catch (error: any) {
    console.error('Error syncing users:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync users',
    };
  }
}
