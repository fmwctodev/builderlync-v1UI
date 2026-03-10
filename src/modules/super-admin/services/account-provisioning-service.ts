import {
  supabaseAdmin,
  handleSupabaseError,
  isServiceRoleConfigured,
  getServiceRoleErrorMessage
} from './supabase-client';
import type { EnterpriseAccount } from '../types';
import { createStripeCustomer, type StripeCustomerData } from './stripe/stripe-customers-service';
import { createStripeSubscription, type CreateSubscriptionData } from './stripe/stripe-subscriptions-service';
import { getPricesByPlan } from './stripe/stripe-products-service';
import { isStripeConfigured } from './stripe/stripe-client';

/**
 * Log a provisioning error to the database for monitoring and debugging
 */
async function logProvisioningError(
  accountId: string | undefined,
  accountName: string,
  errorType: string,
  errorStep: string,
  errorMessage: string,
  errorDetails: any,
  context: any
): Promise<void> {
  try {
    await supabaseAdmin.from('provisioning_errors').insert({
      account_id: accountId || null,
      account_name: accountName,
      error_type: errorType,
      error_step: errorStep,
      error_message: errorMessage,
      error_details: typeof errorDetails === 'object' ? errorDetails : { raw: String(errorDetails) },
      context: typeof context === 'object' ? context : { raw: String(context) },
    });
  } catch (err) {
    console.error('Failed to log provisioning error:', err);
    // Don't throw - logging failure should not affect the main flow
  }
}

export interface ProvisioningResult {
  success: boolean;
  accountId?: string;
  organizationId?: string;
  ownerUserId?: string;
  error?: string;
  step?: string;
}

interface AccountCreationData {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  status: 'trial' | 'active' | 'past_due' | 'suspended';
  seatsLimit: number;
  seatsUsed: number;
  tags: string[];
  mrr: number;
  arr: number;
  billingCycle: 'monthly' | 'annual';
  renewalDate: string;
}

const PLAN_LIMITS = {
  Starter: {
    sms_messages: 5000,
    mms_messages: 1000,
    call_minutes: 2000,
    ai_minutes: 500,
    emails_sent: 10000,
    storage_gb: 50,
    seats: -1,
    api_calls_per_month: 50000,
  },
  Pro: {
    sms_messages: 15000,
    mms_messages: 3000,
    call_minutes: 6000,
    ai_minutes: 2000,
    emails_sent: 50000,
    storage_gb: 200,
    seats: -1,
    api_calls_per_month: 200000,
  },
  Enterprise: {
    sms_messages: 50000,
    mms_messages: 10000,
    call_minutes: 20000,
    ai_minutes: 10000,
    emails_sent: 200000,
    storage_gb: 500,
    seats: -1,
    api_calls_per_month: -1,
    white_label_domains: 5,
  },
};

const ALL_MODULES = [
  'Dashboard',
  'Contacts',
  'Conversations',
  'Calendars',
  'Jobs',
  'Opportunities',
  'Proposals',
  'Invoices',
  'Payments',
  'Material_Orders',
  'Work_Orders',
  'Job_Photos',
  'Marketing',
  'Automation',
  'Reputation',
  'Reporting',
  'File_Manager',
  'Sierra_AI',
  'Team_Messaging',
  'Integrations',
];

export async function provisionEnterpriseAccount(
  data: AccountCreationData
): Promise<ProvisioningResult> {
  let accountId: string | undefined;
  let organizationId: string | undefined;
  let ownerUserId: string | undefined;
  let platformUserId: string | undefined;

  try {
    // Pre-flight check: Verify service role key is configured
    if (!isServiceRoleConfigured()) {
      console.error('Service role key is not configured');
      return {
        success: false,
        error: getServiceRoleErrorMessage(),
        step: 'pre_flight_check',
      };
    }

    // Step 1: Validate account data
    const validationError = await validateAccountData(data);
    if (validationError) {
      await logProvisioningError(undefined, data.name, 'validation', 'validate_account_data', validationError, {}, { email: data.ownerEmail, plan: data.plan });
      return { success: false, error: validationError, step: 'validation' };
    }

    // Step 2: Create enterprise account record (status: provisioning)
    const accountResult = await createEnterpriseAccount(data);
    if (!accountResult.success || !accountResult.accountId) {
      await logProvisioningError(undefined, data.name, 'database', 'create_account', accountResult.error || 'Failed to create account', accountResult, { email: data.ownerEmail, plan: data.plan });
      return {
        success: false,
        error: accountResult.error || 'Failed to create account',
        step: 'create_account',
      };
    }
    accountId = accountResult.accountId;

    // Step 3: Create auth user for owner
    const authResult = await createAuthUser(data.ownerEmail, data.ownerName);
    if (!authResult.success || !authResult.userId) {
      await markProvisioningFailed(accountId, authResult.error || 'Failed to create auth user', 'create_auth_user');
      await logProvisioningError(accountId, data.name, 'auth', 'create_auth_user', authResult.error || 'Failed to create auth user', authResult, { email: data.ownerEmail, plan: data.plan });
      return {
        success: false,
        error: authResult.error,
        step: 'create_auth_user',
        accountId,
      };
    }
    ownerUserId = authResult.userId;

    // Step 4: Create organization
    const orgResult = await createOrganization(accountId, data, ownerUserId);
    if (!orgResult.success || !orgResult.organizationId) {
      await markProvisioningFailed(accountId, orgResult.error || 'Failed to create organization', 'create_organization');
      await logProvisioningError(accountId, data.name, 'database', 'create_organization', orgResult.error || 'Failed to create organization', orgResult, { email: data.ownerEmail, plan: data.plan, ownerUserId });
      return {
        success: false,
        error: orgResult.error,
        step: 'create_organization',
        accountId,
      };
    }
    organizationId = orgResult.organizationId;

    // Step 5: Link organization to account
    await linkOrganizationToAccount(accountId, organizationId);

    // Step 6: Create default roles
    const rolesResult = await createDefaultRoles(organizationId, accountId);
    const ownerRoleId = rolesResult.ownerRoleId;

    // Step 7: Create platform user
    const platformUserResult = await createPlatformUser(
      ownerUserId,
      accountId,
      data.ownerEmail,
      data.ownerName,
      ownerRoleId
    );
    if (!platformUserResult.success || !platformUserResult.platformUserId) {
      await markProvisioningFailed(accountId, platformUserResult.error || 'Failed to create platform user', 'create_platform_user');
      return {
        success: false,
        error: platformUserResult.error,
        step: 'create_platform_user',
        accountId,
        organizationId,
      };
    }
    platformUserId = platformUserResult.platformUserId;

    // Step 8: Update account with user IDs
    await updateAccountOwnerIds(accountId, ownerUserId, platformUserId);

    // Step 9: Create organization member
    await createOrganizationMember(organizationId, ownerUserId, 'owner');

    // Step 10: Create user profile
    await createUserProfile(ownerUserId, data.ownerName);

    // Step 11: Create user preferences
    await createUserPreferences(ownerUserId);

    // Step 12: Initialize organization settings
    await initializeOrganizationSettings(organizationId);

    // Step 13: Provision all modules (all plans get all modules)
    await provisionModules(accountId, data.plan);

    // Step 14: Create default pipelines
    await createDefaultPipelines(organizationId, data.plan);

    // Step 15: Initialize dashboard widgets
    await initializeDashboardWidgets(platformUserId, data.plan);

    // Step 16: Set up brand board
    await setupBrandBoard(organizationId);

    // Step 17: Initialize usage tracking
    await initializeUsageTracking(accountId, data.plan);

    // Step 18: Create billing snapshot
    await createBillingSnapshot(accountId, data);

    // Step 19: Create Stripe customer and subscription (if configured)
    if (isStripeConfigured() && data.plan !== 'Enterprise') {
      try {
        const stripeCustomerResult = await createStripeCustomer({
          accountId,
          email: data.ownerEmail,
          name: data.ownerName,
          phone: data.ownerPhone,
          metadata: {
            account_id: accountId,
            plan: data.plan,
          },
        });

        if (stripeCustomerResult.success && stripeCustomerResult.customerId) {
          const billingInterval = data.billingCycle === 'annual' ? 'year' : 'month';
          const { data: priceData } = await getPricesByPlan(data.plan, billingInterval);

          if (priceData?.stripe_price_id) {
            const trialDays = data.status === 'trial' ? 14 : undefined;

            await createStripeSubscription({
              accountId,
              stripeCustomerId: stripeCustomerResult.customerId,
              stripePriceId: priceData.stripe_price_id,
              planName: data.plan,
              billingCycle: data.billingCycle,
              trialPeriodDays: trialDays,
            });
          }
        }
      } catch (stripeError) {
        console.error('Stripe provisioning error (non-fatal):', stripeError);
      }
    }

    // Step 20: Create audit event
    await createAuditEvent('account_created', accountId, data);

    // Step 21: Mark provisioning as complete
    await markProvisioningComplete(accountId);

    // Step 22: Send welcome email (TODO: implement email service)
    // await sendWelcomeEmail(data.ownerEmail, data.plan, accountId);

    return {
      success: true,
      accountId,
      organizationId,
      ownerUserId,
    };
  } catch (error: any) {
    console.error('Provisioning error:', error);

    // Attempt rollback of partially created resources
    if (accountId || organizationId || ownerUserId || platformUserId) {
      console.log('Attempting to rollback partially created resources...');
      await rollbackProvisioningResources({
        accountId,
        organizationId,
        ownerUserId,
        platformUserId,
      });
    }

    return {
      success: false,
      error: error.message || 'Unknown provisioning error',
      accountId,
      organizationId,
      ownerUserId,
    };
  }
}

async function rollbackProvisioningResources(resources: {
  accountId?: string;
  organizationId?: string;
  ownerUserId?: string;
  platformUserId?: string;
}): Promise<void> {
  try {
    console.log('Rolling back resources:', resources);

    // Delete in reverse order of creation
    if (resources.organizationId) {
      await supabaseAdmin.from('dashboard_widgets').delete().eq('organization_id', resources.organizationId);
      await supabaseAdmin.from('pipeline_stages').delete().eq('pipeline_id', resources.organizationId);
      await supabaseAdmin.from('pipelines').delete().eq('organization_id', resources.organizationId);
      await supabaseAdmin.from('organization_settings').delete().eq('organization_id', resources.organizationId);
      await supabaseAdmin.from('organization_members').delete().eq('organization_id', resources.organizationId);
      await supabaseAdmin.from('organizations').delete().eq('id', resources.organizationId);
    }

    if (resources.ownerUserId) {
      await supabaseAdmin.from('user_preferences').delete().eq('user_id', resources.ownerUserId);
      await supabaseAdmin.from('user_profile_data').delete().eq('user_id', resources.ownerUserId);
    }

    if (resources.platformUserId) {
      await supabaseAdmin.from('platform_users').delete().eq('id', resources.platformUserId);
    }

    if (resources.accountId) {
      await supabaseAdmin.from('usage_tracking').delete().eq('account_id', resources.accountId);
      await supabaseAdmin.from('usage_limits').delete().eq('account_id', resources.accountId);
      await supabaseAdmin.from('account_modules').delete().eq('account_id', resources.accountId);
      await supabaseAdmin.from('enterprise_accounts').delete().eq('id', resources.accountId);
    }

    if (resources.ownerUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(resources.ownerUserId);
      } catch (err) {
        console.warn('Could not delete auth user during rollback:', err);
      }
    }

    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Error during rollback (non-fatal):', error);
    // Don't throw - rollback is best effort
  }
}

async function cleanupFailedProvisioning(email: string, accountName: string): Promise<void> {
  try {
    console.log('Cleaning up any failed provisioning attempts...');

    // Find and delete failed enterprise accounts with this name
    const { data: failedAccounts } = await supabaseAdmin
      .from('enterprise_accounts')
      .select('id, owner_user_id, owner_platform_user_id, organization_id')
      .eq('name', accountName)
      .in('provisioning_status', ['failed', 'provisioning'])
      .limit(10);

    if (failedAccounts && failedAccounts.length > 0) {
      console.log(`Found ${failedAccounts.length} failed account(s) to clean up`);

      for (const account of failedAccounts) {
        // Delete related records
        if (account.organization_id) {
          await supabaseAdmin.from('organization_members').delete().eq('organization_id', account.organization_id);
          await supabaseAdmin.from('organization_settings').delete().eq('organization_id', account.organization_id);
          await supabaseAdmin.from('pipelines').delete().eq('organization_id', account.organization_id);
          await supabaseAdmin.from('organizations').delete().eq('id', account.organization_id);
        }

        if (account.owner_platform_user_id) {
          await supabaseAdmin.from('platform_users').delete().eq('id', account.owner_platform_user_id);
        }

        if (account.owner_user_id) {
          await supabaseAdmin.from('user_profile_data').delete().eq('user_id', account.owner_user_id);
          await supabaseAdmin.from('user_preferences').delete().eq('user_id', account.owner_user_id);
          // Try to delete auth user (may fail if service role key not available)
          try {
            await supabaseAdmin.auth.admin.deleteUser(account.owner_user_id);
          } catch (err) {
            console.warn('Could not delete auth user:', err);
          }
        }

        // Delete account modules and account itself
        await supabaseAdmin.from('account_modules').delete().eq('account_id', account.id);
        await supabaseAdmin.from('enterprise_accounts').delete().eq('id', account.id);
      }

      console.log('Cleanup complete');
    }

    // Also cleanup any orphaned platform users with this email
    const { data: orphanedUsers } = await supabaseAdmin
      .from('platform_users')
      .select('id, user_id')
      .eq('email', email)
      .limit(5);

    if (orphanedUsers && orphanedUsers.length > 0) {
      for (const user of orphanedUsers) {
        await supabaseAdmin.from('user_profile_data').delete().eq('user_id', user.user_id);
        await supabaseAdmin.from('user_preferences').delete().eq('user_id', user.user_id);
        await supabaseAdmin.from('platform_users').delete().eq('id', user.id);

        try {
          await supabaseAdmin.auth.admin.deleteUser(user.user_id);
        } catch (err) {
          console.warn('Could not delete orphaned auth user:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Don't throw - cleanup is best effort
  }
}

async function validateAccountData(data: AccountCreationData): Promise<string | null> {
  // First, cleanup any failed provisioning attempts
  await cleanupFailedProvisioning(data.ownerEmail, data.name);

  // Check if email already exists in active accounts
  const { data: existingUser } = await supabaseAdmin
    .from('platform_users')
    .select('id')
    .eq('email', data.ownerEmail)
    .maybeSingle();

  if (existingUser) {
    return `Email ${data.ownerEmail} is already in use by an active account`;
  }

  // Check if account name is unique (only active accounts)
  const { data: existingAccount } = await supabaseAdmin
    .from('enterprise_accounts')
    .select('id, provisioning_status')
    .eq('name', data.name)
    .neq('provisioning_status', 'failed')
    .maybeSingle();

  if (existingAccount) {
    return `Account name "${data.name}" is already taken`;
  }

  return null;
}

async function createEnterpriseAccount(data: AccountCreationData): Promise<{ success: boolean; accountId?: string; error?: string }> {
  try {
    const { data: account, error } = await supabaseAdmin
      .from('enterprise_accounts')
      .insert({
        name: data.name,
        owner_name: data.ownerName,
        owner_email: data.ownerEmail,
        owner_phone: data.ownerPhone,
        status: data.status,
        plan: data.plan,
        billing_cycle: data.billingCycle,
        renewal_date: data.renewalDate,
        seats_used: data.seatsUsed,
        seats_limit: data.seatsLimit,
        mrr: data.mrr,
        arr: data.arr,
        tags: data.tags,
        provisioning_status: 'provisioning',
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, accountId: account.id };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
}

async function createAuthUser(email: string, fullName: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) throw error;

    return { success: true, userId: data.user.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function createOrganization(accountId: string, data: AccountCreationData, ownerUserId: string): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    // Generate slug
    const { data: slugData } = await supabaseAdmin.rpc('generate_organization_slug', { org_name: data.name });
    const slug = slugData || data.name.toLowerCase().replace(/\s+/g, '-');

    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: data.name,
        legal_name: data.name,
        display_name: data.name,
        slug,
        email: data.ownerEmail,
        phone: data.ownerPhone,
        primary_color: '#dc2626',
        subscription_status: data.status,
        subscription_tier: data.plan,
        selected_plan: data.plan,
        trial_ends_at: data.status === 'trial' ? data.renewalDate : null,
        max_users: -1,
        max_locations: data.plan === 'Enterprise' ? -1 : 5,
        storage_limit_gb: PLAN_LIMITS[data.plan].storage_gb,
        enabled_modules: ALL_MODULES,
        is_active: true,
        enterprise_account_id: accountId,
        created_by: ownerUserId,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, organizationId: org.id };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
}

async function linkOrganizationToAccount(accountId: string, organizationId: string): Promise<void> {
  await supabaseAdmin
    .from('enterprise_accounts')
    .update({ organization_id: organizationId })
    .eq('id', accountId);
}

async function createDefaultRoles(organizationId: string, accountId: string): Promise<{ ownerRoleId?: string }> {
  const defaultRoles = [
    {
      name: 'Owner',
      description: 'Full access to all features and settings',
      scope: 'account',
      account_id: accountId,
      is_default: false,
      permissions: { all: true },
    },
    {
      name: 'Admin',
      description: 'Administrative access to most features',
      scope: 'account',
      account_id: accountId,
      is_default: false,
      permissions: { manage_users: true, manage_settings: true, view_reports: true },
    },
    {
      name: 'Manager',
      description: 'Manage jobs, contacts, and team',
      scope: 'account',
      account_id: accountId,
      is_default: false,
      permissions: { manage_jobs: true, manage_contacts: true, view_reports: true },
    },
    {
      name: 'User',
      description: 'Standard user access',
      scope: 'account',
      account_id: accountId,
      is_default: true,
      permissions: { view_jobs: true, view_contacts: true },
    },
  ];

  let ownerRoleId: string | undefined;

  for (const role of defaultRoles) {
    const { data } = await supabaseAdmin
      .from('roles')
      .insert(role)
      .select('id')
      .single();

    if (role.name === 'Owner' && data) {
      ownerRoleId = data.id;
    }
  }

  return { ownerRoleId };
}

async function createPlatformUser(
  userId: string,
  accountId: string,
  email: string,
  fullName: string,
  roleId?: string
): Promise<{ success: boolean; platformUserId?: string; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('platform_users')
      .insert({
        account_id: accountId,
        user_id: userId,
        email,
        full_name: fullName,
        status: 'active',
        role_id: roleId,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, platformUserId: data.id };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
}

async function updateAccountOwnerIds(accountId: string, ownerUserId: string, platformUserId: string): Promise<void> {
  await supabaseAdmin
    .from('enterprise_accounts')
    .update({
      owner_user_id: ownerUserId,
      owner_platform_user_id: platformUserId,
    })
    .eq('id', accountId);
}

async function createOrganizationMember(organizationId: string, userId: string, role: string): Promise<void> {
  await supabaseAdmin.from('organization_members').insert({
    organization_id: organizationId,
    user_id: userId,
    role,
    status: 'active',
  });
}

async function createUserProfile(userId: string, fullName: string): Promise<void> {
  const [firstName, ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ');

  await supabaseAdmin.from('user_profile_data').insert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    display_name: fullName,
  });
}

async function createUserPreferences(userId: string): Promise<void> {
  await supabaseAdmin.from('user_preferences').insert({
    user_id: userId,
    theme: 'system',
    email_notifications: true,
    push_notifications: true,
  });
}

async function initializeOrganizationSettings(organizationId: string): Promise<void> {
  await supabaseAdmin.from('organization_settings').insert({
    organization_id: organizationId,
    setting_key: 'business_hours',
    setting_value: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
    },
  });
}

async function provisionModules(accountId: string, plan: string): Promise<void> {
  const modules = ALL_MODULES.map((moduleName) => ({
    account_id: accountId,
    module_name: moduleName,
    enabled: true,
    enabled_at: new Date().toISOString(),
    settings: {},
  }));

  await supabaseAdmin.from('account_modules').insert(modules);
}

async function createDefaultPipelines(organizationId: string, plan: string): Promise<void> {
  // Create basic sales pipeline for all plans
  const { data: pipeline } = await supabaseAdmin
    .from('pipelines')
    .insert({
      organization_id: organizationId,
      name: 'Sales Pipeline',
      job_type: 'roofing',
      description: 'Default sales pipeline',
      is_default: true,
    })
    .select('id')
    .single();

  if (pipeline) {
    const stages = [
      { name: 'Lead', order: 1, color: '#3b82f6' },
      { name: 'Qualified', order: 2, color: '#8b5cf6' },
      { name: 'Proposal', order: 3, color: '#f59e0b' },
      { name: 'Won', order: 4, color: '#10b981' },
      { name: 'Lost', order: 5, color: '#ef4444' },
    ];

    const stageInserts = stages.map((stage) => ({
      pipeline_id: pipeline.id,
      name: stage.name,
      stage_order: stage.order,
      color: stage.color,
    }));

    await supabaseAdmin.from('pipeline_stages').insert(stageInserts);
  }
}

async function initializeDashboardWidgets(userId: string, plan: string): Promise<void> {
  const widgets = [
    { metric_id: 'revenue', position: 0 },
    { metric_id: 'pipeline', position: 1 },
    { metric_id: 'tasks', position: 2 },
  ];

  const widgetInserts = widgets.map((widget) => ({
    user_id: userId,
    metric_id: widget.metric_id,
    position: widget.position,
  }));

  await supabaseAdmin.from('dashboard_widgets').insert(widgetInserts);
}

async function setupBrandBoard(organizationId: string): Promise<void> {
  await supabaseAdmin.from('brand_board').insert({
    organization_id: organizationId,
    primary_color: '#dc2626',
    secondary_color: '#1f2937',
    font_family: 'Inter',
  });
}

async function initializeUsageTracking(accountId: string, plan: 'Starter' | 'Pro' | 'Enterprise'): Promise<void> {
  const currentPeriod = new Date().toISOString().slice(0, 7) + '-01';

  await supabaseAdmin.from('usage_tracking').insert({
    account_id: accountId,
    period: currentPeriod,
    sms_count: 0,
    mms_count: 0,
    call_minutes: 0,
    ai_minutes: 0,
    emails_sent: 0,
    storage_gb: 0,
  });

  const limits = PLAN_LIMITS[plan];
  await supabaseAdmin.from('usage_limits').insert({
    account_id: accountId,
    sms_limit: limits.sms_messages,
    call_limit: limits.call_minutes,
    ai_limit: limits.ai_minutes,
    email_limit: limits.emails_sent,
    storage_limit: limits.storage_gb,
  });
}

async function createBillingSnapshot(accountId: string, data: AccountCreationData): Promise<void> {
  await supabaseAdmin.from('billing_snapshots').insert({
    account_id: accountId,
    plan: data.plan,
    price_monthly: data.mrr,
    billing_cycle: data.billingCycle,
    next_billing_date: data.renewalDate,
    is_past_due: false,
    outstanding_amount: 0,
  });
}

async function createAuditEvent(action: string, accountId: string, data: AccountCreationData): Promise<void> {
  await supabaseAdmin.from('audit_events').insert({
    actor_type: 'super_admin',
    actor_name: 'System',
    action,
    target_type: 'account',
    target_id: accountId,
    target_name: data.name,
    metadata: {
      plan: data.plan,
      owner_email: data.ownerEmail,
    },
  });
}

async function markProvisioningComplete(accountId: string): Promise<void> {
  await supabaseAdmin
    .from('enterprise_accounts')
    .update({
      provisioning_status: 'active',
      provisioned_at: new Date().toISOString(),
      provisioning_error: null,
    })
    .eq('id', accountId);
}

async function markProvisioningFailed(accountId: string, error: string, step: string): Promise<void> {
  await supabaseAdmin
    .from('enterprise_accounts')
    .update({
      provisioning_status: 'failed',
      provisioning_error: `Failed at step ${step}: ${error}`,
    })
    .eq('id', accountId);
}
