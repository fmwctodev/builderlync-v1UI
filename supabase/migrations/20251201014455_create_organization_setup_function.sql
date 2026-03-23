/*
  # Create Organization Setup Function

  This migration creates a stored procedure that handles the complete organization
  setup process atomically during user signup. This eliminates RLS complexity
  and ensures all-or-nothing creation.

  ## Function Created
  
  **setup_new_organization()**
  - Creates organization
  - Links user as owner
  - Creates initial onboarding_progress record
  - Runs with elevated privileges (SECURITY DEFINER)
  - Returns organization_id on success
  - Atomic transaction (all or nothing)

  ## Benefits
  - Bypasses RLS issues during signup
  - Ensures data consistency
  - Simpler error handling
  - Single point of failure vs multiple queries
*/

-- Create the organization setup function
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

  -- Link user to organization as owner
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    status
  )
  VALUES (
    v_organization_id,
    p_user_id,
    'owner',
    'active'
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION setup_new_organization(uuid, text, text) TO authenticated;