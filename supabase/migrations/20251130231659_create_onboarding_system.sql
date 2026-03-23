/*
  # Onboarding System for Self-Service Account Setup

  ## Overview
  This migration creates the complete onboarding system that guides new users
  through a multi-step wizard after payment. It tracks progress, stores configuration,
  and enables users to resume onboarding later.

  ## Tables Created

  1. **onboarding_progress**
     - Tracks user progress through onboarding wizard
     - Stores current step, completed steps, and overall completion status
     - Includes onboarding_score for gamification

  2. **onboarding_settings**
     - Stores all configuration choices made during onboarding
     - JSON fields for flexible configuration storage
     - One record per organization

  3. **lead_sources**
     - Defines where leads come from (web forms, ads, etc.)
     - Configurable field mappings and settings
     - Can be activated/deactivated

  4. **ai_agent_settings** (if not exists)
     - Configuration for AI assistant personality and knowledge
     - Industry-specific settings and business details

  5. **telecom_settings** (if not exists)
     - Phone number configuration and call routing
     - Business hours and after-hours behavior

  ## Security
  - All tables have RLS enabled
  - Users can only access their own organization's data
  - Authenticated users required for all operations
*/

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  current_step int NOT NULL DEFAULT 1,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  total_steps int NOT NULL DEFAULT 10,
  onboarding_score int NOT NULL DEFAULT 0,
  is_complete boolean NOT NULL DEFAULT false,
  milestones_completed jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for onboarding_progress
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_organization_id ON onboarding_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_is_complete ON onboarding_progress(is_complete);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_current_step ON onboarding_progress(current_step);

-- Create onboarding_settings table
CREATE TABLE IF NOT EXISTS onboarding_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  business_type text,
  locations jsonb DEFAULT '[]'::jsonb,
  integrations_config jsonb DEFAULT '{}'::jsonb,
  branding_config jsonb DEFAULT '{}'::jsonb,
  pipeline_config jsonb DEFAULT '{}'::jsonb,
  ai_agent_config jsonb DEFAULT '{}'::jsonb,
  billing_config jsonb DEFAULT '{}'::jsonb,
  team_config jsonb DEFAULT '{}'::jsonb,
  lead_sources_config jsonb DEFAULT '{}'::jsonb,
  phone_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for onboarding_settings
CREATE INDEX IF NOT EXISTS idx_onboarding_settings_organization_id ON onboarding_settings(organization_id);

-- Create lead_sources table
CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('web_form', 'facebook_ads', 'google_ads', 'manual', 'zapier', 'csv_import', 'api', 'other')),
  is_active boolean NOT NULL DEFAULT true,
  field_mappings jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  webhook_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for lead_sources
CREATE INDEX IF NOT EXISTS idx_lead_sources_organization_id ON lead_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_source_type ON lead_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_lead_sources_is_active ON lead_sources(is_active);

-- Create ai_agent_settings table if not exists
CREATE TABLE IF NOT EXISTS ai_agent_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  tone text NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'direct')),
  industry_type text,
  services_offered text[],
  counties_served text[],
  pricing_info jsonb DEFAULT '{}'::jsonb,
  warranty_details text,
  business_hours jsonb DEFAULT '{}'::jsonb,
  knowledge_base_initialized boolean NOT NULL DEFAULT false,
  custom_responses jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for ai_agent_settings
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_organization_id ON ai_agent_settings(organization_id);

-- Create telecom_settings table if not exists
CREATE TABLE IF NOT EXISTS telecom_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number text,
  phone_number_sid text,
  forwarding_number text,
  business_hours jsonb DEFAULT '{}'::jsonb,
  after_hours_behavior text CHECK (after_hours_behavior IN ('voicemail', 'ai_agent', 'forward_mobile', 'disconnect')),
  voicemail_greeting text,
  voicemail_greeting_url text,
  call_recording_enabled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for telecom_settings
CREATE INDEX IF NOT EXISTS idx_telecom_settings_organization_id ON telecom_settings(organization_id);

-- Add onboarding_completed to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE organizations ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_completed ON organizations(onboarding_completed);
  END IF;
END $$;

-- Add selected_plan to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'selected_plan'
  ) THEN
    ALTER TABLE organizations ADD COLUMN selected_plan text;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telecom_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view own onboarding progress"
  ON onboarding_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
  ON onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress"
  ON onboarding_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for onboarding_settings
CREATE POLICY "Users can view org onboarding settings"
  ON onboarding_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = onboarding_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert org onboarding settings"
  ON onboarding_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = onboarding_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org onboarding settings"
  ON onboarding_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = onboarding_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = onboarding_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for lead_sources
CREATE POLICY "Users can view org lead sources"
  ON lead_sources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = lead_sources.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert org lead sources"
  ON lead_sources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = lead_sources.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org lead sources"
  ON lead_sources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = lead_sources.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = lead_sources.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_agent_settings
CREATE POLICY "Users can view org ai agent settings"
  ON ai_agent_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agent_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert org ai agent settings"
  ON ai_agent_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agent_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org ai agent settings"
  ON ai_agent_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agent_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agent_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for telecom_settings
CREATE POLICY "Users can view org telecom settings"
  ON telecom_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = telecom_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert org telecom settings"
  ON telecom_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = telecom_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org telecom settings"
  ON telecom_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = telecom_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = telecom_settings.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_settings_updated_at ON onboarding_settings;
CREATE TRIGGER update_onboarding_settings_updated_at
  BEFORE UPDATE ON onboarding_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_sources_updated_at ON lead_sources;
CREATE TRIGGER update_lead_sources_updated_at
  BEFORE UPDATE ON lead_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_agent_settings_updated_at ON ai_agent_settings;
CREATE TRIGGER update_ai_agent_settings_updated_at
  BEFORE UPDATE ON ai_agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_telecom_settings_updated_at ON telecom_settings;
CREATE TRIGGER update_telecom_settings_updated_at
  BEFORE UPDATE ON telecom_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();