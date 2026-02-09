import { supabase, supabaseAdmin, handleSupabaseError } from './supabase-client';
import { EnterpriseAccount, AccountModule, IntegrationConnection, AccountFilters } from '../types';
import { provisionEnterpriseAccount, type ProvisioningResult } from './account-provisioning-service';

export const getAccounts = async (filters?: AccountFilters): Promise<EnterpriseAccount[]> => {
  try {
    let query = supabaseAdmin
      .from('enterprise_accounts')
      .select('*')
      .not('organization_id', 'is', null)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,owner_email.ilike.%${filters.search}%`);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.plan && filters.plan !== 'all') {
      query = query.eq('plan', filters.plan);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(account => ({
      id: account.id,
      name: account.name,
      ownerName: account.owner_name,
      ownerEmail: account.owner_email,
      ownerPhone: account.owner_phone,
      status: account.status,
      plan: account.plan,
      billingCycle: account.billing_cycle,
      createdAt: account.created_at,
      renewalDate: account.renewal_date,
      seatsUsed: account.seats_used,
      seatsLimit: account.seats_limit,
      mrr: parseFloat(account.mrr),
      arr: parseFloat(account.arr),
      tags: account.tags || [],
      healthScore: account.health_score,
      lastLoginAt: account.last_login_at,
      metadata: account.metadata,
      provisioningStatus: account.provisioning_status,
      provisionedAt: account.provisioned_at,
      provisioningError: account.provisioning_error,
      organizationId: account.organization_id,
      ownerUserId: account.owner_user_id,
      ownerPlatformUserId: account.owner_platform_user_id,
    }));
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getAccountById = async (id: string): Promise<EnterpriseAccount | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('enterprise_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      ownerName: data.owner_name,
      ownerEmail: data.owner_email,
      ownerPhone: data.owner_phone,
      status: data.status,
      plan: data.plan,
      billingCycle: data.billing_cycle,
      createdAt: data.created_at,
      renewalDate: data.renewal_date,
      seatsUsed: data.seats_used,
      seatsLimit: data.seats_limit,
      mrr: parseFloat(data.mrr),
      arr: parseFloat(data.arr),
      tags: data.tags || [],
      healthScore: data.health_score,
      lastLoginAt: data.last_login_at,
      metadata: data.metadata,
      provisioningStatus: data.provisioning_status,
      provisionedAt: data.provisioned_at,
      provisioningError: data.provisioning_error,
      organizationId: data.organization_id,
      ownerUserId: data.owner_user_id,
      ownerPlatformUserId: data.owner_platform_user_id,
    };
  } catch (error) {
    console.error('Error fetching account:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getAccountModules = async (accountId: string): Promise<AccountModule[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('account_modules')
      .select('*')
      .eq('account_id', accountId);

    if (error) throw error;

    return (data || []).map(module => ({
      id: module.id,
      accountId: module.account_id,
      moduleName: module.module_name,
      enabled: module.enabled,
      settings: module.settings,
      enabledAt: module.enabled_at,
      enabledBy: module.enabled_by,
    }));
  } catch (error) {
    console.error('Error fetching account modules:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getAccountIntegrations = async (accountId: string): Promise<IntegrationConnection[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('account_integrations')
      .select('*')
      .eq('account_id', accountId);

    if (error) throw error;

    return (data || []).map(integration => ({
      id: integration.id,
      accountId: integration.account_id,
      provider: integration.provider,
      connected: integration.connected,
      status: integration.status,
      lastSyncAt: integration.last_sync_at,
      connectedAt: integration.connected_at,
      config: integration.config,
      errorMessage: integration.error_message,
    }));
  } catch (error) {
    console.error('Error fetching account integrations:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const updateAccountModules = async (
  accountId: string,
  modules: { moduleName: string; enabled: boolean }[]
): Promise<void> => {
  try {
    for (const module of modules) {
      const { error } = await supabaseAdmin
        .from('account_modules')
        .upsert({
          account_id: accountId,
          module_name: module.moduleName,
          enabled: module.enabled,
          enabled_at: module.enabled ? new Date().toISOString() : null,
        }, {
          onConflict: 'account_id,module_name'
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating account modules:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const updateAccount = async (
  id: string,
  updates: Partial<EnterpriseAccount>
): Promise<void> => {
  try {
    const dbUpdates: any = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.ownerName) dbUpdates.owner_name = updates.ownerName;
    if (updates.ownerEmail) dbUpdates.owner_email = updates.ownerEmail;
    if (updates.ownerPhone !== undefined) dbUpdates.owner_phone = updates.ownerPhone;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.plan) dbUpdates.plan = updates.plan;
    if (updates.billingCycle) dbUpdates.billing_cycle = updates.billingCycle;
    if (updates.renewalDate) dbUpdates.renewal_date = updates.renewalDate;
    if (updates.seatsLimit) dbUpdates.seats_limit = updates.seatsLimit;
    if (updates.tags) dbUpdates.tags = updates.tags;
    if (updates.healthScore !== undefined) dbUpdates.health_score = updates.healthScore;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('enterprise_accounts')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating account:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const createAccount = async (
  account: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'healthScore' | 'lastLoginAt'>
): Promise<string> => {
  try {
    const result = await provisionEnterpriseAccount({
      name: account.name,
      ownerName: account.ownerName,
      ownerEmail: account.ownerEmail,
      ownerPhone: account.ownerPhone,
      status: account.status,
      plan: account.plan,
      billingCycle: account.billingCycle,
      renewalDate: account.renewalDate,
      seatsUsed: account.seatsUsed,
      seatsLimit: account.seatsLimit,
      mrr: account.mrr,
      arr: account.arr,
      tags: account.tags,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to provision account');
    }

    if (!result.accountId) {
      throw new Error('Account created but ID not returned');
    }

    return result.accountId;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getProvisioningStatus = async (accountId: string): Promise<{
  status: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('enterprise_accounts')
      .select('provisioning_status, provisioning_error')
      .eq('id', accountId)
      .single();

    if (error) throw error;

    return {
      status: data.provisioning_status,
      error: data.provisioning_error,
    };
  } catch (error) {
    console.error('Error fetching provisioning status:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const deleteAccount = async (accountId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: account, error: accountError } = await supabaseAdmin
      .from('enterprise_accounts')
      .select('organization_id, owner_user_id, owner_platform_user_id, name')
      .eq('id', accountId)
      .single();

    if (accountError) throw accountError;
    if (!account) throw new Error('Account not found');

    const organizationId = account.organization_id;
    const ownerUserId = account.owner_user_id;
    const ownerPlatformUserId = account.owner_platform_user_id;

    await supabaseAdmin
      .from('audit_events')
      .insert({
        actor_type: 'super_admin',
        actor_name: 'System',
        action: 'account_deleted',
        target_type: 'account',
        target_id: accountId,
        target_name: account.name,
        metadata: {
          organization_id: organizationId,
          owner_user_id: ownerUserId,
        },
      });

    if (organizationId) {
      await supabaseAdmin
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId);

      await supabaseAdmin
        .from('organization_settings')
        .delete()
        .eq('organization_id', organizationId);

      await supabaseAdmin
        .from('brand_board')
        .delete()
        .eq('organization_id', organizationId);

      const { data: pipelines } = await supabaseAdmin
        .from('pipelines')
        .select('id')
        .eq('organization_id', organizationId);

      if (pipelines && pipelines.length > 0) {
        const pipelineIds = pipelines.map(p => p.id);
        await supabaseAdmin
          .from('pipeline_stages')
          .delete()
          .in('pipeline_id', pipelineIds);

        await supabaseAdmin
          .from('pipelines')
          .delete()
          .eq('organization_id', organizationId);
      }

      await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', organizationId);
    }

    await supabaseAdmin
      .from('account_modules')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('account_integrations')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('usage_tracking')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('usage_limits')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('billing_snapshots')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('stripe_subscriptions')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('stripe_customers')
      .delete()
      .eq('account_id', accountId);

    const { data: platformUsers } = await supabaseAdmin
      .from('platform_users')
      .select('user_id')
      .eq('account_id', accountId);

    if (platformUsers && platformUsers.length > 0) {
      const userIds = platformUsers.map(u => u.user_id);

      await supabaseAdmin
        .from('dashboard_widgets')
        .delete()
        .in('user_id', userIds);

      await supabaseAdmin
        .from('user_profile_data')
        .delete()
        .in('user_id', userIds);

      await supabaseAdmin
        .from('user_preferences')
        .delete()
        .in('user_id', userIds);

      for (const userId of userIds) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (authError) {
          console.error(`Failed to delete auth user ${userId}:`, authError);
        }
      }
    }

    await supabaseAdmin
      .from('platform_users')
      .delete()
      .eq('account_id', accountId);

    await supabaseAdmin
      .from('roles')
      .delete()
      .eq('account_id', accountId);

    const { error: deleteError } = await supabaseAdmin
      .from('enterprise_accounts')
      .delete()
      .eq('id', accountId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return {
      success: false,
      error: handleSupabaseError(error),
    };
  }
};

export const syncAllAccounts = async (): Promise<{
  success: boolean;
  synced?: number;
  created?: number;
  updated?: number;
  errors?: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabaseAdmin.rpc('sync_organizations_to_enterprise_accounts');

    if (error) throw error;

    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: true,
        synced: result.synced_count,
        created: result.created_count,
        updated: result.updated_count,
        errors: result.error_count,
      };
    }

    return {
      success: true,
      synced: 0,
      created: 0,
      updated: 0,
      errors: 0,
    };
  } catch (error: any) {
    console.error('Error syncing accounts:', error);
    return {
      success: false,
      error: handleSupabaseError(error),
    };
  }
};

export const recalculateHealthScore = async (accountId: string): Promise<{
  success: boolean;
  healthScore?: number;
  error?: string;
}> => {
  try {
    const account = await getAccountById(accountId);
    if (!account || !account.organizationId) {
      throw new Error('Account not found or not linked to organization');
    }

    const { data, error } = await supabaseAdmin.rpc('calculate_account_health_score', {
      org_id: account.organizationId,
    });

    if (error) throw error;

    await supabaseAdmin
      .from('enterprise_accounts')
      .update({ health_score: data, updated_at: new Date().toISOString() })
      .eq('id', accountId);

    return {
      success: true,
      healthScore: data,
    };
  } catch (error: any) {
    console.error('Error recalculating health score:', error);
    return {
      success: false,
      error: handleSupabaseError(error),
    };
  }
};
