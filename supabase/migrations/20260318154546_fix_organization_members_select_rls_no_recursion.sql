
/*
  # Fix organization_members SELECT RLS — eliminate self-referential recursion

  ## Problem
  The existing SELECT policy contained a subquery that reads from `organization_members`
  itself to check org membership. This caused a recursive policy evaluation that silently
  returned no rows, so `useReputationPermissions` always got `member = null` → no access.

  ## Fix
  Replace the recursive policy with a simpler, non-recursive version that:
  1. Allows a user to always read their OWN rows (`user_id = auth.uid()`).
  2. Allows org owners/admins to read all members of their orgs — but sourced from
     `user_organizations` (no recursion) rather than `organization_members`.
  3. Allows super admins full access.
*/

DROP POLICY IF EXISTS "org_members_select_policy" ON organization_members;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
DROP POLICY IF EXISTS "organization_members_select" ON organization_members;

CREATE POLICY "org_members_select_policy"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
