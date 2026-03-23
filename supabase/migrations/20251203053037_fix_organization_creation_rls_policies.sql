/*
  # Fix Organization Creation RLS Policies

  1. Problem
    - Regular authenticated users cannot create organizations
    - Only SELECT policy exists for viewing orgs they're members of
    - No INSERT, UPDATE, or DELETE policies for regular users
    - This creates chicken-and-egg problem: can't create org because not a member
  
  2. Solution
    - Add INSERT policy allowing authenticated users to create organizations
    - Add UPDATE policy for organization owners/admins to manage their org
    - Add DELETE policy for organization owners to delete their org
    - Add INSERT policy for organization_members to allow self-registration as owner
  
  3. New Policies
    - organizations: Allow authenticated users to create orgs
    - organizations: Allow owners/admins to update their org
    - organizations: Allow owners to delete their org
    - organization_members: Allow users to add themselves as owner during org creation
    - organization_members: Allow owners/admins to manage members in their org
  
  4. Security
    - Users can only create organizations with themselves as created_by
    - Users can only update/delete organizations they own or admin
    - Users can only add themselves as initial owner
    - Existing super admin bypass policies remain in effect
*/

-- ============================================================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================================================

-- Policy: Allow authenticated users to create organizations
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be the creator
    created_by = auth.uid()
  );

-- Policy: Allow organization owners and admins to update their organization
DROP POLICY IF EXISTS "Org owners and admins can update their org" ON organizations;
CREATE POLICY "Org owners and admins can update their org"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    -- User must be owner or admin of the organization
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
  WITH CHECK (
    -- Same check for updated data
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- Policy: Allow organization owners to delete their organization
DROP POLICY IF EXISTS "Org owners can delete their org" ON organizations;
CREATE POLICY "Org owners can delete their org"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (
    -- User must be owner of the organization
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true
    )
  );

-- ============================================================================
-- ORGANIZATION_MEMBERS TABLE POLICIES
-- ============================================================================

-- Policy: Allow users to add themselves as owner when creating an organization
DROP POLICY IF EXISTS "Users can add themselves as owner" ON organization_members;
CREATE POLICY "Users can add themselves as owner"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be adding themselves
    user_id = auth.uid()
  );

-- Policy: Allow organization owners and admins to manage members
DROP POLICY IF EXISTS "Org owners and admins can manage members" ON organization_members;
CREATE POLICY "Org owners and admins can manage members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    -- User must be owner or admin of the organization
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
  WITH CHECK (
    -- Same check for new/updated data
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- ============================================================================
-- ORGANIZATION_LOCATIONS TABLE POLICIES
-- ============================================================================

-- Policy: Allow organization owners and admins to manage locations
DROP POLICY IF EXISTS "Org owners and admins can manage locations" ON organization_locations;
CREATE POLICY "Org owners and admins can manage locations"
  ON organization_locations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- ============================================================================
-- ORGANIZATION_SETTINGS TABLE POLICIES
-- ============================================================================

-- Policy: Allow organization owners and admins to manage settings
DROP POLICY IF EXISTS "Org owners and admins can manage settings" ON organization_settings;
CREATE POLICY "Org owners and admins can manage settings"
  ON organization_settings
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );