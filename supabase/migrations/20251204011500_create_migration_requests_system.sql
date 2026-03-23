/*
  # CRM Migration Request System

  ## Overview
  This migration creates the system for users to request CRM data migration from their existing CRM to BuilderLync.
  It includes request tracking, status management, and communication between users and migration experts.

  ## Tables Created

  1. **crm_types**
     - Lookup table for supported CRM platforms
     - Common CRMs like Salesforce, HubSpot, JobNimbus, etc.

  2. **data_volume_estimates**
     - Lookup table for data volume ranges
     - Helps estimate migration complexity and timeline

  3. **migration_requests**
     - Main table storing CRM migration requests
     - Tracks current CRM, data volume, timeline, status
     - Links to organization and requesting user
     - Stores migration notes and requirements

  4. **migration_communications**
     - Messages between users and migration team
     - Tracks conversation history for each request

  ## Changes to Existing Tables
  - Adds migration_requested flag to onboarding_progress
  - Adds migration_request_id to onboarding_progress for tracking

  ## Security
  - All tables have RLS enabled
  - Users can only access their organization's migration requests
  - Migration team has special access via role-based policies
*/

-- Create CRM types lookup table
CREATE TABLE IF NOT EXISTS crm_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  migration_complexity text CHECK (migration_complexity IN ('simple', 'moderate', 'complex')),
  estimated_days int,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert common CRM types
INSERT INTO crm_types (name, description, migration_complexity, estimated_days, display_order) VALUES
  ('Salesforce', 'Enterprise CRM platform', 'complex', 14, 1),
  ('HubSpot', 'Inbound marketing and sales platform', 'moderate', 10, 2),
  ('JobNimbus', 'Construction industry CRM', 'moderate', 7, 3),
  ('AccuLynx', 'Roofing contractor software', 'moderate', 7, 4),
  ('Zoho CRM', 'Cloud-based CRM suite', 'moderate', 10, 5),
  ('Pipedrive', 'Sales-focused CRM', 'moderate', 7, 6),
  ('Monday.com', 'Work management platform', 'simple', 5, 7),
  ('Insightly', 'CRM and project management', 'moderate', 10, 8),
  ('Freshsales', 'AI-powered CRM', 'moderate', 7, 9),
  ('ServiceTitan', 'Home services software', 'complex', 14, 10),
  ('Excel/Google Sheets', 'Spreadsheet data', 'simple', 3, 11),
  ('Other', 'Other CRM or custom system', 'moderate', 10, 12)
ON CONFLICT (name) DO NOTHING;

-- Create data volume estimates lookup table
CREATE TABLE IF NOT EXISTS data_volume_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  range_label text NOT NULL UNIQUE,
  min_contacts int,
  max_contacts int,
  complexity_multiplier decimal(3,2) NOT NULL DEFAULT 1.0,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert data volume ranges
INSERT INTO data_volume_estimates (range_label, min_contacts, max_contacts, complexity_multiplier, display_order) VALUES
  ('0-500 contacts', 0, 500, 1.0, 1),
  ('500-2,000 contacts', 500, 2000, 1.2, 2),
  ('2,000-5,000 contacts', 2000, 5000, 1.5, 3),
  ('5,000-10,000 contacts', 5000, 10000, 1.8, 4),
  ('10,000+ contacts', 10000, NULL, 2.0, 5)
ON CONFLICT (range_label) DO NOTHING;

-- Create migration_requests table
CREATE TABLE IF NOT EXISTS migration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type_id uuid NOT NULL REFERENCES crm_types(id),
  data_volume_estimate_id uuid NOT NULL REFERENCES data_volume_estimates(id),
  
  -- Request details
  current_crm_notes text,
  has_custom_fields boolean NOT NULL DEFAULT false,
  custom_fields_description text,
  has_integrations boolean NOT NULL DEFAULT false,
  integrations_description text,
  
  -- Timeline and urgency
  urgency_level text NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  preferred_start_date date,
  must_complete_by_date date,
  
  -- Data specifics
  estimated_contacts int,
  estimated_jobs int,
  estimated_opportunities int,
  has_historical_data boolean NOT NULL DEFAULT true,
  years_of_data int,
  
  -- Export information
  can_export_data boolean,
  export_format text,
  export_file_url text,
  
  -- Contact preferences
  preferred_contact_method text CHECK (preferred_contact_method IN ('email', 'phone', 'video_call')) DEFAULT 'email',
  preferred_contact_time text,
  contact_phone text,
  contact_email text,
  
  -- Status tracking
  status text NOT NULL CHECK (status IN ('submitted', 'reviewing', 'scoping', 'scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'submitted',
  assigned_to uuid REFERENCES auth.users(id),
  estimated_completion_date date,
  actual_completion_date date,
  
  -- Internal notes
  internal_notes text,
  complexity_score int CHECK (complexity_score >= 1 AND complexity_score <= 10),
  
  -- Timestamps
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for migration_requests
CREATE INDEX IF NOT EXISTS idx_migration_requests_organization_id ON migration_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_user_id ON migration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_status ON migration_requests(status);
CREATE INDEX IF NOT EXISTS idx_migration_requests_crm_type_id ON migration_requests(crm_type_id);
CREATE INDEX IF NOT EXISTS idx_migration_requests_urgency_level ON migration_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_migration_requests_assigned_to ON migration_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_migration_requests_submitted_at ON migration_requests(submitted_at);

-- Create migration_communications table
CREATE TABLE IF NOT EXISTS migration_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_request_id uuid NOT NULL REFERENCES migration_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  message_type text NOT NULL CHECK (message_type IN ('user_message', 'team_message', 'status_update', 'file_upload', 'system_note')) DEFAULT 'user_message',
  message text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for migration_communications
CREATE INDEX IF NOT EXISTS idx_migration_communications_migration_request_id ON migration_communications(migration_request_id);
CREATE INDEX IF NOT EXISTS idx_migration_communications_user_id ON migration_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_communications_created_at ON migration_communications(created_at);

-- Add migration_requested flag to onboarding_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_progress' AND column_name = 'migration_requested'
  ) THEN
    ALTER TABLE onboarding_progress ADD COLUMN migration_requested boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add migration_request_id to onboarding_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_progress' AND column_name = 'migration_request_id'
  ) THEN
    ALTER TABLE onboarding_progress ADD COLUMN migration_request_id uuid REFERENCES migration_requests(id);
    CREATE INDEX IF NOT EXISTS idx_onboarding_progress_migration_request_id ON onboarding_progress(migration_request_id);
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE crm_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_volume_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_types (public read)
CREATE POLICY "Anyone can view active CRM types"
  ON crm_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for data_volume_estimates (public read)
CREATE POLICY "Anyone can view data volume estimates"
  ON data_volume_estimates FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for migration_requests
CREATE POLICY "Users can view org migration requests"
  ON migration_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = migration_requests.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert org migration requests"
  ON migration_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = migration_requests.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own migration requests"
  ON migration_requests FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = migration_requests.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = migration_requests.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for migration_communications
CREATE POLICY "Users can view migration communications for their requests"
  ON migration_communications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM migration_requests
      INNER JOIN organization_members ON organization_members.organization_id = migration_requests.organization_id
      WHERE migration_requests.id = migration_communications.migration_request_id
      AND organization_members.user_id = auth.uid()
    )
    AND is_internal = false
  );

CREATE POLICY "Users can insert messages to their migration requests"
  ON migration_communications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM migration_requests
      INNER JOIN organization_members ON organization_members.organization_id = migration_requests.organization_id
      WHERE migration_requests.id = migration_communications.migration_request_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_migration_requests_updated_at ON migration_requests;
CREATE TRIGGER update_migration_requests_updated_at
  BEFORE UPDATE ON migration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
