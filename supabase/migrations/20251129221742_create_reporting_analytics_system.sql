/*
  # Create Reporting & Analytics System

  1. New Tables
    - report_templates - Custom report templates
    - scheduled_reports - Automated report scheduling
    - report_exports - Generated report files

  2. Security
    - Enable RLS on all tables
    - Organization-based access control

  3. Features
    - Custom report builder
    - Scheduled generation
    - PDF/CSV exports
    - Email delivery
*/

-- Create report_templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  
  -- Template Information
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('marketing', 'sales', 'operations', 'financial', 'custom')),
  
  -- Report Configuration
  report_type text NOT NULL CHECK (report_type IN (
    'campaign_performance',
    'lead_generation',
    'pipeline_analysis',
    'revenue_forecast',
    'customer_acquisition',
    'roi_analysis',
    'custom'
  )),
  
  -- Data Sources
  data_sources jsonb DEFAULT '[]'::jsonb,
  -- Example: ["campaigns", "opportunities", "platform_analytics_data"]
  
  -- Query Configuration
  filters jsonb DEFAULT '{}'::jsonb,
  date_range_config jsonb DEFAULT '{}'::jsonb,
  grouping_config jsonb DEFAULT '{}'::jsonb,
  
  -- Visualization
  chart_types jsonb DEFAULT '[]'::jsonb,
  -- Example: [{"type": "line", "metric": "revenue"}, {"type": "bar", "metric": "leads"}]
  
  -- Metrics
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{"key": "total_revenue", "label": "Total Revenue", "aggregation": "sum"}]
  
  -- Layout
  layout_config jsonb DEFAULT '{}'::jsonb,
  page_size text DEFAULT 'A4',
  orientation text DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
  
  -- Sharing
  is_shared boolean DEFAULT false,
  is_system_template boolean DEFAULT false,
  
  -- Usage Tracking
  use_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scheduled_reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  report_template_id uuid NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  
  -- Schedule Configuration
  name text NOT NULL,
  is_active boolean DEFAULT true,
  
  -- Frequency
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  frequency_config jsonb DEFAULT '{}'::jsonb,
  -- Example: {"day_of_week": "monday", "time": "09:00", "timezone": "America/New_York"}
  
  -- Date Range
  report_date_range text CHECK (report_date_range IN ('yesterday', 'last_7_days', 'last_30_days', 'last_month', 'last_quarter', 'custom')),
  custom_date_range jsonb DEFAULT '{}'::jsonb,
  
  -- Delivery
  delivery_method text DEFAULT 'email' CHECK (delivery_method IN ('email', 'download', 'both')),
  email_recipients text[] DEFAULT ARRAY[]::text[],
  email_subject text,
  email_body text,
  
  -- Export Format
  export_formats text[] DEFAULT ARRAY['pdf']::text[], -- 'pdf', 'csv', 'excel'
  
  -- Execution Tracking
  last_run_at timestamptz,
  next_run_at timestamptz,
  last_run_status text CHECK (last_run_status IN ('success', 'failed', 'skipped')),
  last_run_error text,
  execution_count integer DEFAULT 0,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_exports table
CREATE TABLE IF NOT EXISTS report_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  report_template_id uuid REFERENCES report_templates(id) ON DELETE SET NULL,
  scheduled_report_id uuid REFERENCES scheduled_reports(id) ON DELETE SET NULL,
  
  -- Export Information
  report_name text NOT NULL,
  export_format text NOT NULL CHECK (export_format IN ('pdf', 'csv', 'excel', 'json')),
  
  -- Date Range
  date_range_start date,
  date_range_end date,
  
  -- File Information
  file_url text,
  file_size bigint,
  file_path text,
  storage_bucket text DEFAULT 'reports',
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'expired')),
  
  -- Generation
  started_at timestamptz,
  completed_at timestamptz,
  generation_duration_ms integer,
  
  -- Error Handling
  error_message text,
  retry_count integer DEFAULT 0,
  
  -- Data Summary
  data_points_count integer,
  summary_stats jsonb DEFAULT '{}'::jsonb,
  
  -- Delivery
  was_emailed boolean DEFAULT false,
  email_sent_at timestamptz,
  email_recipients text[],
  
  -- Expiry
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  is_permanent boolean DEFAULT false,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_organization ON report_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_organization ON scheduled_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_template ON scheduled_reports(report_template_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_report_exports_organization ON report_exports(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_template ON report_exports(report_template_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_scheduled ON report_exports(scheduled_report_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_status ON report_exports(status);
CREATE INDEX IF NOT EXISTS idx_report_exports_created_at ON report_exports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_exports_expires_at ON report_exports(expires_at) WHERE is_permanent = false;

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_templates
CREATE POLICY "Users view templates in org" ON report_templates FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) OR is_system_template = true);

CREATE POLICY "Users create templates in org" ON report_templates FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users update templates in org" ON report_templates FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) AND is_system_template = false);

CREATE POLICY "Users delete templates in org" ON report_templates FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')) AND is_system_template = false);

-- RLS Policies for scheduled_reports
CREATE POLICY "Users view scheduled reports in org" ON scheduled_reports FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage scheduled reports in org" ON scheduled_reports FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for report_exports
CREATE POLICY "Users view exports in org" ON report_exports FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users create exports in org" ON report_exports FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users delete exports in org" ON report_exports FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Function to auto-delete expired reports
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM report_exports
  WHERE is_permanent = false
  AND expires_at < now()
  AND status = 'completed';
END;
$$ LANGUAGE plpgsql;
