/*
  # Add Super Admin Bypass Policies for Account Provisioning
  
  1. Problem
    - Super admin users cannot provision enterprise accounts due to RLS policies
    - Most tables check for organization membership, but organization doesn't exist during provisioning
    - Service role key is not available, so admin client is subject to RLS
  
  2. Solution
    - Add permissive policies for super admin users on all provisioning tables
    - Check if user exists in super_admin_users table with active status
    - Allow full access during provisioning workflow
  
  3. Tables Updated
    - organizations: Allow super admins to create/manage orgs
    - organization_members: Allow super admins to create memberships
    - organization_settings: Allow super admins to create settings
    - user_profile_data: Allow super admins to create user profiles
    - user_preferences: Allow super admins to create user preferences
    - dashboard_widgets: Allow super admins to create widgets
    - pipelines: Allow super admins to create pipelines
    - pipeline_stages: Allow super admins to create stages
  
  4. Security
    - Policies only apply to authenticated users in super_admin_users table
    - Status must be 'active'
    - Does not weaken existing organization-scoped policies
*/

-- Helper function to check if current user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admin_users
    WHERE id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
CREATE POLICY "Super admins can manage all organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Organization Members: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all org members" ON organization_members;
CREATE POLICY "Super admins can manage all org members"
  ON organization_members FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Organization Settings: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all org settings" ON organization_settings;
CREATE POLICY "Super admins can manage all org settings"
  ON organization_settings FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- User Profile Data: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all user profiles" ON user_profile_data;
CREATE POLICY "Super admins can manage all user profiles"
  ON user_profile_data FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- User Preferences: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all user prefs" ON user_preferences;
CREATE POLICY "Super admins can manage all user prefs"
  ON user_preferences FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Dashboard Widgets: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all widgets" ON dashboard_widgets;
CREATE POLICY "Super admins can manage all widgets"
  ON dashboard_widgets FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Pipelines: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all pipelines" ON pipelines;
CREATE POLICY "Super admins can manage all pipelines"
  ON pipelines FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Pipeline Stages: Super admin bypass
DROP POLICY IF EXISTS "Super admins can manage all pipeline stages" ON pipeline_stages;
CREATE POLICY "Super admins can manage all pipeline stages"
  ON pipeline_stages FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
