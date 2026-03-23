import { supabase } from '../lib/supabase';

export interface OnboardingProgress {
  id: string;
  user_id: string;
  organization_id: string;
  current_step: number;
  completed_steps: number[];
  total_steps: number;
  onboarding_score: number;
  is_complete: boolean;
  milestones_completed: string[];
  migration_requested: boolean;
  migration_request_id?: string;
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
}

export interface OnboardingSettings {
  id?: string;
  organization_id: string;
  business_type?: string;
  locations?: any[];
  integrations_config?: any;
  branding_config?: any;
  pipeline_config?: any;
  ai_agent_config?: any;
  billing_config?: any;
  team_config?: any;
  lead_sources_config?: any;
  phone_config?: any;
}

export interface CRMType {
  id: string;
  name: string;
  description: string;
  migration_complexity: 'simple' | 'moderate' | 'complex';
  estimated_days: number;
}

export interface DataVolumeEstimate {
  id: string;
  range_label: string;
  min_contacts: number;
  max_contacts?: number;
  complexity_multiplier: number;
}

export interface MigrationRequest {
  id?: string;
  organization_id: string;
  user_id: string;
  crm_type_id: string;
  data_volume_estimate_id: string;
  current_crm_notes?: string;
  has_custom_fields: boolean;
  custom_fields_description?: string;
  has_integrations: boolean;
  integrations_description?: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  preferred_start_date?: string;
  must_complete_by_date?: string;
  estimated_contacts?: number;
  estimated_jobs?: number;
  estimated_opportunities?: number;
  has_historical_data: boolean;
  years_of_data?: number;
  can_export_data?: boolean;
  export_format?: string;
  preferred_contact_method: 'email' | 'phone' | 'video_call';
  preferred_contact_time?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
}

export const onboardingApi = {
  async getProgress(userId: string, organizationId: string): Promise<OnboardingProgress | null> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createProgress(userId: string, organizationId: string): Promise<OnboardingProgress> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        current_step: 1,
        completed_steps: [],
        total_steps: 10,
        onboarding_score: 0,
        is_complete: false,
        milestones_completed: [],
        migration_requested: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgress(
    userId: string,
    organizationId: string,
    updates: Partial<OnboardingProgress>
  ): Promise<OnboardingProgress> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeStep(
    userId: string,
    organizationId: string,
    stepNumber: number
  ): Promise<OnboardingProgress> {
    const progress = await this.getProgress(userId, organizationId);
    if (!progress) throw new Error('Onboarding progress not found');

    const completedSteps = [...new Set([...progress.completed_steps, stepNumber])];
    const currentStep = Math.min(stepNumber + 1, progress.total_steps);
    const onboardingScore = Math.round((completedSteps.length / progress.total_steps) * 100);

    return this.updateProgress(userId, organizationId, {
      completed_steps: completedSteps,
      current_step: currentStep,
      onboarding_score: onboardingScore,
      is_complete: completedSteps.length === progress.total_steps,
      completed_at:
        completedSteps.length === progress.total_steps ? new Date().toISOString() : undefined,
    });
  },

  async getSettings(organizationId: string): Promise<OnboardingSettings | null> {
    const { data, error } = await supabase
      .from('onboarding_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertSettings(settings: OnboardingSettings): Promise<OnboardingSettings> {
    const { data, error } = await supabase
      .from('onboarding_settings')
      .upsert(settings, { onConflict: 'organization_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateIntegrationsConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      integrations_config: config,
    });
  },

  async updateTeamConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      team_config: config,
    });
  },

  async updatePhoneConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      phone_config: config,
    });
  },

  async updateLeadSourcesConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      lead_sources_config: config,
    });
  },

  async updatePipelineConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      pipeline_config: config,
    });
  },

  async updateBrandingConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      branding_config: config,
    });
  },

  async updateBillingConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      billing_config: config,
    });
  },

  async updateAIAgentConfig(organizationId: string, config: any): Promise<OnboardingSettings> {
    const settings = await this.getSettings(organizationId);
    return this.upsertSettings({
      ...(settings || {}),
      organization_id: organizationId,
      ai_agent_config: config,
    });
  },

  async getCRMTypes(): Promise<CRMType[]> {
    const { data, error } = await supabase
      .from('crm_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async getDataVolumeEstimates(): Promise<DataVolumeEstimate[]> {
    const { data, error } = await supabase
      .from('data_volume_estimates')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async createMigrationRequest(request: MigrationRequest): Promise<MigrationRequest> {
    const { data, error } = await supabase
      .from('migration_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMigrationRequest(requestId: string): Promise<MigrationRequest | null> {
    const { data, error } = await supabase
      .from('migration_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getOrganizationMigrationRequests(organizationId: string): Promise<MigrationRequest[]> {
    const { data, error } = await supabase
      .from('migration_requests')
      .select('*')
      .eq('organization_id', organizationId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addMigrationCommunication(
    migrationRequestId: string,
    userId: string,
    message: string,
    messageType: 'user_message' | 'team_message' | 'status_update' | 'file_upload' | 'system_note' = 'user_message'
  ) {
    const { data, error } = await supabase
      .from('migration_communications')
      .insert({
        migration_request_id: migrationRequestId,
        user_id: userId,
        message,
        message_type: messageType,
        is_internal: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMigrationCommunications(migrationRequestId: string) {
    const { data, error } = await supabase
      .from('migration_communications')
      .select('*')
      .eq('migration_request_id', migrationRequestId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async markOnboardingComplete(organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ onboarding_completed: true })
      .eq('id', organizationId);

    if (error) throw error;
  },
};
