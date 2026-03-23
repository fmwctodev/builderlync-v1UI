/*
  # Remove Duplicate and Recursive Policies on Organizations Table

  ## Problem
  There's an old policy "Org owner/admin can update org" that queries organization_members
  from within the organizations table policy, causing infinite recursion:
  
  organizations SELECT policy -> queries organization_members
  organization_members SELECT policy -> needs to check if you can view it
  -> checks organizations table -> infinite loop!

  ## Solution
  Remove ALL old duplicate policies that cause recursion.
  Keep only the simple, non-recursive policies from our previous migration.

  ## Policies to Remove
  - "Org owner/admin can update org" (queries organization_members - RECURSIVE!)
  - "Users can create org" (duplicate of "Authenticated users can create organizations")

  ## Policies to Keep
  - "Users can view their organizations" (SELECT - queries org_members but safe)
  - "Authenticated users can create organizations" (INSERT - no recursion)
  - "Org creators can update their org" (UPDATE - no recursion)
  - "Org creators can delete their org" (DELETE - no recursion)
  - "Super admins can manage all organizations" (for super admin access)
*/

-- ============================================================================
-- Remove ALL problematic old policies from organizations table
-- ============================================================================

-- Remove the RECURSIVE policy that queries organization_members
DROP POLICY IF EXISTS "Org owner/admin can update org" ON organizations;

-- Remove duplicate INSERT policy
DROP POLICY IF EXISTS "Users can create org" ON organizations;

-- Remove any other old policies that might exist
DROP POLICY IF EXISTS "Org members view org" ON organizations;
DROP POLICY IF EXISTS "Users view their orgs" ON organizations;

-- ============================================================================
-- Verify our good policies are in place (idempotent - safe to re-run)
-- ============================================================================

-- Ensure SELECT policy exists and is correct
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Ensure INSERT policy exists and is correct
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Ensure UPDATE policy exists and is correct (no recursion - only checks created_by)
DROP POLICY IF EXISTS "Org creators can update their org" ON organizations;
CREATE POLICY "Org creators can update their org"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Ensure DELETE policy exists and is correct (no recursion - only checks created_by)
DROP POLICY IF EXISTS "Org creators can delete their org" ON organizations;
CREATE POLICY "Org creators can delete their org"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- Summary of Final Policy Chain (No Recursion)
-- ============================================================================

/*
POLICY CHAIN VERIFICATION:

1. Query: SELECT * FROM organizations
   └─> Policy: "Users can view their organizations"
       ├─> Check: created_by = auth.uid() ✓ (no recursion)
       └─> Check: id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
           └─> Triggers organization_members SELECT policy
               └─> Policy: "Users can view own memberships"
                   └─> Check: user_id = auth.uid() ✓ (no recursion - direct check)

2. Query: UPDATE organizations
   └─> Policy: "Org creators can update their org"
       └─> Check: created_by = auth.uid() ✓ (no recursion)

3. Query: DELETE FROM organizations
   └─> Policy: "Org creators can delete their org"
       └─> Check: created_by = auth.uid() ✓ (no recursion)

✓ NO CIRCULAR REFERENCES
✓ NO INFINITE RECURSION
✓ ALL POLICIES CHECK DIFFERENT TABLES OR USE DIRECT COLUMN CHECKS
*/