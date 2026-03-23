/*
  # Create Sync Configurations System

  1. Tables: sync_configurations, sync_logs
  2. Features: Third-party sync settings, activity logs
*/

CREATE TABLE IF NOT EXISTS sync_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  provider text NOT NULL,
  is_enabled boolean DEFAULT true,
  sync_direction text DEFAULT 'bidirectional',
  sync_frequency_minutes integer DEFAULT 60,
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  credentials jsonb DEFAULT '{}'::jsonb,
  field_mappings jsonb DEFAULT '{}'::jsonb,
  conflict_resolution text DEFAULT 'source_wins',
  error_count integer DEFAULT 0,
  last_error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_configuration_id uuid NOT NULL REFERENCES sync_configurations(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL,
  records_synced integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  duration_ms integer,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_configs_org ON sync_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_config ON sync_logs(sync_configuration_id);

ALTER TABLE sync_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sync configs" ON sync_configurations FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Members view sync logs" ON sync_logs FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
