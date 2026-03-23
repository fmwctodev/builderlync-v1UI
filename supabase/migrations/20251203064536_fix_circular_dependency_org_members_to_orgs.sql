/*
  # Fix Circular Dependency Between Organizations and Organization Members

  ## Critical Problem - Infinite Recursion Loop
  
  Current problematic flow:
  1. SELECT organizations 
     → Policy checks: EXISTS (SELECT FROM organization_members ...)
  2. SELECT organization_members (triggered by step 1)
     → Policy "Org creators can manage members" checks: organization_id IN (SELECT FROM organizations ...)
  3. SELECT organizations (triggered by step 2) 
     → Loop back to step 1 → INFINITE RECURSION!

  ## Root Cause
  The "Org creators can manage members" policy uses FOR ALL with a subquery to organizations.
  This creates a circular dependency when organizations policy queries organization_members.

  ## Solution
  Split the "Org creators can manage members" ALL policy into separate policies:
  - SELECT: Let users see memberships they're part of (no need to query organizations)
  - INSERT/UPDATE/DELETE: Can query organizations (but these aren't triggered during SELECT)

  This breaks the recursion loop because SELECT on organizations → SELECT on organization_members
  won't trigger the policies that query organizations.

  ## Changes
  1. Drop the problematic ALL policy on organization_members
  2. Keep the simple SELECT policy (already exists, checks user_id = auth.uid())
  3. Add INSERT/UPDATE/DELETE policies that can safely query organizations
*/

-- ============================================================================
-- Drop the problematic ALL policy that creates circular dependency
-- ============================================================================

DROP POLICY IF EXISTS "Org creators can manage members" ON organization_members;

-- ============================================================================
-- Create separate, non-circular policies
-- ============================================================================

-- SELECT policy already exists and is correct (no circular dependency)
-- "Users can view own memberships" - only checks user_id = auth.uid()

-- INSERT policy for org creators to add members
DROP POLICY IF EXISTS "Org creators can insert members" ON organization_members;
CREATE POLICY "Org creators can insert members"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  );

-- UPDATE policy for org creators to modify members
DROP POLICY IF EXISTS "Org creators can update members" ON organization_members;
CREATE POLICY "Org creators can update members"
  ON organization_members
  FOR UPDATE
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

-- DELETE policy for org creators to remove members
DROP POLICY IF EXISTS "Org creators can delete members" ON organization_members;
CREATE POLICY "Org creators can delete members"
  ON organization_members
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id
      FROM organizations
      WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- Verify the policy chain is non-circular
-- ============================================================================

/*
  POLICY CHAIN VERIFICATION:

  Query: SELECT * FROM organizations
  └─> Policy: "Users can view their organizations" (SELECT)
      ├─> Check: created_by = auth.uid() ✓ (no recursion)
      └─> Check: EXISTS (SELECT FROM organization_members WHERE ...)
          └─> Triggers: "Users can view own memberships" (SELECT)
              └─> Check: user_id = auth.uid() ✓ (no recursion, no query back to organizations)

  Query: INSERT INTO organization_members
  └─> Policy: "Org creators can insert members" (INSERT)
      └─> Check: organization_id IN (SELECT FROM organizations ...)
          └─> This is safe because INSERT doesn't trigger during SELECT operations

  Query: UPDATE organization_members
  └─> Policy: "Org creators can update members" (UPDATE)
      └─> Check: organization_id IN (SELECT FROM organizations ...)
          └─> This is safe because UPDATE doesn't trigger during SELECT operations

  Query: DELETE FROM organization_members
  └─> Policy: "Org creators can delete members" (DELETE)
      └─> Check: organization_id IN (SELECT FROM organizations ...)
          └─> This is safe because DELETE doesn't trigger during SELECT operations

  ✓ NO CIRCULAR DEPENDENCIES
  ✓ SELECT operations don't cause recursion
  ✓ INSERT/UPDATE/DELETE can safely query other tables
*/
