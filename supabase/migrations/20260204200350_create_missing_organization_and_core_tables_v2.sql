/*
  # Create Missing Organization and Core Tables (v2)

  This migration creates essential tables that are missing from earlier migrations.
  This version does not use PostGIS geometry types.

  ## Tables Created:
    - `organization_members` - Links users to organizations with roles
    - `pipeline_stages` - Pipeline stage definitions
    - `tasks` - Task management
    - `notes` - Notes for contacts/opportunities
    - `activities` - Activity tracking
    - `companies` - Company records
    - `review_requests` - Review request tracking
    - `reviews` - Customer reviews
    - `credit_transactions` - Credit transaction history
    - `canvass_turfs` - Storm canvassing turfs
    - `canvass_doors` - Individual door records
    - `canvass_visits` - Door visit logs
    - `canvass_leads` - Leads from canvassing
    - `storm_events` - Storm event tracking

  ## Security
    - RLS enabled on all tables
    - Organization-scoped policies
*/

-- ============================================================================
-- ORGANIZATION MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_policy" ON organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT om.organization_id FROM organization_members om WHERE om.user_id = auth.uid() AND om.is_active = true
    )
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "org_members_insert_policy" ON organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.user_id = auth.uid() 
        AND om.role IN ('owner', 'admin')
        AND om.is_active = true
    )
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "org_members_update_policy" ON organization_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.user_id = auth.uid() 
        AND om.role IN ('owner', 'admin')
        AND om.is_active = true
    )
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.user_id = auth.uid() 
        AND om.role IN ('owner', 'admin')
        AND om.is_active = true
    )
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "org_members_delete_policy" ON organization_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.user_id = auth.uid() 
        AND om.role = 'owner'
        AND om.is_active = true
    )
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_org_members_active ON organization_members(is_active);

-- ============================================================================
-- PIPELINE STAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  order_index integer NOT NULL DEFAULT 0,
  is_win_stage boolean DEFAULT false,
  is_loss_stage boolean DEFAULT false,
  probability integer DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  description text,
  auto_tasks jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipeline_stages_select_policy" ON pipeline_stages
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "pipeline_stages_insert_policy" ON pipeline_stages
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "pipeline_stages_update_policy" ON pipeline_stages
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "pipeline_stages_delete_policy" ON pipeline_stages
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON pipeline_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages(order_index);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  completed_at timestamptz,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_policy" ON tasks
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "tasks_insert_policy" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "tasks_update_policy" ON tasks
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "tasks_delete_policy" ON tasks
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_tasks_organization ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ============================================================================
-- NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  content text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  is_pinned boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_policy" ON notes
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "notes_insert_policy" ON notes
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "notes_update_policy" ON notes
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "notes_delete_policy" ON notes
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_notes_organization ON notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_notes_opportunity ON notes(opportunity_id);

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_policy" ON activities
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "activities_insert_policy" ON activities
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "activities_update_policy" ON activities
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "activities_delete_policy" ON activities
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_activities_organization ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  website text,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  logo_url text,
  description text,
  employee_count integer,
  annual_revenue numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select_policy" ON companies
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "companies_insert_policy" ON companies
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "companies_update_policy" ON companies
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "companies_delete_policy" ON companies
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_companies_organization ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- ============================================================================
-- REVIEW REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'email' CHECK (request_type IN ('email', 'sms', 'both')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'clicked', 'completed', 'expired', 'bounced')),
  sent_at timestamptz,
  clicked_at timestamptz,
  completed_at timestamptz,
  platform text,
  review_url text,
  message_template text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_requests_select_policy" ON review_requests
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "review_requests_insert_policy" ON review_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "review_requests_update_policy" ON review_requests
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "review_requests_delete_policy" ON review_requests
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_review_requests_org ON review_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
CREATE INDEX IF NOT EXISTS idx_review_requests_contact ON review_requests(contact_id);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  platform text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  reviewer_name text,
  reviewer_avatar_url text,
  external_review_id text,
  review_url text,
  is_verified boolean DEFAULT false,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  response_text text,
  responded_at timestamptz,
  responded_by uuid REFERENCES auth.users(id),
  published_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_policy" ON reviews
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "reviews_insert_policy" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "reviews_update_policy" ON reviews
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "reviews_delete_policy" ON reviews
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_reviews_org ON reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(published_at DESC);

-- ============================================================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('addition', 'deduction', 'refund', 'expiration')),
  reason text,
  balance_after integer NOT NULL,
  reference_type text,
  reference_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions_select_policy" ON credit_transactions
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "credit_transactions_insert_policy" ON credit_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_credit_transactions_org ON credit_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- ============================================================================
-- STORM EVENTS TABLE (without PostGIS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS storm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  event_type text NOT NULL DEFAULT 'hail' CHECK (event_type IN ('hail', 'wind', 'tornado', 'flood', 'other')),
  event_date date NOT NULL,
  severity text CHECK (severity IN ('minor', 'moderate', 'severe', 'catastrophic')),
  description text,
  center_lat double precision,
  center_lng double precision,
  radius_miles numeric,
  boundary_geojson jsonb,
  source text,
  external_id text,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE storm_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storm_events_select_policy" ON storm_events
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "storm_events_insert_policy" ON storm_events
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "storm_events_update_policy" ON storm_events
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "storm_events_delete_policy" ON storm_events
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_storm_events_org ON storm_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_storm_events_date ON storm_events(event_date);
CREATE INDEX IF NOT EXISTS idx_storm_events_type ON storm_events(event_type);

-- ============================================================================
-- CANVASS TURFS TABLE (without PostGIS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvass_turfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  boundary_geojson jsonb,
  center_lat double precision,
  center_lng double precision,
  color text DEFAULT '#3B82F6',
  assigned_to uuid REFERENCES auth.users(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  priority integer DEFAULT 0,
  estimated_doors integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE canvass_turfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canvass_turfs_select_policy" ON canvass_turfs
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_turfs_insert_policy" ON canvass_turfs
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_turfs_update_policy" ON canvass_turfs
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_turfs_delete_policy" ON canvass_turfs
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_canvass_turfs_org ON canvass_turfs(organization_id);
CREATE INDEX IF NOT EXISTS idx_canvass_turfs_storm ON canvass_turfs(storm_event_id);
CREATE INDEX IF NOT EXISTS idx_canvass_turfs_assigned ON canvass_turfs(assigned_to);

-- ============================================================================
-- CANVASS DOORS TABLE (without PostGIS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvass_doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES canvass_turfs(id) ON DELETE SET NULL,
  address text NOT NULL,
  city text,
  state text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  status text DEFAULT 'not_visited' CHECK (status IN ('not_visited', 'not_home', 'contact_made', 'interested', 'not_interested', 'appointment_set', 'do_not_knock')),
  property_type text,
  roof_type text,
  estimated_age integer,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  last_visited_at timestamptz,
  last_visited_by uuid REFERENCES auth.users(id),
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE canvass_doors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canvass_doors_select_policy" ON canvass_doors
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_doors_insert_policy" ON canvass_doors
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_doors_update_policy" ON canvass_doors
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_doors_delete_policy" ON canvass_doors
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_canvass_doors_org ON canvass_doors(organization_id);
CREATE INDEX IF NOT EXISTS idx_canvass_doors_turf ON canvass_doors(turf_id);
CREATE INDEX IF NOT EXISTS idx_canvass_doors_status ON canvass_doors(status);
CREATE INDEX IF NOT EXISTS idx_canvass_doors_contact ON canvass_doors(contact_id);
CREATE INDEX IF NOT EXISTS idx_canvass_doors_location ON canvass_doors(latitude, longitude);

-- ============================================================================
-- CANVASS VISITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvass_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES canvass_doors(id) ON DELETE CASCADE,
  canvasser_id uuid NOT NULL REFERENCES auth.users(id),
  outcome text NOT NULL CHECK (outcome IN ('not_home', 'contact_made', 'interested', 'not_interested', 'appointment_set', 'do_not_knock', 'callback_requested')),
  notes text,
  callback_date date,
  duration_seconds integer,
  latitude double precision,
  longitude double precision,
  metadata jsonb DEFAULT '{}',
  visited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE canvass_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canvass_visits_select_policy" ON canvass_visits
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_visits_insert_policy" ON canvass_visits
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_canvass_visits_org ON canvass_visits(organization_id);
CREATE INDEX IF NOT EXISTS idx_canvass_visits_door ON canvass_visits(door_id);
CREATE INDEX IF NOT EXISTS idx_canvass_visits_canvasser ON canvass_visits(canvasser_id);
CREATE INDEX IF NOT EXISTS idx_canvass_visits_visited ON canvass_visits(visited_at DESC);

-- ============================================================================
-- CANVASS LEADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvass_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES canvass_turfs(id) ON DELETE SET NULL,
  door_id uuid REFERENCES canvass_doors(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  canvasser_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'appointment_set', 'converted', 'lost')),
  first_name text,
  last_name text,
  phone text,
  email text,
  address text,
  property_type text,
  damage_type text,
  damage_severity text,
  insurance_company text,
  notes text,
  appointment_date timestamptz,
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE canvass_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canvass_leads_select_policy" ON canvass_leads
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
    OR EXISTS (SELECT 1 FROM super_admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_leads_insert_policy" ON canvass_leads
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_leads_update_policy" ON canvass_leads
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "canvass_leads_delete_policy" ON canvass_leads
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_canvass_leads_org ON canvass_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_canvass_leads_turf ON canvass_leads(turf_id);
CREATE INDEX IF NOT EXISTS idx_canvass_leads_status ON canvass_leads(status);
CREATE INDEX IF NOT EXISTS idx_canvass_leads_canvasser ON canvass_leads(canvasser_id);

-- ============================================================================
-- ADD STAGE_ID TO OPPORTUNITIES IF MISSING
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'stage_id'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN stage_id uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage_id);
  END IF;
END $$;

-- ============================================================================
-- ADD COMPANY_ID TO CONTACTS IF MISSING
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
  END IF;
END $$;
