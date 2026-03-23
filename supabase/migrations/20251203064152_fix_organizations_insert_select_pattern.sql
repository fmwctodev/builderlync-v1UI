/*
  # Fix Organizations INSERT with SELECT Pattern

  ## Problem
  When creating an organization, the code does:
  1. INSERT into organizations (with created_by = auth.uid())
  2. .select().single() - This triggers SELECT policy
  3. Then adds user to organization_members
  
  The SELECT policy checks if user is in organization_members, but at step 2,
  the user hasn't been added yet! This can cause policy evaluation issues.

  ## Solution
  Update the SELECT policy to allow users to see organizations they CREATED
  immediately, without checking organization_members. The organization_members
  check is only needed for non-creators.

  This makes the policy simpler and matches the actual creation flow.

  ## Changes
  1. Simplify the SELECT policy to prioritize created_by check
  2. Make organization_members check optional (only for viewing other orgs)
*/

-- ============================================================================
-- Fix organizations SELECT policy for INSERT + SELECT pattern
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    -- FIRST: Check if user created this organization (no other table lookup needed)
    -- This allows the INSERT + SELECT pattern to work immediately
    created_by = auth.uid()
    OR
    -- SECOND: Check if user is a member (only evaluated if created_by check fails)
    EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.is_active = true
    )
  );

-- ============================================================================
-- Ensure other policies are correct
-- ============================================================================

-- Verify INSERT policy exists and is simple
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Verify organization_members SELECT policy is non-recursive
DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
CREATE POLICY "Users can view own memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

/*
  ## Why This Works

  Flow during organization creation:
  1. INSERT organizations (created_by = 'user-123') 
     → INSERT policy checks: created_by = auth.uid() ✓
  
  2. SELECT from organizations WHERE id = 'new-org-id'
     → SELECT policy checks: created_by = auth.uid() ✓ (returns true immediately)
     → No need to check organization_members yet
  
  3. INSERT into organization_members
     → Happens after SELECT succeeds
  
  4. Future SELECT operations
     → For org creator: created_by check succeeds ✓
     → For org member: EXISTS subquery succeeds ✓
     → For non-member: both checks fail, row not visible ✓

  ✓ NO RECURSION
  ✓ INSERT + SELECT pattern works
  ✓ Proper access control maintained
*/
