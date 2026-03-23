/*
  # Create Integrations System

  1. Tables: integration_connections, integration_webhooks, integration_api_keys
  2. Features: OAuth connections, webhook management, API keys
*/

CREATE TABLE IF NOT EXISTS integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  connection_type text NOT NULL,
  status text DEFAULT 'connected',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  external_account_id text,
  external_account_name text,
  configuration jsonb DEFAULT '{}'::jsonb,
  last_activity_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  webhook_url text NOT NULL,
  events text[] NOT NULL,
  secret_key text,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  api_key text NOT NULL UNIQUE,
  permissions jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  last_used_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_connections_org ON integration_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_org ON integration_webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_api_keys_org ON integration_api_keys(organization_id);

ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage integrations" ON integration_connections FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins manage webhooks" ON integration_webhooks FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins manage api keys" ON integration_api_keys FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
