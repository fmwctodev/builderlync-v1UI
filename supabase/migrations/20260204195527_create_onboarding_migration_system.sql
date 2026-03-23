/*
  # Create Onboarding & Migration System Tables
  
  1. New Tables
    - onboarding_progress: Onboarding tracking
    - onboarding_settings: Onboarding configuration
    - lead_sources: Lead source definitions
    - ai_agent_settings: AI agent configuration
    - telecom_settings: Telecom settings
    - crm_types: CRM types for migration
    - data_volume_estimates: Data volume ranges
    - migration_requests: CRM migration requests
    - migration_communications: Migration communications
    - organization_business_info: Organization business info
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Onboarding Progress Table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  current_step text DEFAULT 'welcome',
  completed_steps jsonb DEFAULT '[]'::jsonb,
  skipped_steps jsonb DEFAULT '[]'::jsonb,
  step_data jsonb DEFAULT '{}'::jsonb,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own onboarding progress"
    ON onboarding_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Onboarding Settings Table
CREATE TABLE IF NOT EXISTS onboarding_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  steps_config jsonb DEFAULT '[]'::jsonb,
  welcome_message text,
  completion_message text,
  auto_assign_tasks boolean DEFAULT true,
  send_welcome_email boolean DEFAULT true,
  required_fields jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage onboarding settings in their org"
    ON onboarding_settings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = onboarding_settings.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Lead Sources Table
CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  source_type text,
  description text,
  is_active boolean DEFAULT true,
  tracking_code text,
  default_pipeline_id uuid REFERENCES pipelines(id),
  default_owner_id uuid REFERENCES auth.users(id),
  attribution_settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage lead sources in their org"
    ON lead_sources FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = lead_sources.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AI Agent Settings Table
CREATE TABLE IF NOT EXISTS ai_agent_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  default_agent_id uuid REFERENCES ai_agents(id),
  global_settings jsonb DEFAULT '{}'::jsonb,
  voice_settings jsonb DEFAULT '{}'::jsonb,
  routing_settings jsonb DEFAULT '{}'::jsonb,
  fallback_settings jsonb DEFAULT '{}'::jsonb,
  is_enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage ai agent settings in their org"
    ON ai_agent_settings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = ai_agent_settings.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Telecom Settings Table
CREATE TABLE IF NOT EXISTS telecom_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  default_phone_number_id uuid REFERENCES phone_numbers(id),
  call_recording_enabled boolean DEFAULT false,
  voicemail_enabled boolean DEFAULT true,
  voicemail_greeting_url text,
  call_forwarding_enabled boolean DEFAULT false,
  call_forwarding_number text,
  sms_signature text,
  auto_reply_enabled boolean DEFAULT false,
  auto_reply_message text,
  business_hours jsonb DEFAULT '{}'::jsonb,
  after_hours_settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE telecom_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage telecom settings in their org"
    ON telecom_settings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = telecom_settings.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CRM Types Table
CREATE TABLE IF NOT EXISTS crm_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  logo_url text,
  migration_complexity text DEFAULT 'medium',
  supported_entities jsonb DEFAULT '[]'::jsonb,
  import_instructions text,
  export_instructions text,
  api_available boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE crm_types ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view crm types"
    ON crm_types FOR SELECT
    TO authenticated
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Data Volume Estimates Table
CREATE TABLE IF NOT EXISTS data_volume_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  range_label text NOT NULL UNIQUE,
  min_contacts integer NOT NULL,
  max_contacts integer,
  estimated_migration_hours numeric,
  complexity_multiplier numeric DEFAULT 1.0,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_volume_estimates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view data volume estimates"
    ON data_volume_estimates FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migration Requests Table
CREATE TABLE IF NOT EXISTS migration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  crm_type_id uuid REFERENCES crm_types(id),
  crm_type_other text,
  data_volume_id uuid REFERENCES data_volume_estimates(id),
  estimated_contacts integer,
  priority text DEFAULT 'normal',
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  migration_notes text,
  import_file_urls jsonb DEFAULT '[]'::jsonb,
  api_credentials jsonb,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  records_imported integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  import_log jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE migration_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage migration requests in their org"
    ON migration_requests FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = migration_requests.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migration Communications Table
CREATE TABLE IF NOT EXISTS migration_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_request_id uuid NOT NULL REFERENCES migration_requests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE migration_communications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view migration communications"
    ON migration_communications FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM migration_requests
        JOIN user_organizations ON user_organizations.organization_id = migration_requests.organization_id
        WHERE migration_requests.id = migration_communications.migration_request_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Organization Business Info Table
CREATE TABLE IF NOT EXISTS organization_business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  business_type text,
  ein text,
  license_number text,
  license_state text,
  license_expiry date,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry date,
  workers_comp_provider text,
  workers_comp_policy_number text,
  workers_comp_expiry date,
  bonded boolean DEFAULT false,
  bond_amount numeric,
  years_in_business integer,
  service_areas jsonb DEFAULT '[]'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  associations jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organization_business_info ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage business info in their org"
    ON organization_business_info FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = organization_business_info.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Organization Locations Table
CREATE TABLE IF NOT EXISTS organization_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  phone text,
  email text,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  business_hours jsonb DEFAULT '{}'::jsonb,
  location_lat numeric,
  location_lng numeric,
  service_radius_miles integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organization_locations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage locations in their org"
    ON organization_locations FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = organization_locations.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_org ON onboarding_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_settings_org ON onboarding_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_org ON lead_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_settings_org ON ai_agent_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_telecom_settings_org ON telecom_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_org ON migration_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_status ON migration_requests(status);
CREATE INDEX IF NOT EXISTS idx_migration_communications_request ON migration_communications(migration_request_id);
CREATE INDEX IF NOT EXISTS idx_organization_business_info_org ON organization_business_info(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_locations_org ON organization_locations(organization_id);
