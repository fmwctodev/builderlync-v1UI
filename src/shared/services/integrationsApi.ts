import { supabase } from '../lib/supabase';

export interface IntegrationConnection {
  id: string;
  organization_id: string;
  integration_name: string;
  connection_type: string;
  status: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  scopes?: string[];
  external_account_id?: string;
  external_account_name?: string;
  configuration?: Record<string, any>;
  last_activity_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationWebhook {
  id: string;
  organization_id: string;
  integration_name: string;
  webhook_url: string;
  events: string[];
  secret_key?: string;
  is_active: boolean;
  last_triggered_at?: string;
  trigger_count: number;
  failure_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationApiKey {
  id: string;
  organization_id: string;
  key_name: string;
  api_key: string;
  permissions?: Record<string, any>;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface CreateIntegrationInput {
  integration_name: string;
  connection_type: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  scopes?: string[];
  external_account_id?: string;
  external_account_name?: string;
  configuration?: Record<string, any>;
}

export interface UpdateIntegrationInput {
  status?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  configuration?: Record<string, any>;
  error_message?: string;
}

export const integrationsApi = {
  async getIntegrations(organizationId: string): Promise<IntegrationConnection[]> {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error);
      throw new Error(`Failed to fetch integrations: ${error.message}`);
    }

    return data || [];
  },

  async getIntegration(integrationId: string): Promise<IntegrationConnection | null> {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('id', integrationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching integration:', error);
      throw new Error(`Failed to fetch integration: ${error.message}`);
    }

    return data;
  },

  async getIntegrationByName(
    organizationId: string,
    integrationName: string
  ): Promise<IntegrationConnection | null> {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('integration_name', integrationName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching integration by name:', error);
      throw new Error(`Failed to fetch integration: ${error.message}`);
    }

    return data;
  },

  async createIntegration(
    organizationId: string,
    input: CreateIntegrationInput
  ): Promise<IntegrationConnection> {
    const { data, error } = await supabase
      .from('integration_connections')
      .insert({
        organization_id: organizationId,
        ...input,
        status: 'connected',
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      throw new Error(`Failed to create integration: ${error.message}`);
    }

    return data;
  },

  async updateIntegration(
    integrationId: string,
    input: UpdateIntegrationInput
  ): Promise<IntegrationConnection> {
    const { data, error } = await supabase
      .from('integration_connections')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating integration:', error);
      throw new Error(`Failed to update integration: ${error.message}`);
    }

    return data;
  },

  async deleteIntegration(integrationId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting integration:', error);
      throw new Error(`Failed to delete integration: ${error.message}`);
    }
  },

  async disconnectIntegration(integrationId: string): Promise<IntegrationConnection> {
    return this.updateIntegration(integrationId, {
      status: 'disconnected',
    });
  },

  async reconnectIntegration(integrationId: string): Promise<IntegrationConnection> {
    return this.updateIntegration(integrationId, {
      status: 'connected',
      error_message: null,
    });
  },

  async updateLastActivity(integrationId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_connections')
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Error updating last activity:', error);
    }
  },

  async getWebhooks(organizationId: string): Promise<IntegrationWebhook[]> {
    const { data, error } = await supabase
      .from('integration_webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching webhooks:', error);
      throw new Error(`Failed to fetch webhooks: ${error.message}`);
    }

    return data || [];
  },

  async createWebhook(
    organizationId: string,
    webhook: Omit<IntegrationWebhook, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'trigger_count' | 'failure_count'>
  ): Promise<IntegrationWebhook> {
    const { data, error } = await supabase
      .from('integration_webhooks')
      .insert({
        organization_id: organizationId,
        ...webhook,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook:', error);
      throw new Error(`Failed to create webhook: ${error.message}`);
    }

    return data;
  },

  async updateWebhook(
    webhookId: string,
    updates: Partial<IntegrationWebhook>
  ): Promise<IntegrationWebhook> {
    const { data, error } = await supabase
      .from('integration_webhooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)
      .select()
      .single();

    if (error) {
      console.error('Error updating webhook:', error);
      throw new Error(`Failed to update webhook: ${error.message}`);
    }

    return data;
  },

  async deleteWebhook(webhookId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Error deleting webhook:', error);
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  },

  async getApiKeys(organizationId: string): Promise<IntegrationApiKey[]> {
    const { data, error } = await supabase
      .from('integration_api_keys')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }

    return data || [];
  },

  async createApiKey(
    organizationId: string,
    apiKey: Omit<IntegrationApiKey, 'id' | 'organization_id' | 'created_at' | 'api_key'>
  ): Promise<IntegrationApiKey> {
    const generatedKey = `blk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('integration_api_keys')
      .insert({
        organization_id: organizationId,
        ...apiKey,
        api_key: generatedKey,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return data;
  },

  async revokeApiKey(apiKeyId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_api_keys')
      .update({ is_active: false })
      .eq('id', apiKeyId);

    if (error) {
      console.error('Error revoking API key:', error);
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }
  },

  async deleteApiKey(apiKeyId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_api_keys')
      .delete()
      .eq('id', apiKeyId);

    if (error) {
      console.error('Error deleting API key:', error);
      throw new Error(`Failed to delete API key: ${error.message}`);
    }
  },
};
