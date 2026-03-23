/*
  # Create AI Reports System

  ## Summary
  This migration creates the full AI-powered reporting system, including:

  1. New Tables
    - `ai_reports` - stores AI-generated reports with plan and result JSON
    - `ai_report_schedules` - stores recurring report schedules

  2. Table: ai_reports
    - id (uuid, PK)
    - organization_id (uuid, FK → organizations)
    - created_by_user_id (uuid, FK → auth.users)
    - scope (text: 'my' | 'team' | 'org')
    - report_category (text: 'sales' | 'marketing' | 'ops' | 'reputation' | 'finance' | 'projects' | 'custom')
    - report_name (text)
    - timeframe_start / timeframe_end (timestamptz)
    - status (text: 'running' | 'complete' | 'failed')
    - plan_json (jsonb) - AI planning phase output
    - result_json (jsonb) - final composed report
    - rendered_html (text) - PDF-ready HTML
    - csv_data (text) - downloadable CSV
    - parent_report_id (uuid, self-referential FK) - for version chains
    - prompt (text) - original user prompt
    - data_sources_used (text[])
    - filters_applied (jsonb)
    - error_message (text)
    - delete_at (timestamptz)
    - created_at / updated_at (timestamptz)

  3. Table: ai_report_schedules
    - id, organization_id, user_id, original_report_id
    - cadence_days (integer, default 30)
    - next_run_at, last_run_at, is_active
    - report_name_template, scope, prompt_template
    - report_plan_template_json
    - created_at / updated_at

  4. Security
    - RLS enabled on both tables
    - Org members can view reports
    - Users can insert/update/delete own reports
    - Users can manage own schedules

  5. Performance
    - Indexes on organization_id, status, created_at, parent_report_id
*/

-- ============================================================
-- TABLE: ai_reports
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope               text NOT NULL CHECK (scope IN ('my', 'team', 'org')),
  report_category     text NOT NULL CHECK (report_category IN ('sales', 'marketing', 'ops', 'reputation', 'finance', 'projects', 'custom')),
  report_name         text NOT NULL,
  timeframe_start     timestamptz,
  timeframe_end       timestamptz,
  status              text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'complete', 'failed')),
  plan_json           jsonb,
  result_json         jsonb,
  rendered_html       text,
  csv_data            text,
  parent_report_id    uuid REFERENCES ai_reports(id) ON DELETE SET NULL,
  prompt              text NOT NULL DEFAULT '',
  data_sources_used   text[] DEFAULT '{}',
  filters_applied     jsonb DEFAULT '{}',
  error_message       text,
  delete_at           timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_reports_organization_id ON ai_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_by_user_id ON ai_reports(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_status ON ai_reports(status);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON ai_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_parent_report_id ON ai_reports(parent_report_id);

-- RLS
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view reports"
  ON ai_reports FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own reports"
  ON ai_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own reports"
  ON ai_reports FOR UPDATE
  TO authenticated
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can delete own reports"
  ON ai_reports FOR DELETE
  TO authenticated
  USING (created_by_user_id = auth.uid());

-- ============================================================
-- TABLE: ai_report_schedules
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_report_schedules (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id           uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_report_id        uuid REFERENCES ai_reports(id) ON DELETE SET NULL,
  cadence_days              integer NOT NULL DEFAULT 30,
  next_run_at               timestamptz NOT NULL,
  last_run_at               timestamptz,
  is_active                 boolean NOT NULL DEFAULT true,
  report_name_template      text NOT NULL DEFAULT '',
  scope                     text NOT NULL DEFAULT 'my' CHECK (scope IN ('my', 'team', 'org')),
  prompt_template           text NOT NULL DEFAULT '',
  report_plan_template_json jsonb NOT NULL DEFAULT '{}',
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_report_schedules_organization_id ON ai_report_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_report_schedules_user_id ON ai_report_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_report_schedules_original_report_id ON ai_report_schedules(original_report_id);
CREATE INDEX IF NOT EXISTS idx_ai_report_schedules_next_run_at ON ai_report_schedules(next_run_at);

-- RLS
ALTER TABLE ai_report_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules"
  ON ai_report_schedules FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own schedules"
  ON ai_report_schedules FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own schedules"
  ON ai_report_schedules FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own schedules"
  ON ai_report_schedules FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_ai_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_ai_reports_updated_at
  BEFORE UPDATE ON ai_reports
  FOR EACH ROW EXECUTE FUNCTION update_ai_reports_updated_at();

CREATE OR REPLACE TRIGGER trg_ai_report_schedules_updated_at
  BEFORE UPDATE ON ai_report_schedules
  FOR EACH ROW EXECUTE FUNCTION update_ai_reports_updated_at();
