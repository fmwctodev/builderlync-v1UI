/*
  # Create System & Infrastructure Tables
  
  1. New Tables
    - sync_configurations: Sync configurations
    - sync_logs: Sync logging
    - custom_field_definitions: Custom field definitions
    - custom_field_values: Custom field values
    - brand_assets: Brand assets
    - brand_guidelines: Brand guidelines
    - email_service_configs: Email service config
    - email_sending_domains: Sending domains
    - api_services: API service health
    - job_queues: Job queue monitoring
    - system_releases: Release tracking
    - system_settings: System settings
    - error_logs: Error logging
    - query_metrics: Query performance tracking
    - folders: Folder hierarchy for files
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Sync Configurations Table
CREATE TABLE IF NOT EXISTS sync_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  provider text NOT NULL,
  direction text DEFAULT 'bidirectional',
  is_enabled boolean DEFAULT true,
  sync_frequency text DEFAULT 'hourly',
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  field_mappings jsonb DEFAULT '{}'::jsonb,
  filter_rules jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, sync_type, provider)
);

ALTER TABLE sync_configurations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sync configurations in their org"
    ON sync_configurations FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sync_configurations.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sync Logs Table
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id uuid NOT NULL REFERENCES sync_configurations(id) ON DELETE CASCADE,
  status text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  error_details jsonb,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view sync logs"
    ON sync_logs FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM sync_configurations
        JOIN user_organizations ON user_organizations.organization_id = sync_configurations.organization_id
        WHERE sync_configurations.id = sync_logs.configuration_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Custom Field Definitions Table
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  field_key text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL,
  description text,
  placeholder text,
  default_value text,
  options jsonb DEFAULT '[]'::jsonb,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  is_required boolean DEFAULT false,
  is_searchable boolean DEFAULT false,
  is_filterable boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, entity_type, field_key)
);

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage custom field definitions in their org"
    ON custom_field_definitions FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = custom_field_definitions.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Custom Field Values Table
CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL,
  field_value text,
  field_value_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(definition_id, entity_id)
);

ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage custom field values"
    ON custom_field_values FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM custom_field_definitions
        JOIN user_organizations ON user_organizations.organization_id = custom_field_definitions.organization_id
        WHERE custom_field_definitions.id = custom_field_values.definition_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Brand Assets Table
CREATE TABLE IF NOT EXISTS brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  file_format text,
  file_size bigint,
  dimensions jsonb,
  usage_guidelines text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  uploaded_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage brand assets in their org"
    ON brand_assets FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = brand_assets.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Brand Guidelines Table
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guideline_type text NOT NULL,
  title text NOT NULL,
  content text,
  examples jsonb DEFAULT '[]'::jsonb,
  do_list jsonb DEFAULT '[]'::jsonb,
  dont_list jsonb DEFAULT '[]'::jsonb,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage brand guidelines in their org"
    ON brand_guidelines FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = brand_guidelines.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Email Service Configs Table
CREATE TABLE IF NOT EXISTS email_service_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  provider text NOT NULL DEFAULT 'sendgrid',
  api_key text,
  from_email text,
  from_name text,
  reply_to_email text,
  is_configured boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  daily_limit integer,
  monthly_limit integer,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_service_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage email service configs in their org"
    ON email_service_configs FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = email_service_configs.organization_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('owner', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Email Sending Domains Table
CREATE TABLE IF NOT EXISTS email_sending_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain text NOT NULL,
  status text DEFAULT 'pending',
  verification_token text,
  verified_at timestamptz,
  dns_records jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, domain)
);

ALTER TABLE email_sending_domains ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage email sending domains in their org"
    ON email_sending_domains FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = email_sending_domains.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- API Services Table
CREATE TABLE IF NOT EXISTS api_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  base_url text,
  status text DEFAULT 'operational',
  health_check_url text,
  last_health_check_at timestamptz,
  response_time_ms integer,
  uptime_percent numeric DEFAULT 100,
  incidents_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_services ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view api services"
    ON api_services FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Job Queues Table
CREATE TABLE IF NOT EXISTS job_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name text NOT NULL UNIQUE,
  description text,
  pending_jobs integer DEFAULT 0,
  processing_jobs integer DEFAULT 0,
  completed_jobs integer DEFAULT 0,
  failed_jobs integer DEFAULT 0,
  average_wait_time_ms integer,
  average_process_time_ms integer,
  last_job_at timestamptz,
  is_paused boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_queues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage job queues"
    ON job_queues FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- System Releases Table
CREATE TABLE IF NOT EXISTS system_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  release_type text DEFAULT 'minor',
  title text,
  release_notes text,
  changelog jsonb DEFAULT '[]'::jsonb,
  breaking_changes jsonb DEFAULT '[]'::jsonb,
  deprecations jsonb DEFAULT '[]'::jsonb,
  released_at timestamptz DEFAULT now(),
  is_current boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE system_releases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view system releases"
    ON system_releases FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  value_json jsonb,
  description text,
  category text,
  is_public boolean DEFAULT false,
  is_editable boolean DEFAULT true,
  data_type text DEFAULT 'string',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view public system settings"
    ON system_settings FOR SELECT
    TO authenticated
    USING (is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage system settings"
    ON system_settings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'error',
  error_type text NOT NULL,
  message text NOT NULL,
  stack_trace text,
  context jsonb DEFAULT '{}'::jsonb,
  url text,
  user_agent text,
  ip_address inet,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can view error logs"
    ON error_logs FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Query Metrics Table
CREATE TABLE IF NOT EXISTS query_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  query_name text NOT NULL,
  query_type text,
  duration_ms integer NOT NULL,
  success boolean DEFAULT true,
  error_message text,
  rows_affected integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE query_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can view query metrics"
    ON query_metrics FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  folder_type text DEFAULT 'general',
  color text,
  icon text,
  path text,
  is_system boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage folders in their org"
    ON folders FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = folders.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sync_configurations_org ON sync_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_config ON sync_logs(configuration_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_org ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_entity ON custom_field_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_definition ON custom_field_values(definition_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_org ON brand_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_org ON brand_guidelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_service_configs_org ON email_service_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_sending_domains_org ON email_sending_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_org ON error_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_query_metrics_org ON query_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_query_metrics_name ON query_metrics(query_name);
CREATE INDEX IF NOT EXISTS idx_folders_org ON folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);
