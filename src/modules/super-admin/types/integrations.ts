export type ProviderStatus = 'healthy' | 'warning' | 'error' | 'unknown';
export type ProviderCategory = 'telephony' | 'accounting' | 'roofing' | 'supplier' | 'payments' | 'auth' | 'email' | 'ai';

export interface IntegrationProvider {
  id: string;
  key: string;
  name: string;
  category: ProviderCategory;
  status: ProviderStatus;
  is_enabled: boolean;
  last_check_at?: string | null;
  last_error?: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationCredential {
  id: string;
  provider_key: string;
  environment: 'production' | 'sandbox';
  label?: string | null;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AccountIntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface AccountIntegration {
  id: string;
  account_id: string;
  provider_key?: string | null;
  provider?: string | null;
  status: string;
  connected?: boolean;
  external_account_id?: string | null;
  config: Record<string, any>;
  last_sync_at?: string | null;
  last_error?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
  integration_provider?: IntegrationProvider;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  owner_type: 'internal' | 'partner';
  owner_id?: string | null;
  scopes: string[];
  is_active: boolean;
  rate_limit_per_min?: number | null;
  created_at: string;
  last_used_at?: string | null;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret?: string | null;
  is_active: boolean;
  events: string[];
  created_at: string;
  last_error?: string | null;
  last_trigger_at?: string | null;
}

export interface IntegrationStats {
  total: number;
  healthy: number;
  warning: number;
  error: number;
  unknown: number;
  enabled: number;
  disabled: number;
}
