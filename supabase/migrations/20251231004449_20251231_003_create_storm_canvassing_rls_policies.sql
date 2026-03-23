/*
  # Create RLS Policies for Storm Canvassing Module

  This migration creates Row Level Security policies for all canvassing tables.

  ## Security Model
  - All tables are scoped to organization_id
  - Users can only access data from organizations they belong to
  - Specific tables have additional restrictions based on role/assignment

  ## Policy Naming Convention
  - Format: "table_action_description"
  - Actions: select, insert, update, delete
*/

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND is_active = true
  );
$$;

-- Helper function to check if user is assigned to a turf
CREATE OR REPLACE FUNCTION user_assigned_to_turf(p_turf_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM turf_assignments
    WHERE turf_id = p_turf_id
    AND user_id = auth.uid()
  );
$$;

-- ============================================
-- STORM EVENTS POLICIES
-- ============================================

CREATE POLICY "storm_events_select_org_members"
  ON storm_events FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "storm_events_insert_org_members"
  ON storm_events FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "storm_events_update_org_members"
  ON storm_events FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "storm_events_delete_org_members"
  ON storm_events FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- STORM LAYERS POLICIES
-- ============================================

CREATE POLICY "storm_layers_select_org_members"
  ON storm_layers FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "storm_layers_insert_org_members"
  ON storm_layers FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "storm_layers_update_org_members"
  ON storm_layers FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "storm_layers_delete_org_members"
  ON storm_layers FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- TURFS POLICIES
-- ============================================

CREATE POLICY "turfs_select_org_members"
  ON turfs FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "turfs_insert_org_members"
  ON turfs FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "turfs_update_org_members"
  ON turfs FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "turfs_delete_org_members"
  ON turfs FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- TURF ASSIGNMENTS POLICIES
-- ============================================

CREATE POLICY "turf_assignments_select_org_members"
  ON turf_assignments FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "turf_assignments_insert_org_members"
  ON turf_assignments FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "turf_assignments_update_org_members"
  ON turf_assignments FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "turf_assignments_delete_org_members"
  ON turf_assignments FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- DOORS POLICIES
-- ============================================

CREATE POLICY "doors_select_org_members"
  ON doors FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "doors_insert_org_members"
  ON doors FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "doors_update_org_members"
  ON doors FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "doors_delete_org_members"
  ON doors FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- CANVASS VISITS POLICIES
-- ============================================

CREATE POLICY "canvass_visits_select_org_members"
  ON canvass_visits FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_visits_insert_org_members"
  ON canvass_visits FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_visits_update_own"
  ON canvass_visits FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id) AND user_id = auth.uid())
  WITH CHECK (user_belongs_to_org(organization_id) AND user_id = auth.uid());

CREATE POLICY "canvass_visits_delete_own"
  ON canvass_visits FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id) AND user_id = auth.uid());

-- ============================================
-- CANVASS MEDIA POLICIES
-- ============================================

CREATE POLICY "canvass_media_select_org_members"
  ON canvass_media FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_media_insert_org_members"
  ON canvass_media FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_media_update_own"
  ON canvass_media FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id) AND user_id = auth.uid())
  WITH CHECK (user_belongs_to_org(organization_id) AND user_id = auth.uid());

CREATE POLICY "canvass_media_delete_own"
  ON canvass_media FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id) AND user_id = auth.uid());

-- ============================================
-- CONTACT REVEALS POLICIES
-- ============================================

CREATE POLICY "contact_reveals_select_org_members"
  ON contact_reveals FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "contact_reveals_insert_org_members"
  ON contact_reveals FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

-- ============================================
-- CREDIT LEDGER POLICIES
-- ============================================

CREATE POLICY "credit_ledger_select_org_members"
  ON credit_ledger FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "credit_ledger_insert_org_members"
  ON credit_ledger FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

-- ============================================
-- CANVASS LEADS POLICIES
-- ============================================

CREATE POLICY "canvass_leads_select_org_members"
  ON canvass_leads FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_leads_insert_org_members"
  ON canvass_leads FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_leads_update_org_members"
  ON canvass_leads FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_leads_delete_org_members"
  ON canvass_leads FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- CANVASS APPOINTMENTS POLICIES
-- ============================================

CREATE POLICY "canvass_appointments_select_org_members"
  ON canvass_appointments FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_appointments_insert_org_members"
  ON canvass_appointments FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_appointments_update_org_members"
  ON canvass_appointments FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_appointments_delete_org_members"
  ON canvass_appointments FOR DELETE
  TO authenticated
  USING (user_belongs_to_org(organization_id));

-- ============================================
-- CANVASS ORG SETTINGS POLICIES
-- ============================================

CREATE POLICY "canvass_org_settings_select_org_members"
  ON canvass_org_settings FOR SELECT
  TO authenticated
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_org_settings_insert_org_members"
  ON canvass_org_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_belongs_to_org(organization_id));

CREATE POLICY "canvass_org_settings_update_org_members"
  ON canvass_org_settings FOR UPDATE
  TO authenticated
  USING (user_belongs_to_org(organization_id))
  WITH CHECK (user_belongs_to_org(organization_id));