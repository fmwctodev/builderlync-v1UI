import { supabase } from '../../../shared/lib/supabase';
import type { CanvassOrgSettings, StormProvider, ContactProvider } from '../types';

export async function getOrgSettings(
  organizationId: string
): Promise<CanvassOrgSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('canvass_org_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching org settings:', error);
    return null;
  }

  if (!data) return null;

  return data as CanvassOrgSettings;
}

export async function getOrCreateOrgSettings(
  organizationId: string
): Promise<CanvassOrgSettings> {
  const existing = await getOrgSettings(organizationId);
  if (existing) return existing;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('canvass_org_settings')
    .insert({
      user_id: user.id,
      organization_id: organizationId,
      contact_reveal_cache_hours: 720,
      contact_reveal_cost: 1,
      allow_gps_tracking: false,
      offline_sync_enabled: true,
      default_door_density: 150,
      default_storm_provider: 'MOCK',
      default_contact_provider: 'MOCK',
      operating_states: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create org settings: ${error.message}`);
  }

  return { ...data, organization_id: organizationId } as CanvassOrgSettings;
}

export async function updateOrgSettings(
  organizationId: string,
  updates: Partial<Omit<CanvassOrgSettings, 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<CanvassOrgSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

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
  if (updates.noaa_mode !== undefined) {
    updateData.noaa_mode = updates.noaa_mode;
  }
  if (updates.mrms_base_url !== undefined) {
    updateData.mrms_base_url = updates.mrms_base_url;
  }
  if (updates.hail_threshold_inches !== undefined) {
    updateData.hail_threshold_inches = updates.hail_threshold_inches;
  }
  if (updates.operating_states !== undefined) {
    updateData.operating_states = updates.operating_states;
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

  return { ...data, organization_id: organizationId } as CanvassOrgSettings;
}

export async function testStormProviderConnection(
  provider: StormProvider,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  if (provider === 'MOCK') {
    return { success: true, message: 'Mock provider is always available' };
  }

  if (provider === 'NOAA') {
    try {
      const response = await fetch('https://api.weather.gov/alerts/active?area=TX&limit=1', {
        headers: {
          'User-Agent': 'Builderlync',
          'API-Key': 'Builderlync',
          Accept: 'application/geo+json',
        },
      });
      if (response.ok) {
        return { success: true, message: 'NOAA NWS API is reachable and responding' };
      }
      return { success: false, message: `NOAA API returned status ${response.status}` };
    } catch {
      return { success: false, message: 'Could not reach NOAA NWS API' };
    }
  }

  void apiKey;
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

  void apiKey;
  return {
    success: false,
    message: `${provider} contact integration is not yet implemented. Contact support for API access.`,
  };
}
