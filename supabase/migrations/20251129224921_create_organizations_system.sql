/*
  # Create Organizations System

  1. New Tables
    - organizations - Company/business information
    - organization_members - User-to-organization mapping
    - organization_locations - Multi-location support
    - organization_settings - Organization preferences

  2. Security
    - Enable RLS on all tables
    - Organization-based isolation
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  display_name text,
  slug text UNIQUE,
  email text,
  phone text,
  website text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  logo_url text,
  logo_square_url text,
  favicon_url text,
  primary_color text DEFAULT '#dc2626',
  industry text,
  business_type text,
  tax_id text,
  license_number text,
  timezone text DEFAULT 'America/New_York',
  currency text DEFAULT 'USD',
  date_format text DEFAULT 'MM/DD/YYYY',
  time_format text DEFAULT '12h',
  language text DEFAULT 'en',
  enabled_modules jsonb DEFAULT '[]'::jsonb,
  feature_flags jsonb DEFAULT '{}'::jsonb,
  subscription_status text DEFAULT 'trial',
  trial_ends_at timestamptz,
  max_users integer DEFAULT 5,
  max_locations integer DEFAULT 1,
  storage_limit_gb integer DEFAULT 10,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  status text DEFAULT 'active',
  invitation_token text UNIQUE,
  invitation_expires_at timestamptz,
  custom_permissions jsonb DEFAULT '{}'::jsonb,
  joined_at timestamptz DEFAULT now(),
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  location_code text,
  email text,
  phone text,
  fax text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'US',
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  timezone text,
  hours_of_operation jsonb DEFAULT '{}'::jsonb,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  allow_duplicate_contacts boolean DEFAULT false,
  contact_auto_tagging boolean DEFAULT true,
  contact_merge_suggestions boolean DEFAULT true,
  job_number_prefix text DEFAULT 'JOB',
  job_number_format text DEFAULT 'PREFIX-NNNNNN',
  auto_create_job_tasks boolean DEFAULT true,
  require_job_approval boolean DEFAULT false,
  opportunity_auto_create boolean DEFAULT true,
  opportunity_aging_days integer DEFAULT 30,
  default_appointment_duration integer DEFAULT 60,
  appointment_buffer_minutes integer DEFAULT 15,
  business_hours_start time DEFAULT '09:00',
  business_hours_end time DEFAULT '17:00',
  working_days integer[] DEFAULT ARRAY[1,2,3,4,5],
  email_signature text,
  sms_signature text,
  auto_respond_enabled boolean DEFAULT false,
  auto_respond_message text,
  notify_new_contact boolean DEFAULT true,
  notify_new_opportunity boolean DEFAULT true,
  notify_new_job boolean DEFAULT true,
  notify_task_assigned boolean DEFAULT true,
  notification_email text,
  require_2fa boolean DEFAULT false,
  session_timeout_minutes integer DEFAULT 480,
  password_expiry_days integer DEFAULT 90,
  allowed_ip_addresses text[],
  data_retention_days integer DEFAULT 2555,
  auto_delete_old_data boolean DEFAULT false,
  integration_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_organization ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_locations_organization ON organization_locations(organization_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view orgs" ON organizations FOR SELECT TO authenticated
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Members view org members" ON organization_members FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Members view locations" ON organization_locations FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Members view settings" ON organization_settings FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
