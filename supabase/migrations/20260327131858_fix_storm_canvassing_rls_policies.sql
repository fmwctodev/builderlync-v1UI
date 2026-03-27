/*
  # Fix Storm Canvassing RLS Policies

  1. Changes
    - Update turfs INSERT policy to default user_id to auth.uid()
    - Update storm_events INSERT policy to default user_id to auth.uid()
    - Update doors INSERT policy to default user_id to auth.uid()
    - Update SELECT policies on turfs, storm_events, doors, turf_assignments,
      canvass_visits to allow org-wide visibility (authenticated users can see
      rows in the same organization_id as any row they own)
    - Update canvass_org_settings to allow org-scoped access

  2. Security
    - INSERT still requires auth.uid() = user_id (ownership)
    - SELECT allows any authenticated user to view rows sharing an organization_id
      with rows they own (org-wide read access)
    - UPDATE/DELETE still require ownership (auth.uid() = user_id)

  3. Important Notes
    - Adds default value for user_id on turfs, storm_events, and doors tables
      so inserts that omit user_id will automatically use auth.uid()
    - Uses a security definer helper function to check org membership
*/

-- Add default value for user_id columns so inserts auto-populate with auth.uid()
ALTER TABLE turfs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE storm_events ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE doors ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Create a helper function to check if a user belongs to an organization
-- by checking if they have any row in canvass_org_settings for that org
CREATE OR REPLACE FUNCTION public.user_belongs_to_storm_org(check_org_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM turfs WHERE user_id = auth.uid() AND organization_id = check_org_id
    UNION ALL
    SELECT 1 FROM storm_events WHERE user_id = auth.uid() AND organization_id = check_org_id
    UNION ALL
    SELECT 1 FROM canvass_org_settings WHERE user_id = auth.uid() AND organization_id = check_org_id
  );
$$;

-- ============================================================
-- TURFS: Fix SELECT to allow org-wide visibility
-- ============================================================
DROP POLICY IF EXISTS "Turfs select own" ON turfs;
CREATE POLICY "Turfs select by org membership"
  ON turfs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR user_belongs_to_storm_org(organization_id)
  );

-- Fix INSERT to work with default user_id
DROP POLICY IF EXISTS "Turfs insert own" ON turfs;
CREATE POLICY "Turfs insert authenticated"
  ON turfs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORM_EVENTS: Fix SELECT to allow org-wide visibility
-- ============================================================
DROP POLICY IF EXISTS "Storm events select own" ON storm_events;
CREATE POLICY "Storm events select by org membership"
  ON storm_events FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR user_belongs_to_storm_org(organization_id)
  );

DROP POLICY IF EXISTS "Storm events insert own" ON storm_events;
CREATE POLICY "Storm events insert authenticated"
  ON storm_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DOORS: Fix SELECT to allow org-wide visibility
-- ============================================================
DROP POLICY IF EXISTS "Doors select own" ON doors;
CREATE POLICY "Doors select by org membership"
  ON doors FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR user_belongs_to_storm_org(organization_id)
  );

DROP POLICY IF EXISTS "Doors insert own" ON doors;
CREATE POLICY "Doors insert authenticated"
  ON doors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TURF_ASSIGNMENTS: Fix SELECT to allow org-wide visibility
-- ============================================================
DROP POLICY IF EXISTS "Turf assignments select own" ON turf_assignments;
CREATE POLICY "Turf assignments select by org membership"
  ON turf_assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR user_belongs_to_storm_org(organization_id)
  );

-- ============================================================
-- CANVASS_VISITS: Fix SELECT to allow org-wide visibility
-- ============================================================
DROP POLICY IF EXISTS "Canvass visits select own" ON canvass_visits;
CREATE POLICY "Canvass visits select by org membership"
  ON canvass_visits FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR user_belongs_to_storm_org(organization_id)
  );

-- ============================================================
-- CANVASS_ORG_SETTINGS: Allow org-scoped access
-- ============================================================
DROP POLICY IF EXISTS "Canvass settings select own" ON canvass_org_settings;
CREATE POLICY "Canvass settings select by org"
  ON canvass_org_settings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR organization_id IN (
      SELECT cos.organization_id FROM canvass_org_settings cos WHERE cos.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Canvass settings update own" ON canvass_org_settings;
CREATE POLICY "Canvass settings update by org"
  ON canvass_org_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
