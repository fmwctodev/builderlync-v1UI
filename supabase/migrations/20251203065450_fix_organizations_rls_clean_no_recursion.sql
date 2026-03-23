/*
  # Clean Fix for Organizations RLS - No Recursion
  
  ## Problem
  Infinite recursion error when loading organizations due to circular policy dependencies.
  
  ## Solution
  1. Drop all existing policies
  2. Create minimal non-circular policies:
     - organization_members SELECT: Only checks user_id (no org query)
     - organizations SELECT: Can check members (one-way dependency)
  
  ## Key Principle
  The recursion breaks because organization_members SELECT policy
  does NOT query the organizations table.
*/

-- ============================================================================
-- Drop ALL existing policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
DROP POLICY IF EXISTS "Org creators can manage members" ON organization_members;
DROP POLICY IF EXISTS "Org creators can insert members" ON organization_members;
DROP POLICY IF EXISTS "Org creators can update members" ON organization_members;
DROP POLICY IF EXISTS "Org creators can delete members" ON organization_members;
DROP POLICY IF EXISTS "Super admins can view all memberships" ON organization_members;
DROP POLICY IF EXISTS "Super admins can manage all memberships" ON organization_members;
DROP POLICY IF EXISTS "org_members_super_admin_all" ON organization_members;

DROP POLICY IF EXISTS "Users view orgs" ON organizations;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
DROP POLICY IF EXISTS "orgs_super_admin_all" ON organizations;

-- ============================================================================
-- organization_members policies (NO circular dependencies)
-- ============================================================================

-- SELECT: Simple user_id check - NO organization table query
CREATE POLICY "members_select"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Org creators can add members
CREATE POLICY "members_insert"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- UPDATE: Org creators can update members
CREATE POLICY "members_update"
  ON organization_members
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- DELETE: Org creators can remove members
CREATE POLICY "members_delete"
  ON organization_members
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- organizations policies (one-way dependency to members)
-- ============================================================================

-- SELECT: See orgs you created or are a member of
CREATE POLICY "orgs_select"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.is_active = true
    )
  );

-- INSERT: Anyone can create an organization
CREATE POLICY "orgs_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Only creators can update
CREATE POLICY "orgs_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Only creators can delete
CREATE POLICY "orgs_delete"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
