/*
  # Comprehensive Database Setup for BuilderLynk
  
  This migration sets up the complete database schema including:
  - Organizations system
  - User management
  - CRM (Contacts, Opportunities, Jobs)
  - Calendars & Appointments
  - Communications
  - Files & Documents
  - Brand Board
  - And all essential tables and functions
  
  ## Security
  - RLS enabled on all tables
  - Policies ensure organization-based data isolation
*/

-- ============================================================================
-- CORE: Organizations System
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  legal_name text,
  display_name text,
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
  primary_color text DEFAULT '#dc2626',
  industry text,
  timezone text DEFAULT 'America/New_York',
  enabled_modules jsonb DEFAULT '[]'::jsonb,
  subscription_status text DEFAULT 'trial',
  subscription_tier text DEFAULT 'starter',
  selected_plan text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org ON user_organizations(organization_id);

-- ============================================================================
-- CRM: Contacts
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  mobile_phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  company_name text,
  job_title text,
  source text,
  status text DEFAULT 'active',
  notes text,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- ============================================================================
-- CRM: Opportunities & Pipelines
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  job_type text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  stages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id uuid REFERENCES pipelines(id),
  contact_id uuid REFERENCES contacts(id),
  name text NOT NULL,
  stage text,
  value numeric(12,2),
  probability integer DEFAULT 0,
  expected_close_date date,
  property_address text,
  status text DEFAULT 'active',
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline ON opportunities(pipeline_id);

-- ============================================================================
-- Calendar & Appointments
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  status text DEFAULT 'scheduled',
  type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contact ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_time);

-- ============================================================================
-- Jobs & Tasks
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  job_number text,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  job_type text,
  property_address text,
  scheduled_start date,
  scheduled_end date,
  actual_start date,
  actual_end date,
  total_value numeric(12,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_org ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_tasks_org ON job_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_tasks_job ON job_tasks(job_id);

-- ============================================================================
-- Proposals & Invoices
-- ============================================================================

CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  proposal_number text,
  title text NOT NULL,
  status text DEFAULT 'draft',
  total_amount numeric(12,2),
  valid_until date,
  terms text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  invoice_number text,
  status text DEFAULT 'draft',
  issue_date date,
  due_date date,
  subtotal numeric(12,2),
  tax numeric(12,2),
  total numeric(12,2),
  paid_amount numeric(12,2) DEFAULT 0,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_org ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);

-- ============================================================================
-- Brand Board
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_boards (
  id SERIAL PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  website text,
  description text,
  brand_voice text,
  target_audience text,
  logo_url text,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  twitter_url text,
  google_business_url text,
  pinterest_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_boards_org ON brand_boards(organization_id);

-- ============================================================================
-- Staff & Roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text,
  is_active boolean DEFAULT true,
  hired_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_org ON staff(organization_id);

-- ============================================================================
-- Files & Documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  folder text,
  uploaded_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_org ON files(organization_id);

-- ============================================================================
-- Communications
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  channel text NOT NULL,
  subject text,
  status text DEFAULT 'active',
  last_message_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id uuid,
  content text NOT NULL,
  channel text,
  direction text,
  status text DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: Organizations
-- ============================================================================

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
        AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can delete organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- RLS Policies: User Organizations
-- ============================================================================

CREATE POLICY "Users can view own memberships"
  ON user_organizations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own membership"
  ON user_organizations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organization owners can manage members"
  ON user_organizations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = user_organizations.organization_id
        AND organizations.created_by = auth.uid()
    )
  );

-- ============================================================================
-- RLS Policies: Organization-scoped tables
-- ============================================================================

-- Helper function for organization membership check
CREATE OR REPLACE FUNCTION user_has_org_access(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_organizations
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contacts
CREATE POLICY "Users can view organization contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create organization contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update organization contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can delete organization contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (user_has_org_access(organization_id));

-- Opportunities
CREATE POLICY "Users can view organization opportunities"
  ON opportunities FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create organization opportunities"
  ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update organization opportunities"
  ON opportunities FOR UPDATE
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can delete organization opportunities"
  ON opportunities FOR DELETE
  TO authenticated
  USING (user_has_org_access(organization_id));

-- Pipelines
CREATE POLICY "Users can view organization pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization pipelines"
  ON pipelines FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Appointments
CREATE POLICY "Users can view organization appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Jobs
CREATE POLICY "Users can view organization jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Job Tasks
CREATE POLICY "Users can view organization job tasks"
  ON job_tasks FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization job tasks"
  ON job_tasks FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Proposals
CREATE POLICY "Users can view organization proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization proposals"
  ON proposals FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Invoices
CREATE POLICY "Users can view organization invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Brand Boards
CREATE POLICY "Users can view organization brand boards"
  ON brand_boards FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization brand boards"
  ON brand_boards FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Staff
CREATE POLICY "Users can view organization staff"
  ON staff FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization staff"
  ON staff FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Files
CREATE POLICY "Users can view organization files"
  ON files FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization files"
  ON files FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Conversations
CREATE POLICY "Users can view organization conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Messages
CREATE POLICY "Users can view organization messages"
  ON messages FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization messages"
  ON messages FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to setup a new organization for a user
CREATE OR REPLACE FUNCTION setup_new_organization(
  p_user_id uuid,
  p_org_name text,
  p_org_slug text
)
RETURNS uuid AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Create organization
  INSERT INTO organizations (name, slug, created_by)
  VALUES (p_org_name, p_org_slug, p_user_id)
  RETURNING id INTO v_org_id;

  -- Add user as organization member
  INSERT INTO user_organizations (user_id, organization_id, role)
  VALUES (p_user_id, v_org_id, 'owner');

  -- Create default pipeline
  INSERT INTO pipelines (organization_id, name, is_default, stages)
  VALUES (
    v_org_id,
    'Sales Pipeline',
    true,
    '[
      {"name": "Lead", "order": 1},
      {"name": "Qualified", "order": 2},
      {"name": "Proposal", "order": 3},
      {"name": "Negotiation", "order": 4},
      {"name": "Closed Won", "order": 5}
    ]'::jsonb
  );

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
