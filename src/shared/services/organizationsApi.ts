import { supabase } from '../lib/supabase';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  enabled_modules?: string[];
  subscription_status?: string;
  subscription_tier?: string;
  selected_plan?: string;
}

export interface OrganizationBusinessInfo {
  id?: string;
  organization_id: string;
  friendly_business_name?: string;
  legal_business_name?: string;
  business_email?: string;
  business_phone?: string;
  branded_domain?: string;
  business_website?: string;
  business_niche?: string;
  business_currency?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  state_region?: string;
  country?: string;
  timezone?: string;
  platform_language?: string;
  outbound_language?: string;
  business_type?: string;
  business_industry?: string;
  registration_id_type?: string;
  registration_number?: string;
  not_registered?: boolean;
  business_regions?: string[];
  representative_first_name?: string;
  representative_last_name?: string;
  representative_email?: string;
  representative_job_position?: string;
  representative_phone?: string;
  allow_duplicate_contact?: boolean;
  contact_search_preference?: string;
  contact_search_secondary?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const organizationsApi = {
  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create an organization');
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        slug: input.slug,
        created_by: user.id,
        subscription_status: 'trial',
        subscription_tier: 'Starter',
        selected_plan: 'Starter',
        onboarding_completed: true,
        enabled_modules: [
          'crm',
          'conversations',
          'calendars',
          'opportunities',
          'jobs',
          'proposals',
          'payments',
          'marketing',
          'reputation',
          'file-manager',
          'ai-agents'
        ],
      })
      .select()
      .single();

    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    const { error: memberError } = await supabase
      .from('user_organizations')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      throw new Error(`Failed to add user as organization member: ${memberError.message}`);
    }

    const { error: orgMemberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (orgMemberError) {
      console.error('Failed to create organization_members row:', orgMemberError);
    }

    // Setup organization (optional - function may not exist)
    try {
      await supabase.rpc('setup_organization', {
        p_organization_id: org.id,
        p_user_id: user.id,
      });
    } catch (setupError) {
      console.warn('setup_organization function not available:', setupError);
    }

    const { error: onboardingError } = await supabase
      .from('onboarding_progress')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        current_step: 1,
        total_steps: 10,
        onboarding_score: 0,
        is_complete: false,
        completed_steps: {},
        milestones_completed: {},
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      });

    if (onboardingError) {
      console.error('Failed to create onboarding progress:', onboardingError);
    }

    return org;
  },

  async checkSlugAvailability(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check slug availability: ${error.message}`);
    }

    return !data;
  },

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  },

  async getOrganizationBusinessInfo(organizationId: string): Promise<OrganizationBusinessInfo | null> {
    const { data, error } = await supabase
      .from('organization_business_info')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching business info:', error);
      throw new Error(`Failed to fetch business info: ${error.message}`);
    }

    return data;
  },

  async updateOrganizationBusinessInfo(
    organizationId: string,
    businessInfo: Partial<OrganizationBusinessInfo>
  ): Promise<OrganizationBusinessInfo> {
    const existingInfo = await this.getOrganizationBusinessInfo(organizationId);

    if (existingInfo) {
      const { data, error } = await supabase
        .from('organization_business_info')
        .update(businessInfo)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating business info:', error);
        throw new Error(`Failed to update business info: ${error.message}`);
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('organization_business_info')
        .insert({
          organization_id: organizationId,
          ...businessInfo,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business info:', error);
        throw new Error(`Failed to create business info: ${error.message}`);
      }

      return data;
    }
  },

  async createOrganizationBusinessInfo(
    organizationId: string,
    businessInfo: Omit<OrganizationBusinessInfo, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
  ): Promise<OrganizationBusinessInfo> {
    const { data, error } = await supabase
      .from('organization_business_info')
      .insert({
        organization_id: organizationId,
        ...businessInfo,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating business info:', error);
      throw new Error(`Failed to create business info: ${error.message}`);
    }

    return data;
  },
};
