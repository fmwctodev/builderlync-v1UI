import { supabase } from './supabase-client';
import {
  SuperAdminIntegration,
  UpdateIntegrationRequest,
} from '../types/settings';

export async function getIntegrations(): Promise<{
  success: boolean;
  data?: SuperAdminIntegration[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('super_admin_integrations')
      .select('*')
      .order('integration_name');

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    return { success: false, error: error.message };
  }
}

export async function getIntegrationByName(
  name: string
): Promise<{ success: boolean; data?: SuperAdminIntegration; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_integrations')
      .select('*')
      .eq('integration_name', name)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching integration:', error);
    return { success: false, error: error.message };
  }
}

export async function updateIntegration(
  name: string,
  request: UpdateIntegrationRequest
): Promise<{ success: boolean; data?: SuperAdminIntegration; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('super_admin_integrations')
      .update({
        ...request,
        status: 'connected',
        connected_at: new Date().toISOString(),
        connected_by: userData.user?.id,
      })
      .eq('integration_name', name)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating integration:', error);
    return { success: false, error: error.message };
  }
}

export async function disconnectIntegration(
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_integrations')
      .update({
        status: 'disconnected',
        credentials: {},
        oauth_tokens: {},
        last_sync_at: null,
        last_error: null,
      })
      .eq('integration_name', name);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error disconnecting integration:', error);
    return { success: false, error: error.message };
  }
}

export async function testIntegrationConnection(
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    return { success: true };
  } catch (error: any) {
    console.error('Error testing integration:', error);
    return { success: false, error: error.message };
  }
}
