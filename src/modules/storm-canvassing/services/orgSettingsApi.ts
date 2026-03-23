import { supabase } from '../../../shared/lib/supabase';
import type { CanvassOrgSettings, StormProvider, ContactProvider } from '../types';

export async function getOrgSettings(
  organizationId: string
): Promise<CanvassOrgSettings | null> {
  const { data, error } = await supabase
    .from('canvass_org_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching org settings:', error);
    return null;
  }

  return data;
}

export async function getOrCreateOrgSettings(
  organizationId: string
): Promise<CanvassOrgSettings> {
  const existing = await getOrgSettings(organizationId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('canvass_org_settings')
    .insert({
      organization_id: organizationId,
      contact_reveal_cache_hours: 720,
      contact_reveal_cost: 1,
      allow_gps_tracking: false,
      offline_sync_enabled: true,
      default_door_density: 150,
      default_storm_provider: 'MOCK',
      default_contact_provider: 'MOCK',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create org settings: ${error.message}`);
  }

  return data;
}

export async function updateOrgSettings(
  organizationId: string,
  updates: Partial<Omit<CanvassOrgSettings, 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<CanvassOrgSettings> {
  await getOrCreateOrgSettings(organizationId);

  const updateData: Record<string, unknown> = {};

  if (updates.contact_reveal_cache_hours !== undefined) {
    updateData.contact_reveal_cache_hours = updates.contact_reveal_cache_hours;
  }
  if (updates.contact_reveal_cost !== undefined) {
    updateData.contact_reveal_cost = updates.contact_reveal_cost;
  }
  if (updates.allow_gps_tracking !== undefined) {
    updateData.allow_gps_tracking = updates.allow_gps_tracking;
  }
  if (updates.offline_sync_enabled !== undefined) {
    updateData.offline_sync_enabled = updates.offline_sync_enabled;
  }
  if (updates.default_door_density !== undefined) {
    updateData.default_door_density = updates.default_door_density;
  }
  if (updates.default_storm_provider !== undefined) {
    updateData.default_storm_provider = updates.default_storm_provider;
  }
  if (updates.default_contact_provider !== undefined) {
    updateData.default_contact_provider = updates.default_contact_provider;
  }
  if (updates.hailtrace_api_key !== undefined) {
    updateData.hailtrace_api_key = updates.hailtrace_api_key;
  }
  if (updates.hail_recon_api_key !== undefined) {
    updateData.hail_recon_api_key = updates.hail_recon_api_key;
  }
  if (updates.mapbox_style_url !== undefined) {
    updateData.mapbox_style_url = updates.mapbox_style_url;
  }
  if (updates.noaa_mode_enabled !== undefined) {
    updateData.noaa_mode_enabled = updates.noaa_mode_enabled;
  }
  if (updates.mrms_base_url !== undefined) {
    updateData.mrms_base_url = updates.mrms_base_url;
  }
  if (updates.hail_min_threshold_inches !== undefined) {
    updateData.hail_min_threshold_inches = updates.hail_min_threshold_inches;
  }

  const { data, error } = await supabase
    .from('canvass_org_settings')
    .update(updateData)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update org settings: ${error.message}`);
  }

  return data;
}

export async function testStormProviderConnection(
  provider: StormProvider,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  if (provider === 'MOCK') {
    return { success: true, message: 'Mock provider is always available' };
  }

  return {
    success: false,
    message: `${provider} integration is not yet implemented. Contact support for API access.`,
  };
}

export async function testContactProviderConnection(
  provider: ContactProvider,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  if (provider === 'MOCK') {
    return { success: true, message: 'Mock provider is always available' };
  }

  return {
    success: false,
    message: `${provider} contact integration is not yet implemented. Contact support for API access.`,
  };
}
