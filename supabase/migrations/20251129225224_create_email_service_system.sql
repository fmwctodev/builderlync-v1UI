/*
  # Create Email Service System

  1. Tables: email_service_configs, email_sending_domains
  2. Features: SMTP configuration, domain verification
*/

CREATE TABLE IF NOT EXISTS email_service_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  config_name text NOT NULL,
  provider text NOT NULL,
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  use_tls boolean DEFAULT true,
  from_email text NOT NULL,
  from_name text,
  reply_to_email text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  daily_limit integer,
  sent_today integer DEFAULT 0,
  last_reset_at date DEFAULT CURRENT_DATE,
  test_status text,
  last_test_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_sending_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain text NOT NULL,
  verification_status text DEFAULT 'pending',
  dkim_verified boolean DEFAULT false,
  spf_verified boolean DEFAULT false,
  dmarc_verified boolean DEFAULT false,
  verification_token text,
  dkim_selector text,
  dkim_public_key text,
  dns_records jsonb DEFAULT '[]'::jsonb,
  last_verified_at timestamptz,
  bounce_rate numeric(5, 2) DEFAULT 0,
  complaint_rate numeric(5, 2) DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_email_service_configs_org ON email_service_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_sending_domains_org ON email_sending_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_sending_domains_status ON email_sending_domains(verification_status);

ALTER TABLE email_service_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sending_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email configs" ON email_service_configs FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins manage sending domains" ON email_sending_domains FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Members view sending domains" ON email_sending_domains FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
