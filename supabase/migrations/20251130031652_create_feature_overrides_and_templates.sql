/*
  # Feature Flags Enhancement - Overrides and Templates

  1. New Tables
    - `feature_flag_overrides` - Per-account feature overrides
    - `feature_metadata` - Optional feature configuration data
    - `default_templates` - Reusable templates for new accounts

  2. Security
    - Enable RLS on all new tables
    - Add super admin policies for full access
*/

-- Feature Flag Overrides Table
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL REFERENCES feature_flags(key) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  value boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(feature_key, account_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_overrides_feature ON feature_flag_overrides(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_overrides_account ON feature_flag_overrides(account_id);

-- Feature Metadata Table
CREATE TABLE IF NOT EXISTS feature_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL REFERENCES feature_flags(key) ON DELETE CASCADE,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(feature_key)
);

CREATE INDEX IF NOT EXISTS idx_feature_metadata_key ON feature_metadata(feature_key);

-- Default Templates Table
CREATE TABLE IF NOT EXISTS default_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('pipeline', 'automation', 'dashboard')),
  label text NOT NULL,
  description text,
  config jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON default_templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON default_templates(is_active);

-- Enable Row Level Security
ALTER TABLE feature_flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin access only)
CREATE POLICY "Super admin full access to feature_overrides"
  ON feature_flag_overrides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to feature_metadata"
  ON feature_metadata FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to default_templates"
  ON default_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_feature_overrides_updated_at ON feature_flag_overrides;
CREATE TRIGGER update_feature_overrides_updated_at
  BEFORE UPDATE ON feature_flag_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_metadata_updated_at ON feature_metadata;
CREATE TRIGGER update_feature_metadata_updated_at
  BEFORE UPDATE ON feature_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_default_templates_updated_at ON default_templates;
CREATE TRIGGER update_default_templates_updated_at
  BEFORE UPDATE ON default_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed Sample Feature Flags
INSERT INTO feature_flags (key, name, description, status, rollout_type, rollout_config)
VALUES
  ('claims_assistant', 'Claims AI Assistant', 'AI-powered assistant for insurance claims processing', 'on', 'all', '{}'),
  ('ai_followup', 'AI-Powered Follow-ups', 'Automated AI follow-up messages for leads and customers', 'beta', 'percentage', '{"percentage": 30}'),
  ('advanced_reporting', 'Advanced Analytics', 'Advanced reporting and analytics dashboards', 'on', 'beta', '{}'),
  ('mobile_app_v2', 'New Mobile App', 'Next generation mobile application', 'off', 'all', '{}'),
  ('voice_transcription', 'Call Transcription', 'Automatic transcription of voice calls', 'beta', 'percentage', '{"percentage": 50}'),
  ('custom_workflows', 'Custom Workflow Builder', 'Build custom automation workflows', 'on', 'all', '{}'),
  ('white_labeling', 'White Label Options', 'Custom branding and white label features', 'off', 'all', '{}')
ON CONFLICT (key) DO NOTHING;

-- Seed Sample Templates
INSERT INTO default_templates (key, type, label, description, config, is_active)
VALUES
  (
    'default_job_pipeline',
    'pipeline',
    'Standard Job Pipeline',
    'Default pipeline stages for job management',
    '{"stages": [{"name": "Lead", "color": "#3B82F6"}, {"name": "Estimate Sent", "color": "#8B5CF6"}, {"name": "Approved", "color": "#10B981"}, {"name": "Scheduled", "color": "#F59E0B"}, {"name": "In Progress", "color": "#EF4444"}, {"name": "Completed", "color": "#059669"}]}',
    true
  ),
  (
    'residential_pipeline',
    'pipeline',
    'Residential Pipeline',
    'Optimized pipeline for residential projects',
    '{"stages": [{"name": "New Lead", "color": "#3B82F6"}, {"name": "Site Visit Scheduled", "color": "#8B5CF6"}, {"name": "Quote Prepared", "color": "#F59E0B"}, {"name": "Contract Signed", "color": "#10B981"}, {"name": "Project Started", "color": "#EF4444"}, {"name": "Final Inspection", "color": "#F97316"}, {"name": "Complete", "color": "#059669"}]}',
    true
  ),
  (
    'lead_nurture',
    'automation',
    'Lead Nurture Sequence',
    'Automated lead nurturing workflow',
    '{"triggers": [{"type": "lead_created", "delay": 0}], "actions": [{"type": "send_email", "template": "welcome", "delay": 0}, {"type": "send_sms", "template": "followup_1", "delay": 86400}, {"type": "send_email", "template": "value_prop", "delay": 259200}]}',
    true
  ),
  (
    'customer_onboarding',
    'automation',
    'Customer Onboarding',
    'Onboarding automation for new customers',
    '{"triggers": [{"type": "customer_created", "delay": 0}], "actions": [{"type": "send_email", "template": "welcome_customer", "delay": 0}, {"type": "assign_task", "assignee": "account_manager", "delay": 3600}, {"type": "schedule_call", "delay": 172800}]}',
    true
  ),
  (
    'executive_dashboard',
    'dashboard',
    'Executive Dashboard',
    'High-level metrics for executives',
    '{"widgets": [{"type": "revenue_chart", "position": {"x": 0, "y": 0, "w": 6, "h": 3}}, {"type": "conversion_rate", "position": {"x": 6, "y": 0, "w": 3, "h": 3}}, {"type": "active_jobs", "position": {"x": 9, "y": 0, "w": 3, "h": 3}}, {"type": "team_performance", "position": {"x": 0, "y": 3, "w": 12, "h": 4}}]}',
    true
  ),
  (
    'sales_dashboard',
    'dashboard',
    'Sales Team Dashboard',
    'Metrics and KPIs for sales team',
    '{"widgets": [{"type": "pipeline_overview", "position": {"x": 0, "y": 0, "w": 8, "h": 3}}, {"type": "daily_activity", "position": {"x": 8, "y": 0, "w": 4, "h": 3}}, {"type": "top_performers", "position": {"x": 0, "y": 3, "w": 6, "h": 4}}, {"type": "conversion_funnel", "position": {"x": 6, "y": 3, "w": 6, "h": 4}}]}',
    true
  )
ON CONFLICT (key) DO NOTHING;