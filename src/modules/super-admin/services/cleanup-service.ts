import { supabaseAdmin } from './supabase-client';

export interface CleanupResult {
  success: boolean;
  summary: {
    orphanedAuthUsers: number;
    orphanedPlatformUsers: number;
    failedAccounts: number;
    incompleteOrganizations: number;
    totalCleaned: number;
  };
  details: string[];
  errors: string[];
}

/**
 * Comprehensive cleanup of orphaned resources in the database
 * This should be run periodically or after provisioning failures
 */
export async function cleanupOrphanedResources(): Promise<CleanupResult> {
  const details: string[] = [];
  const errors: string[] = [];
  let orphanedAuthUsers = 0;
  let orphanedPlatformUsers = 0;
  let failedAccounts = 0;
  let incompleteOrganizations = 0;

  try {
    details.push('Starting comprehensive cleanup...');

    // Step 1: Find and clean failed/provisioning enterprise accounts
    details.push('\n[Step 1] Cleaning up failed enterprise accounts...');
    const { data: failedAccountsData } = await supabaseAdmin
      .from('enterprise_accounts')
      .select('id, name, owner_user_id, owner_platform_user_id, organization_id, provisioning_status')
      .in('provisioning_status', ['failed', 'provisioning'])
      .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Older than 30 minutes

    if (failedAccountsData && failedAccountsData.length > 0) {
      details.push(`Found ${failedAccountsData.length} failed account(s)`);

      for (const account of failedAccountsData) {
        try {
          // Delete related records
          if (account.organization_id) {
            await supabaseAdmin.from('dashboard_widgets').delete().eq('organization_id', account.organization_id);
            await supabaseAdmin.from('pipeline_stages').delete().match({ pipeline_id: account.organization_id });
            await supabaseAdmin.from('pipelines').delete().eq('organization_id', account.organization_id);
            await supabaseAdmin.from('organization_settings').delete().eq('organization_id', account.organization_id);
            await supabaseAdmin.from('organization_members').delete().eq('organization_id', account.organization_id);
            await supabaseAdmin.from('organizations').delete().eq('id', account.organization_id);
          }

          if (account.owner_platform_user_id) {
            await supabaseAdmin.from('platform_users').delete().eq('id', account.owner_platform_user_id);
          }

          if (account.owner_user_id) {
            await supabaseAdmin.from('user_profile_data').delete().eq('user_id', account.owner_user_id);
            await supabaseAdmin.from('user_preferences').delete().eq('user_id', account.owner_user_id);

            try {
              await supabaseAdmin.auth.admin.deleteUser(account.owner_user_id);
            } catch (err) {
              errors.push(`Could not delete auth user ${account.owner_user_id}: ${err}`);
            }
          }

          // Delete account modules and the account itself
          await supabaseAdmin.from('account_modules').delete().eq('account_id', account.id);
          await supabaseAdmin.from('usage_tracking').delete().eq('account_id', account.id);
          await supabaseAdmin.from('usage_limits').delete().eq('account_id', account.id);
          await supabaseAdmin.from('enterprise_accounts').delete().eq('id', account.id);

          failedAccounts++;
          details.push(`✓ Cleaned up account: ${account.name}`);
        } catch (err: any) {
          errors.push(`Error cleaning account ${account.name}: ${err.message}`);
        }
      }
    } else {
      details.push('No failed accounts found');
    }

    // Step 2: Find orphaned platform_users (no matching auth user or account)
    details.push('\n[Step 2] Finding orphaned platform users...');
    const { data: allPlatformUsers } = await supabaseAdmin
      .from('platform_users')
      .select('id, user_id, email, account_id');

    if (allPlatformUsers) {
      for (const platformUser of allPlatformUsers) {
        let shouldDelete = false;

        // Check if auth user exists
        if (platformUser.user_id) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(platformUser.user_id);
          if (!authUser.user) {
            shouldDelete = true;
            details.push(`Platform user ${platformUser.email} has no auth user`);
          }
        }

        // Check if account exists
        if (platformUser.account_id && !shouldDelete) {
          const { data: account } = await supabaseAdmin
            .from('enterprise_accounts')
            .select('id')
            .eq('id', platformUser.account_id)
            .maybeSingle();

          if (!account) {
            shouldDelete = true;
            details.push(`Platform user ${platformUser.email} has no enterprise account`);
          }
        }

        if (shouldDelete) {
          try {
            if (platformUser.user_id) {
              await supabaseAdmin.from('user_profile_data').delete().eq('user_id', platformUser.user_id);
              await supabaseAdmin.from('user_preferences').delete().eq('user_id', platformUser.user_id);
            }
            await supabaseAdmin.from('platform_users').delete().eq('id', platformUser.id);
            orphanedPlatformUsers++;
            details.push(`✓ Deleted orphaned platform user: ${platformUser.email}`);
          } catch (err: any) {
            errors.push(`Error deleting platform user ${platformUser.email}: ${err.message}`);
          }
        }
      }
    }

    if (orphanedPlatformUsers === 0) {
      details.push('No orphaned platform users found');
    }

    // Step 3: Find orphaned auth users (no platform_users record)
    details.push('\n[Step 3] Finding orphaned auth users...');
    const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();

    if (allAuthUsers) {
      for (const authUser of allAuthUsers) {
        // Check if this auth user has a platform_users record
        const { data: platformUser } = await supabaseAdmin
          .from('platform_users')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();

        // Also check if they're in organization_members (regular tenant users)
        const { data: orgMember } = await supabaseAdmin
          .from('organization_members')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();

        // If no platform_users and no org_members, it's orphaned
        if (!platformUser && !orgMember) {
          try {
            await supabaseAdmin.from('user_profile_data').delete().eq('user_id', authUser.id);
            await supabaseAdmin.from('user_preferences').delete().eq('user_id', authUser.id);
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            orphanedAuthUsers++;
            details.push(`✓ Deleted orphaned auth user: ${authUser.email}`);
          } catch (err: any) {
            errors.push(`Error deleting auth user ${authUser.email}: ${err.message}`);
          }
        }
      }
    }

    if (orphanedAuthUsers === 0) {
      details.push('No orphaned auth users found');
    }

    // Step 4: Find incomplete organizations (no enterprise_account_id or inactive)
    details.push('\n[Step 4] Finding incomplete organizations...');
    const { data: incompleteOrgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name, enterprise_account_id, is_active')
      .is('enterprise_account_id', null)
      .eq('is_active', true);

    if (incompleteOrgs && incompleteOrgs.length > 0) {
      details.push(`Found ${incompleteOrgs.length} incomplete organization(s)`);

      for (const org of incompleteOrgs) {
        // Check if this org was created more than 1 hour ago
        const { data: orgWithTimestamp } = await supabaseAdmin
          .from('organizations')
          .select('created_at')
          .eq('id', org.id)
          .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (orgWithTimestamp) {
          try {
            // Delete related data
            await supabaseAdmin.from('dashboard_widgets').delete().eq('organization_id', org.id);
            await supabaseAdmin.from('pipeline_stages').delete().match({ pipeline_id: org.id });
            await supabaseAdmin.from('pipelines').delete().eq('organization_id', org.id);
            await supabaseAdmin.from('organization_settings').delete().eq('organization_id', org.id);
            await supabaseAdmin.from('organization_members').delete().eq('organization_id', org.id);
            await supabaseAdmin.from('organizations').delete().eq('id', org.id);

            incompleteOrganizations++;
            details.push(`✓ Deleted incomplete organization: ${org.name}`);
          } catch (err: any) {
            errors.push(`Error deleting organization ${org.name}: ${err.message}`);
          }
        }
      }
    } else {
      details.push('No incomplete organizations found');
    }

    const totalCleaned = orphanedAuthUsers + orphanedPlatformUsers + failedAccounts + incompleteOrganizations;
    details.push(`\n✅ Cleanup complete! Total items cleaned: ${totalCleaned}`);

    return {
      success: true,
      summary: {
        orphanedAuthUsers,
        orphanedPlatformUsers,
        failedAccounts,
        incompleteOrganizations,
        totalCleaned,
      },
      details,
      errors,
    };
  } catch (error: any) {
    errors.push(`Fatal error during cleanup: ${error.message}`);
    return {
      success: false,
      summary: {
        orphanedAuthUsers,
        orphanedPlatformUsers,
        failedAccounts,
        incompleteOrganizations,
        totalCleaned: orphanedAuthUsers + orphanedPlatformUsers + failedAccounts + incompleteOrganizations,
      },
      details,
      errors,
    };
  }
}

/**
 * Quick check for orphaned resources without deleting anything
 */
export async function scanForOrphanedResources(): Promise<{
  orphanedAuthUsersCount: number;
  orphanedPlatformUsersCount: number;
  failedAccountsCount: number;
  incompleteOrganizationsCount: number;
}> {
  let orphanedAuthUsersCount = 0;
  let orphanedPlatformUsersCount = 0;
  let failedAccountsCount = 0;
  let incompleteOrganizationsCount = 0;

  try {
    // Count failed accounts
    const { count: failedCount } = await supabaseAdmin
      .from('enterprise_accounts')
      .select('id', { count: 'exact', head: true })
      .in('provisioning_status', ['failed', 'provisioning'])
      .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

    failedAccountsCount = failedCount || 0;

    // Count incomplete organizations
    const { count: incompleteCount } = await supabaseAdmin
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .is('enterprise_account_id', null)
      .eq('is_active', true)
      .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    incompleteOrganizationsCount = incompleteCount || 0;

    // For orphaned users, we need to do a more thorough check
    const { data: allPlatformUsers } = await supabaseAdmin
      .from('platform_users')
      .select('id, user_id, account_id');

    if (allPlatformUsers) {
      for (const platformUser of allPlatformUsers) {
        if (platformUser.user_id) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(platformUser.user_id);
          if (!authUser.user) {
            orphanedPlatformUsersCount++;
          }
        }

        if (platformUser.account_id) {
          const { data: account } = await supabaseAdmin
            .from('enterprise_accounts')
            .select('id')
            .eq('id', platformUser.account_id)
            .maybeSingle();

          if (!account) {
            orphanedPlatformUsersCount++;
          }
        }
      }
    }

    // Count orphaned auth users
    const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();

    if (allAuthUsers) {
      for (const authUser of allAuthUsers) {
        const { data: platformUser } = await supabaseAdmin
          .from('platform_users')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();

        const { data: orgMember } = await supabaseAdmin
          .from('organization_members')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (!platformUser && !orgMember) {
          orphanedAuthUsersCount++;
        }
      }
    }

    return {
      orphanedAuthUsersCount,
      orphanedPlatformUsersCount,
      failedAccountsCount,
      incompleteOrganizationsCount,
    };
  } catch (error) {
    console.error('Error scanning for orphaned resources:', error);
    return {
      orphanedAuthUsersCount: 0,
      orphanedPlatformUsersCount: 0,
      failedAccountsCount: 0,
      incompleteOrganizationsCount: 0,
    };
  }
}
