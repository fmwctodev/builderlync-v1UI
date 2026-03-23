/*
  # Fix get_onboarding_completion Function - Drop and Recreate

  ## Problem
  The get_onboarding_completion function references tables that may not exist.
  Need to drop and recreate with proper table existence checks.

  ## Changes
  - Drop existing function
  - Recreate with table existence checks
  - Handle missing tables gracefully

  ## Security
  - SECURITY DEFINER maintained
*/

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_onboarding_completion(uuid);

-- Recreate with table checks
CREATE OR REPLACE FUNCTION get_onboarding_completion(org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  has_integrations boolean;
  has_team boolean;
  has_branding boolean;
BEGIN
  -- Check if tables exist
  has_integrations := EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'integrations'
  );
  
  has_team := EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'organization_members'
  );
  
  has_branding := EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'brand_settings'
  );

  -- Build result object based on what exists
  result := jsonb_build_object(
    'has_integrations', CASE WHEN has_integrations THEN 
      EXISTS (SELECT 1 FROM integrations WHERE organization_id = org_id LIMIT 1)
    ELSE false END,
    'has_team', CASE WHEN has_team THEN
      EXISTS (SELECT 1 FROM organization_members WHERE organization_id = org_id AND role != 'owner' LIMIT 1)
    ELSE false END,
    'has_branding', CASE WHEN has_branding THEN
      EXISTS (SELECT 1 FROM brand_settings WHERE organization_id = org_id LIMIT 1)
    ELSE false END
  );

  RETURN result;
END;
$$;