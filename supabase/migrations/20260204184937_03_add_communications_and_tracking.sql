/*
  # Add Communications Tracking and Additional Features
  
  Tables for:
  - Call logs
  - SMS tracking
  - Email tracking
  - Attribution tracking
  - Campaigns
*/

-- ============================================================================
-- Call Logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  direction text NOT NULL,
  from_number text,
  to_number text,
  duration_seconds integer DEFAULT 0,
  status text,
  recording_url text,
  transcription text,
  call_sid text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_org ON call_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact ON call_logs(contact_id);

-- ============================================================================
-- Email Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  conversation_id uuid REFERENCES conversations(id),
  from_email text,
  to_email text,
  subject text,
  body_html text,
  body_text text,
  direction text NOT NULL,
  status text DEFAULT 'sent',
  opened_at timestamptz,
  clicked_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_org ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_contact ON email_logs(contact_id);

-- ============================================================================
-- SMS Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  conversation_id uuid REFERENCES conversations(id),
  from_number text,
  to_number text,
  message text,
  direction text NOT NULL,
  status text DEFAULT 'sent',
  message_sid text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_org ON sms_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_contact ON sms_logs(contact_id);

-- ============================================================================
-- Campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  campaign_type text NOT NULL,
  status text DEFAULT 'draft',
  start_date date,
  end_date date,
  budget numeric(12,2),
  goals jsonb DEFAULT '{}'::jsonb,
  targeting jsonb DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);

-- ============================================================================
-- Attribution Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS attribution_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  source_type text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  attribution_source_id uuid REFERENCES attribution_sources(id),
  first_touch_source text,
  last_touch_source text,
  conversion_source text,
  landing_page text,
  referrer text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contact_id)
);

CREATE INDEX IF NOT EXISTS idx_attribution_sources_org ON attribution_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_attribution_org ON contact_attribution(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_attribution_contact ON contact_attribution(contact_id);

-- ============================================================================
-- Tags System
-- ============================================================================

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

CREATE TABLE IF NOT EXISTS contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_tags_org ON tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_org ON contact_tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact ON contact_tags(contact_id);

-- ============================================================================
-- Custom Fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, entity_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_org ON custom_fields(organization_id);

-- ============================================================================
-- Audit Logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Call Logs
CREATE POLICY "Users can view organization call logs"
  ON call_logs FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization call logs"
  ON call_logs FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Email Logs
CREATE POLICY "Users can view organization email logs"
  ON email_logs FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization email logs"
  ON email_logs FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- SMS Logs
CREATE POLICY "Users can view organization sms logs"
  ON sms_logs FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization sms logs"
  ON sms_logs FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Campaigns
CREATE POLICY "Users can view organization campaigns"
  ON campaigns FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization campaigns"
  ON campaigns FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Attribution Sources
CREATE POLICY "Users can view organization attribution sources"
  ON attribution_sources FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization attribution sources"
  ON attribution_sources FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Contact Attribution
CREATE POLICY "Users can view organization contact attribution"
  ON contact_attribution FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization contact attribution"
  ON contact_attribution FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Tags
CREATE POLICY "Users can view organization tags"
  ON tags FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization tags"
  ON tags FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Contact Tags
CREATE POLICY "Users can view organization contact tags"
  ON contact_tags FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization contact tags"
  ON contact_tags FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Custom Fields
CREATE POLICY "Users can view organization custom fields"
  ON custom_fields FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization custom fields"
  ON custom_fields FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Audit Logs
CREATE POLICY "Users can view organization audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_has_org_access(organization_id));
