/*
  # Fix Organization RLS Infinite Recursion

  The organizations table has two SELECT policies which can cause conflicts
  and infinite recursion when they both reference organization_members.

  ## Changes
  - Drop duplicate "Users view orgs" policy
  - Keep only "Org members can select org" policy which uses the helper function
  - Simplify to prevent recursion issues

  ## Affected Policies
  - Removes: "Users view orgs" (causes recursion via subquery)
  - Keeps: "Org members can select org" (uses is_org_member function)
*/

-- Drop the problematic policy that has a subquery causing recursion
DROP POLICY IF EXISTS "Users view orgs" ON organizations;

-- Ensure the good policy exists (using the helper function)
DROP POLICY IF EXISTS "Org members can select org" ON organizations;

CREATE POLICY "Org members can select org"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    is_org_member(id) OR (created_by = auth.uid())
  );