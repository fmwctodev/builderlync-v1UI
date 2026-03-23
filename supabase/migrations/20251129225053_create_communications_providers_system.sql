/*
  # Create Communications Providers System

  1. Table: communication_providers
  2. Features: SMS/Email provider configuration
*/

CREATE TABLE IF NOT EXISTS communication_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_type text NOT NULL,
  provider_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  is_primary boolean DEFAULT false,
  credentials jsonb DEFAULT '{}'::jsonb,
  configuration jsonb DEFAULT '{}'::jsonb,
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  error_count integer DEFAULT 0,
  last_error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_providers_org ON communication_providers(organization_id);

ALTER TABLE communication_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage comm providers" ON communication_providers FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
