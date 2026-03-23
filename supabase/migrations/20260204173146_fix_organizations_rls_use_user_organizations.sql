/*
  # Fix Organizations RLS Policies - Use Correct Table

  ## Problem
  RLS policies were referencing non-existent 'organization_members' table
  when the actual table is called 'user_organizations'.

  ## Solution
  1. Drop all existing policies on organizations table
  2. Create new policies using 'user_organizations' table
  3. Allow authenticated users to create organizations

  ## Security
  - Users can only create orgs with their own user_id as created_by
  - Users can view orgs they created or are members of
  - Only creators can update/delete organizations
*/

-- Drop all existing organizations policies
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "orgs_update" ON organizations;
DROP POLICY IF EXISTS "orgs_delete" ON organizations;
DROP POLICY IF EXISTS "orgs_select_policy" ON organizations;
DROP POLICY IF EXISTS "orgs_insert_policy" ON organizations;
DROP POLICY IF EXISTS "orgs_update_policy" ON organizations;
DROP POLICY IF EXISTS "orgs_delete_policy" ON organizations;

-- INSERT: Any authenticated user can create an organization
CREATE POLICY "orgs_insert_policy"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- SELECT: Users can view organizations they created or are members of  
CREATE POLICY "orgs_select_policy"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
        AND user_organizations.user_id = auth.uid()
    )
  );

-- UPDATE: Only organization creators can update
CREATE POLICY "orgs_update_policy"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Only organization creators can delete
CREATE POLICY "orgs_delete_policy"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';
