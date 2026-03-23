/*
  # Create Audit Logs System

  1. Tables: audit_log_events, audit_log_changes
  2. Features: Activity tracking, field-level change history
*/

CREATE TABLE IF NOT EXISTS audit_log_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_event_id uuid NOT NULL REFERENCES audit_log_events(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_events_org ON audit_log_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_events_user ON audit_log_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_events_entity ON audit_log_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_events_created ON audit_log_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_changes_event ON audit_log_changes(audit_log_event_id);

ALTER TABLE audit_log_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view audit logs" ON audit_log_events FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "System creates audit logs" ON audit_log_events FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Members view audit changes" ON audit_log_changes FOR SELECT TO authenticated
  USING (audit_log_event_id IN (SELECT id FROM audit_log_events WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));
