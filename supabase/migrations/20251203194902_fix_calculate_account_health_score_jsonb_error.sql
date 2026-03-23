/*
  # Fix calculate_account_health_score Function

  ## Problem
  Function tries to multiply jsonb by integer, which is not allowed.
  Need to properly calculate score from jsonb result.

  ## Changes
  - Fix onboarding_score calculation
  - Count completed onboarding items and calculate percentage

  ## Security
  - SECURITY DEFINER maintained
*/

CREATE OR REPLACE FUNCTION calculate_account_health_score(org_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  health_score integer := 0;
  onboarding_data jsonb;
  onboarding_count integer := 0;
BEGIN
  -- Get onboarding completion data
  onboarding_data := get_onboarding_completion(org_id);
  
  -- Count completed onboarding items
  IF (onboarding_data->>'has_integrations')::boolean THEN
    onboarding_count := onboarding_count + 1;
  END IF;
  
  IF (onboarding_data->>'has_team')::boolean THEN
    onboarding_count := onboarding_count + 1;
  END IF;
  
  IF (onboarding_data->>'has_branding')::boolean THEN
    onboarding_count := onboarding_count + 1;
  END IF;
  
  -- Calculate score (out of 100, each item worth ~33 points)
  health_score := (onboarding_count * 33)::integer;
  
  -- Cap at 100
  IF health_score > 100 THEN
    health_score := 100;
  END IF;

  RETURN health_score;
END;
$$;