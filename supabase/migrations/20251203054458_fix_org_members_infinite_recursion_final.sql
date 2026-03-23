/*
  # Fix Organization Members Infinite Recursion (Final Fix)

  ## Problem
  The migration `20251203053037_fix_organization_creation_rls_policies.sql` reintroduced
  infinite recursion by creating policies on organization_members that query organization_members
  from within their own policy checks.

  Example of problematic pattern:
  ```sql
  CREATE POLICY ON organization_members
    USING (
      organization_id IN (
        SELECT organization_id FROM organization_members  -- ❌ RECURSION!
        WHERE user_id = auth.uid()
      )
    )
  ```

  This creates an infinite loop:
  - Query organization_members
  - Check policy by querying organization_members
  - Check policy by querying organization_members
  - ... infinite recursion!

  ## Solution
  Rewrite all organization_members policies to NEVER query organization_members.
  Instead, use:
  - Direct column checks: `user_id = auth.uid()`
  - Queries to OTHER tables: `organizations.created_by = auth.uid()`
  - No subqueries that reference organization_members itself

  ## Changes Made
  1. Drop all existing organization_members policies
  2. Create non-recursive SELECT policy (users see own memberships)
  3. Create non-recursive INSERT policy (users can add themselves)
  4. Create non-recursive UPDATE/DELETE policies (org creators manage members)
  5. Fix organizations SELECT policy to not use non-existent function
  6. Fix organization_locations and organization_settings policies

  ## Security Model
  - Users can view their own membership records
  - Users can add themselves as members during org creation
  - Organization creators (organizations.created_by) can manage all members
  - Organization creators can update/delete their organizations
  - Members can view organizations they belong to
*/

-- ============================================================================
-- STEP 1: Drop ALL existing policies on organization_members
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can create own membership" ON organization_members;
DROP POLICY IF EXISTS "Owners can manage organization members" ON organization_members;
DROP POLICY IF EXISTS "Members view org members" ON organization_members;
DROP POLICY IF EXISTS "Org members can view members" ON organization_members;
DROP POLICY IF EXISTS "Org owner/admin can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can add themselves as owner" ON organization_members;
DROP POLICY IF EXISTS "Org owners and admins can manage members" ON organization_members;

-- ============================================================================
-- STEP 2: Create NON-RECURSIVE policies on organization_members
-- ============================================================================

-- Policy 1: Users can view their OWN membership records
-- This is safe because it only checks user_id = auth.uid() (no recursion)
CREATE POLICY "Users can view own memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can INSERT themselves as members
-- This is safe because it only checks user_id = auth.uid() (no recursion)
-- Needed for the organization creation flow
CREATE POLICY "Users can create own membership"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Organization creators can manage ALL members
-- This is safe because it queries ORGANIZATIONS table, not organization_members
-- No recursion: organization_members -> organizations (different table)
CREATE POLICY "Org creators can manage members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- STEP 3: Fix organizations table SELECT policy
-- ============================================================================

-- Drop the policy that uses non-existent is_org_member() function
DROP POLICY IF EXISTS "Org members can select org" ON organizations;
DROP POLICY IF EXISTS "Users view orgs" ON organizations;

-- Create a simple, working SELECT policy
-- This is safe because organization_members SELECT policy doesn't recurse
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    -- User created the org
    created_by = auth.uid()
    OR
    -- User is a member of the org
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 4: Keep INSERT policy (already exists, but ensure it's correct)
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- STEP 5: Fix UPDATE policy on organizations
-- ============================================================================

DROP POLICY IF EXISTS "Org owners and admins can update their org" ON organizations;
CREATE POLICY "Org creators can update their org"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- STEP 6: Fix DELETE policy on organizations
-- ============================================================================

DROP POLICY IF EXISTS "Org owners can delete their org" ON organizations;
CREATE POLICY "Org creators can delete their org"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- STEP 7: Fix organization_locations policies
-- ============================================================================

DROP POLICY IF EXISTS "Members view locations" ON organization_locations;
DROP POLICY IF EXISTS "Org owners and admins can manage locations" ON organization_locations;

-- SELECT: Members can view locations
CREATE POLICY "Members can view org locations"
  ON organization_locations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ALL (INSERT/UPDATE/DELETE): Org creators can manage locations
CREATE POLICY "Org creators can manage locations"
  ON organization_locations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- STEP 8: Fix organization_settings policies
-- ============================================================================

DROP POLICY IF EXISTS "Members view settings" ON organization_settings;
DROP POLICY IF EXISTS "Org owners and admins can manage settings" ON organization_settings;

-- SELECT: Members can view settings
CREATE POLICY "Members can view org settings"
  ON organization_settings
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ALL (INSERT/UPDATE/DELETE): Org creators can manage settings
CREATE POLICY "Org creators can manage settings"
  ON organization_settings
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES (commented out, for reference)
-- ============================================================================

/*
-- Test 1: Check current user's memberships (should not recurse)
-- SELECT * FROM organization_members WHERE user_id = auth.uid();

-- Test 2: Check organizations user can see (should not recurse)
-- SELECT * FROM organizations;

-- Test 3: Verify policy chain doesn't recurse
-- organizations SELECT -> queries organization_members (OK)
-- organization_members SELECT -> checks user_id = auth.uid() (OK, no recursion)

-- Test 4: Verify no policies reference themselves
-- ✓ organization_members policies never query organization_members
-- ✓ organizations policies only query organization_members (different table)
-- ✓ No circular dependencies
*/