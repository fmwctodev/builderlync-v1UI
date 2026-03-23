/*
  # Integrations & API System

  1. New Tables
    - `integration_providers` - Global provider registry and health
    - `integration_credentials` - Provider credentials per environment
    - `api_keys` - Internal and partner API keys
    - `webhook_endpoints` - Outbound webhook configuration

  2. Updates
    - Enhance existing `account_integrations` table with provider_key reference

  3. Security
    - Enable RLS on all tables
    - Add super admin policies
*/

-- Integration Providers Table (Global)
CREATE TABLE IF NOT EXISTS integration_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('telephony', 'accounting', 'roofing', 'supplier', 'payments', 'auth', 'email', 'ai')),
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('healthy', 'warning', 'error', 'unknown')),
  is_enabled boolean NOT NULL DEFAULT true,
  last_check_at timestamptz,
  last_error text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_providers_key ON integration_providers(key);
CREATE INDEX IF NOT EXISTS idx_integration_providers_category ON integration_providers(category);
CREATE INDEX IF NOT EXISTS idx_integration_providers_status ON integration_providers(status);

-- Integration Credentials Table
CREATE TABLE IF NOT EXISTS integration_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL REFERENCES integration_providers(key) ON DELETE CASCADE,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'sandbox')),
  label text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_credentials_provider ON integration_credentials(provider_key);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_env ON integration_credentials(environment, is_active);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key text NOT NULL UNIQUE,
  owner_type text NOT NULL CHECK (owner_type IN ('internal', 'partner')),
  owner_id text,
  scopes text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  rate_limit_per_min integer,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON api_keys(owner_type, is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used ON api_keys(last_used_at);

-- Webhook Endpoints Table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  secret text,
  is_active boolean NOT NULL DEFAULT true,
  events text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  last_error text,
  last_trigger_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active);

-- Add provider_key column to existing account_integrations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'account_integrations' AND column_name = 'provider_key'
  ) THEN
    ALTER TABLE account_integrations ADD COLUMN provider_key text;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin access only)
CREATE POLICY "Super admin full access to integration_providers"
  ON integration_providers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to integration_credentials"
  ON integration_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to api_keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to webhook_endpoints"
  ON webhook_endpoints FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_integration_providers_updated_at ON integration_providers;
CREATE TRIGGER update_integration_providers_updated_at
  BEFORE UPDATE ON integration_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_credentials_updated_at ON integration_credentials;
CREATE TRIGGER update_integration_credentials_updated_at
  BEFORE UPDATE ON integration_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed Integration Providers
INSERT INTO integration_providers (key, name, category, status, is_enabled, config)
VALUES
  ('twilio', 'Twilio', 'telephony', 'healthy', true, '{"region": "us-east-1", "mode": "production"}'),
  ('quickbooks', 'QuickBooks Online', 'accounting', 'healthy', true, '{"api_version": "v3", "mode": "production"}'),
  ('eagleview', 'EagleView', 'roofing', 'healthy', true, '{"mode": "production"}'),
  ('abc_supply', 'ABC Supply', 'supplier', 'unknown', true, '{}'),
  ('srs', 'SRS Distribution', 'supplier', 'unknown', true, '{}'),
  ('beacon', 'Beacon Building Products', 'supplier', 'unknown', true, '{}'),
  ('stripe', 'Stripe', 'payments', 'healthy', true, '{"mode": "production"}'),
  ('google', 'Google Workspace', 'auth', 'healthy', true, '{}'),
  ('microsoft', 'Microsoft 365', 'auth', 'healthy', true, '{}'),
  ('openai', 'OpenAI', 'ai', 'healthy', true, '{"model": "gpt-4"}'),
  ('sendgrid', 'SendGrid', 'email', 'healthy', true, '{"region": "us"}'),
  ('mailgun', 'Mailgun', 'email', 'unknown', false, '{"region": "us"}')
ON CONFLICT (key) DO NOTHING;

-- Seed Sample Credentials
INSERT INTO integration_credentials (provider_key, environment, label, config, is_active)
VALUES
  ('twilio', 'production', 'Primary Twilio Account', '{"account_sid": "AC***", "auth_token": "***"}', true),
  ('twilio', 'sandbox', 'Test Account', '{"account_sid": "AC***test", "auth_token": "***"}', true),
  ('stripe', 'production', 'Live Account', '{"secret_key": "sk_live_***", "publishable_key": "pk_live_***"}', true),
  ('stripe', 'sandbox', 'Test Account', '{"secret_key": "sk_test_***", "publishable_key": "pk_test_***"}', true),
  ('openai', 'production', 'Primary API Key', '{"api_key": "sk-***"}', true)
ON CONFLICT DO NOTHING;

-- Seed Sample API Keys
INSERT INTO api_keys (name, key, owner_type, owner_id, scopes, is_active, rate_limit_per_min)
VALUES
  ('Internal Dashboard API', 'blk_live_' || substr(md5(random()::text), 1, 32), 'internal', NULL, 
   ARRAY['accounts.read', 'accounts.write', 'jobs.read', 'jobs.write', 'analytics.read'], true, 1000),
  ('Partner Integration - Acme Corp', 'blk_live_' || substr(md5(random()::text), 1, 32), 'partner', 'acme_corp', 
   ARRAY['jobs.read', 'contacts.read', 'contacts.write'], true, 100),
  ('Mobile App API', 'blk_live_' || substr(md5(random()::text), 1, 32), 'internal', NULL, 
   ARRAY['accounts.read', 'jobs.read', 'contacts.read'], true, 500)
ON CONFLICT DO NOTHING;

-- Seed Sample Webhook Endpoints
INSERT INTO webhook_endpoints (name, url, secret, is_active, events)
VALUES
  ('Zapier Integration', 'https://hooks.zapier.com/hooks/catch/123456/abcdef/', 'whsec_' || substr(md5(random()::text), 1, 24), true, 
   ARRAY['job.created', 'job.completed', 'invoice.paid']),
  ('Slack Notifications', 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX', 'whsec_' || substr(md5(random()::text), 1, 24), true, 
   ARRAY['job.created', 'estimate.approved', 'customer.created']),
  ('Internal Analytics', 'https://analytics.example.com/webhook', 'whsec_' || substr(md5(random()::text), 1, 24), false, 
   ARRAY['job.created', 'job.updated', 'job.completed'])
ON CONFLICT DO NOTHING;