/**
 * Debug utility to check user's organization state
 * Run this in browser console to diagnose organization issues
 */

import { supabase } from '../lib/supabase';

export async function debugUserOrganizations() {
  console.log('='.repeat(80));
  console.log('ORGANIZATION DEBUG REPORT');
  console.log('='.repeat(80));

  try {
    // 1. Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ User not authenticated:', userError?.message);
      return;
    }

    console.log('\n✅ Authenticated User:');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Metadata:', user.user_metadata);

    // 2. Check organization_members
    console.log('\n📋 Checking organization_members table...');
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id);

    if (membershipsError) {
      console.error('❌ Error querying organization_members:', membershipsError);
    } else {
      console.log(`   Found ${memberships?.length || 0} membership records:`);
      memberships?.forEach((m, i) => {
        console.log(`   ${i + 1}. Organization ID: ${m.organization_id}`);
        console.log(`      Role: ${m.role}`);
        console.log(`      Status: ${m.status}`);
        console.log(`      Is Active: ${m.is_active}`);
        console.log(`      Created: ${m.created_at}`);
      });
    }

    // 3. Check organizations
    if (memberships && memberships.length > 0) {
      console.log('\n🏢 Checking organizations table...');
      const orgIds = memberships.map(m => m.organization_id);

      const { data: organizations, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) {
        console.error('❌ Error querying organizations:', orgsError);
      } else {
        console.log(`   Found ${organizations?.length || 0} organization records:`);
        organizations?.forEach((org, i) => {
          console.log(`   ${i + 1}. Name: ${org.name}`);
          console.log(`      Slug: ${org.slug}`);
          console.log(`      ID: ${org.id}`);
          console.log(`      Created by: ${org.created_by}`);
          console.log(`      Subscription: ${org.subscription_status}`);
        });

        // Check for orphaned memberships
        const foundOrgIds = new Set(organizations?.map(o => o.id) || []);
        const orphanedMemberships = memberships.filter(m => !foundOrgIds.has(m.organization_id));

        if (orphanedMemberships.length > 0) {
          console.warn('\n⚠️ FOUND ORPHANED MEMBERSHIPS:');
          console.warn('   These memberships point to organizations that don\'t exist:');
          orphanedMemberships.forEach(m => {
            console.warn(`   - Organization ID: ${m.organization_id}`);
          });
          console.warn('   Solution: These need to be cleaned up or organizations need to be created');
        }
      }
    } else {
      console.log('\n⚠️ User has no organization memberships');
    }

    // 4. Check localStorage
    console.log('\n💾 Checking localStorage...');
    const storedOrgId = localStorage.getItem('currentOrganizationId');
    const storedOrgSlug = localStorage.getItem('currentOrganizationSlug');

    console.log('   Stored Organization ID:', storedOrgId || 'None');
    console.log('   Stored Organization Slug:', storedOrgSlug || 'None');

    if (storedOrgId && memberships && memberships.length > 0) {
      const membershipExists = memberships.some(m => m.organization_id === storedOrgId);
      if (!membershipExists) {
        console.warn('   ⚠️ Stored organization ID not found in user memberships!');
        console.warn('   Recommendation: Clear localStorage and reload');
      }
    }

    // 5. Summary and recommendations
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY & RECOMMENDATIONS');
    console.log('='.repeat(80));

    const hasValidOrg = memberships && memberships.length > 0 &&
                        organizations && organizations.length > 0;

    if (hasValidOrg) {
      console.log('✅ User has valid organization access');
      console.log('   You should be able to access: /org/' + organizations![0].slug + '/dashboard');
    } else if (memberships && memberships.length > 0 && (!organizations || organizations.length === 0)) {
      console.error('❌ ISSUE DETECTED: Orphaned memberships');
      console.log('   Recommendations:');
      console.log('   1. Run: await window.createDefaultOrganization()');
      console.log('   2. Or contact support to fix database inconsistency');
    } else {
      console.warn('⚠️ User has no organizations');
      console.log('   Recommendations:');
      console.log('   1. Run: await window.createDefaultOrganization()');
      console.log('   2. Or navigate to /organizations to create one');
    }

  } catch (error) {
    console.error('❌ Unexpected error during debug:', error);
  }

  console.log('\n' + '='.repeat(80));
}

export async function createDefaultOrganization() {
  console.log('Creating default organization...');

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }

    const defaultOrgName = user.user_metadata?.company_name ||
                           user.user_metadata?.full_name ||
                           user.email?.split('@')[0] ||
                           'My Organization';

    const defaultSlug = defaultOrgName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);

    console.log('   Organization Name:', defaultOrgName);
    console.log('   Slug:', defaultSlug);

    const { data: newOrgId, error: createError } = await supabase.rpc(
      'setup_new_organization',
      {
        p_user_id: user.id,
        p_org_name: defaultOrgName,
        p_org_slug: defaultSlug,
      }
    );

    if (createError) {
      console.error('❌ Failed to create organization:', createError);
      return;
    }

    console.log('✅ Organization created successfully!');
    console.log('   Organization ID:', newOrgId);
    console.log('   Redirecting to dashboard...');

    window.location.href = `/org/${defaultSlug}/dashboard`;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).debugUserOrganizations = debugUserOrganizations;
  (window as any).createDefaultOrganization = createDefaultOrganization;
}
