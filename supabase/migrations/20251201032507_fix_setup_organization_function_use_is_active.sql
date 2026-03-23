/*
  # Fix setup_new_organization Function to Use is_active

  The organization_members table uses `is_active` (boolean) instead of `status` (text).
  This migration updates the RPC function to match the actual schema.

  ## Changes
  - Replace `status` column reference with `is_active`
  - Change value from 'active' (text) to true (boolean)
  - Function now matches the actual table schema
*/

-- Drop and recreate the function with correct column
CREATE OR REPLACE FUNCTION setup_new_organization(
  p_user_id uuid,
  p_org_name text,
  p_org_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_organization_id uuid;
BEGIN
  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    created_by,
    subscription_status,
    onboarding_completed
  )
  VALUES (
    p_org_name,
    p_org_slug,
    p_user_id,
    'pending_payment',
    false
  )
  RETURNING id INTO v_organization_id;

  -- Link user to organization as owner (using is_active instead of status)
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    is_active
  )
  VALUES (
    v_organization_id,
    p_user_id,
    'owner',
    true
  );

  -- Create initial onboarding progress
  INSERT INTO onboarding_progress (
    user_id,
    organization_id,
    current_step,
    total_steps,
    onboarding_score,
    is_complete,
    completed_steps,
    milestones_completed
  )
  VALUES (
    p_user_id,
    v_organization_id,
    1,
    10,
    0,
    false,
    '[]'::jsonb,
    '[]'::jsonb
  );

  -- Return the organization ID
  RETURN v_organization_id;
END;
$$;

-- Ensure execute permission is granted
GRANT EXECUTE ON FUNCTION setup_new_organization(uuid, text, text) TO authenticated;