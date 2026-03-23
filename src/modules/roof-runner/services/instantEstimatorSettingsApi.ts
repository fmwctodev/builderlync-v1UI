import { supabase } from '../../../shared/lib/supabase';
import type {
  InstantEstimatorGlobalSettings,
  InstantEstimatorMaterial,
  InstantEstimatorConfig,
  CreateMaterialData,
  UpdateMaterialData,
  UpdateGlobalSettingsData,
  UpdateConfigData,
  OrganizationProfile,
  StaffMember,
  InstantEstimatorDefaultMaterial,
  CreateDefaultMaterialData,
  InstantEstimatorLead,
  CreateLeadData,
} from '../types/instantEstimatorSettings';

export const instantEstimatorSettingsApi = {
  async getGlobalSettings(organizationId: string): Promise<InstantEstimatorGlobalSettings | null> {
    const { data, error } = await supabase
      .from('instant_estimator_global_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching global settings:', error);
      throw error;
    }

    return data;
  },

  async upsertGlobalSettings(
    organizationId: string,
    settings: UpdateGlobalSettingsData
  ): Promise<InstantEstimatorGlobalSettings> {
    const { data, error } = await supabase
      .from('instant_estimator_global_settings')
      .upsert(
        {
          organization_id: organizationId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'organization_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting global settings:', error);
      throw error;
    }

    return data;
  },

  async getEstimatorConfig(
    organizationId: string,
    estimatorId: string
  ): Promise<InstantEstimatorConfig | null> {
    const { data, error } = await supabase
      .from('instant_estimator_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('estimator_id', estimatorId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching estimator config:', error);
      throw error;
    }

    return data;
  },

  async upsertEstimatorConfig(
    organizationId: string,
    estimatorId: string,
    config: UpdateConfigData
  ): Promise<InstantEstimatorConfig> {
    const existingConfig = await this.getEstimatorConfig(organizationId, estimatorId);

    const updatedPricingSettings = existingConfig?.pricing_settings
      ? { ...existingConfig.pricing_settings, ...config.pricing_settings }
      : config.pricing_settings;

    const { data, error } = await supabase
      .from('instant_estimator_configs')
      .upsert(
        {
          organization_id: organizationId,
          estimator_id: estimatorId,
          ...config,
          pricing_settings: updatedPricingSettings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'organization_id,estimator_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting estimator config:', error);
      throw error;
    }

    return data;
  },

  async getMaterials(
    organizationId: string,
    estimatorId: string
  ): Promise<InstantEstimatorMaterial[]> {
    const { data, error } = await supabase
      .from('instant_estimator_materials')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('estimator_id', estimatorId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }

    return data || [];
  },

  async createMaterial(
    organizationId: string,
    estimatorId: string,
    material: CreateMaterialData
  ): Promise<InstantEstimatorMaterial> {
    const { data, error } = await supabase
      .from('instant_estimator_materials')
      .insert({
        organization_id: organizationId,
        estimator_id: estimatorId,
        ...material,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating material:', error);
      throw error;
    }

    return data;
  },

  async updateMaterial(
    materialId: string,
    material: Partial<CreateMaterialData>
  ): Promise<InstantEstimatorMaterial> {
    const { data, error } = await supabase
      .from('instant_estimator_materials')
      .update({
        ...material,
        updated_at: new Date().toISOString(),
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating material:', error);
      throw error;
    }

    return data;
  },

  async deleteMaterial(materialId: string): Promise<void> {
    const { error } = await supabase
      .from('instant_estimator_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },

  async reorderMaterials(
    materials: { id: string; sort_order: number }[]
  ): Promise<void> {
    const updates = materials.map((m) =>
      supabase
        .from('instant_estimator_materials')
        .update({ sort_order: m.sort_order })
        .eq('id', m.id)
    );

    await Promise.all(updates);
  },

  async getOrganizationProfile(organizationId: string): Promise<OrganizationProfile | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, logo_url, email, phone, website')
      .eq('id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching organization profile:', error);
      throw error;
    }

    return data;
  },

  async getStaffMembers(organizationId: string): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('id, user_id, first_name, last_name, email, phone, avatar_url, role')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching staff members:', error);
      throw error;
    }

    return data || [];
  },

  async checkGoogleBusinessIntegration(organizationId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('id, status')
      .eq('organization_id', organizationId)
      .eq('integration_name', 'google-business')
      .maybeSingle();

    if (error) {
      console.error('Error checking Google Business integration:', error);
      return false;
    }

    return data?.status === 'connected';
  },

  async getDefaultMaterials(organizationId: string): Promise<InstantEstimatorDefaultMaterial[]> {
    const { data, error } = await supabase
      .from('instant_estimator_default_materials')
      .select('*')
      .eq('organization_id', organizationId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching default materials:', error);
      throw error;
    }

    return data || [];
  },

  async createDefaultMaterial(
    organizationId: string,
    material: CreateDefaultMaterialData
  ): Promise<InstantEstimatorDefaultMaterial> {
    const { data, error } = await supabase
      .from('instant_estimator_default_materials')
      .insert({
        organization_id: organizationId,
        ...material,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default material:', error);
      throw error;
    }

    return data;
  },

  async updateDefaultMaterial(
    materialId: string,
    material: Partial<CreateDefaultMaterialData>
  ): Promise<InstantEstimatorDefaultMaterial> {
    const { data, error } = await supabase
      .from('instant_estimator_default_materials')
      .update({
        ...material,
        updated_at: new Date().toISOString(),
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating default material:', error);
      throw error;
    }

    return data;
  },

  async deleteDefaultMaterial(materialId: string): Promise<void> {
    const { error } = await supabase
      .from('instant_estimator_default_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Error deleting default material:', error);
      throw error;
    }
  },

  async reorderDefaultMaterials(
    materials: { id: string; sort_order: number }[]
  ): Promise<void> {
    const updates = materials.map((m) =>
      supabase
        .from('instant_estimator_default_materials')
        .update({ sort_order: m.sort_order })
        .eq('id', m.id)
    );

    await Promise.all(updates);
  },

  async getLeads(
    organizationId: string,
    filters?: {
      status?: string;
      pipeline_type?: string;
      estimator_id?: string;
    }
  ): Promise<InstantEstimatorLead[]> {
    let query = supabase
      .from('instant_estimator_leads')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.pipeline_type) {
      query = query.eq('pipeline_type', filters.pipeline_type);
    }
    if (filters?.estimator_id) {
      query = query.eq('estimator_id', filters.estimator_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return data || [];
  },

  async createLead(
    organizationId: string,
    lead: CreateLeadData
  ): Promise<InstantEstimatorLead> {
    const { data, error } = await supabase
      .from('instant_estimator_leads')
      .insert({
        organization_id: organizationId,
        ...lead,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return data;
  },

  async updateLeadStatus(
    leadId: string,
    status: string,
    opportunityId?: string
  ): Promise<InstantEstimatorLead> {
    const updateData: Record<string, unknown> = { status };
    if (opportunityId) {
      updateData.opportunity_id = opportunityId;
    }

    const { data, error } = await supabase
      .from('instant_estimator_leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }

    return data;
  },

  async testWebhook(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          message: 'Instant Estimator webhook test',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        return { success: true, message: 'Webhook test successful' };
      } else {
        return { success: false, message: `Webhook returned status ${response.status}` };
      }
    } catch (error) {
      console.error('Webhook test failed:', error);
      return { success: false, message: 'Failed to connect to webhook URL' };
    }
  },
};
