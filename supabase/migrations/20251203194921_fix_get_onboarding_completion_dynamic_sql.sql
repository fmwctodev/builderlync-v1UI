/*
  # Fix get_onboarding_completion with Dynamic SQL

  ## Problem
  Static SQL references tables that don't exist. Need to use dynamic SQL.

  ## Changes
  - Use EXECUTE for dynamic SQL queries
  - Only query tables that actually exist

  ## Security
  - SECURITY DEFINER maintained
*/

DROP FUNCTION IF EXISTS get_onboarding_completion(uuid);

CREATE OR REPLACE FUNCTION get_onboarding_completion(org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  has_integrations_data boolean := false;
  has_team_data boolean := false;
  has_branding_data boolean := false;
BEGIN
  -- Check integrations table and data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'integrations') THEN
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM integrations WHERE organization_id = $1 LIMIT 1)')
    INTO has_integrations_data
    USING org_id;
  END IF;
  
  -- Check organization_members for team
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_members') THEN
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM organization_members WHERE organization_id = $1 AND role != ''owner'' LIMIT 1)')
    INTO has_team_data
    USING org_id;
  END IF;
  
  -- Check brand_settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brand_settings') THEN
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM brand_settings WHERE organization_id = $1 LIMIT 1)')
    INTO has_branding_data
    USING org_id;
  END IF;

  -- Build result object
  result := jsonb_build_object(
    'has_integrations', has_integrations_data,
    'has_team', has_team_data,
    'has_branding', has_branding_data
  );

  RETURN result;
END;
$$;