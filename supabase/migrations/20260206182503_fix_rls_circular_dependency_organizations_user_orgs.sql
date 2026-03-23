/*
  # Fix RLS Circular Dependency Between organizations and user_organizations

  1. Problem
    - organizations SELECT policy checks user_organizations table
    - user_organizations "Organization owners can manage members" policy checks organizations table
    - This creates infinite recursion when trying to create an organization

  2. Solution
    - Simplify user_organizations SELECT policy to ONLY check user_id (no organization query)
    - Keep organizations SELECT policy checking user_organizations (one-way dependency)
    - This breaks the circular dependency cycle

  3. Security
    - Users can still only see their own memberships
    - Organization creators can still manage members via other policies
    - No security is compromised, only the policy logic is simplified
*/

-- ============================================================================
-- Drop problematic user_organizations policies
-- ============================================================================

DROP POLICY IF EXISTS "Organization owners can manage members" ON user_organizations;
DROP POLICY IF EXISTS "Users can view own memberships" ON user_organizations;
DROP POLICY IF EXISTS "Users can create own membership" ON user_organizations;

-- ============================================================================
-- Create new user_organizations policies WITHOUT circular dependency
-- ============================================================================

-- SELECT: Simple user_id check - NO organizations table query
-- This breaks the circular dependency
CREATE POLICY "user_orgs_select"
  ON user_organizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Users can create their own membership
CREATE POLICY "user_orgs_insert_own"
  ON user_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- INSERT: Organization creators can add any members
CREATE POLICY "user_orgs_insert_by_creator"
  ON user_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = user_organizations.organization_id 
        AND organizations.created_by = auth.uid()
    )
  );

-- UPDATE: Organization creators can update members
CREATE POLICY "user_orgs_update"
  ON user_organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = user_organizations.organization_id 
        AND organizations.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = user_organizations.organization_id 
        AND organizations.created_by = auth.uid()
    )
  );

-- DELETE: Organization creators can delete members
CREATE POLICY "user_orgs_delete"
  ON user_organizations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = user_organizations.organization_id 
        AND organizations.created_by = auth.uid()
    )
  );
