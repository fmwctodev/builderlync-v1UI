/*
  # Fix Organizations RLS Policy Infinite Recursion - Final Solution

  ## Problem
  The current organizations SELECT policy uses `is_organization_member(id)` function.
  This function queries organization_members, which can create complex recursion patterns
  that PostgreSQL detects as infinite recursion (error 42P17).

  The policy chain:
  1. SELECT organizations → calls is_organization_member(id)
  2. is_organization_member() → queries organization_members
  3. organization_members SELECT policy → might need to verify access
  4. This can create circular dependencies in complex scenarios

  ## Solution
  Replace the function call with a direct inline subquery. This is clearer to the
  PostgreSQL query planner and avoids recursion detection issues.

  ## Changes
  1. Drop the existing "Users can view their organizations" policy
  2. Recreate it with an inline subquery instead of function call
  3. Keep all other policies unchanged

  ## Testing
  After applying, test:
  - SELECT * FROM organizations (should work without recursion error)
  - User can see organizations they created
  - User can see organizations they're members of
*/

-- ============================================================================
-- Fix organizations SELECT policy to avoid recursion
-- ============================================================================

-- Drop the problematic policy that uses the function
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

-- Recreate with inline subquery (no function call)
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    -- User created the organization
    created_by = auth.uid()
    OR
    -- User is an active member of the organization
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );

-- ============================================================================
-- Verification: Ensure organization_members policy is non-recursive
-- ============================================================================

-- This policy should already be correct (only checks user_id = auth.uid())
-- But let's ensure it's in place
DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
CREATE POLICY "Users can view own memberships"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- Policy Chain Analysis (No Recursion)
-- ============================================================================

/*
Query Flow:
1. User runs: SELECT * FROM organizations
2. Policy check: "Users can view their organizations"
   ├─> Check: created_by = auth.uid() ✓ (no table access needed)
   └─> Check: id IN (SELECT organization_id FROM organization_members WHERE ...)
       └─> This triggers organization_members SELECT policy
           └─> Policy check: user_id = auth.uid() ✓ (simple column check)
           └─> Returns matching organization_ids
3. organizations query completes with filtered results

✓ NO FUNCTION CALLS
✓ NO CIRCULAR REFERENCES  
✓ SINGLE-DIRECTION DEPENDENCY (organizations → organization_members)
✓ organization_members policy does NOT query organizations
*/
