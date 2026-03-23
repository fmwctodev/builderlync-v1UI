/*
  # Create Cleanup Test User Function

  This migration creates a helper function to completely remove a user
  from all tables, useful for testing and development.

  ## Function Created
  
  **cleanup_test_user(p_email text)**
  - Finds user by email in auth.users
  - Deletes from all related tables in correct order
  - Deletes from auth.users
  - Returns number of records deleted
  - SECURITY DEFINER for elevated privileges

  ## WARNING
  This is a DESTRUCTIVE operation and should only be used in development/testing!
*/

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_test_user(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_deleted_counts jsonb := '{}'::jsonb;
  v_count integer;
BEGIN
  -- Find user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found', 'email', p_email);
  END IF;

  -- Delete from onboarding_progress
  DELETE FROM onboarding_progress WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := jsonb_set(v_deleted_counts, '{onboarding_progress}', to_jsonb(v_count));

  -- Delete from organization_members
  DELETE FROM organization_members WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := jsonb_set(v_deleted_counts, '{organization_members}', to_jsonb(v_count));

  -- Delete from user_profiles
  DELETE FROM user_profiles WHERE id = v_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := jsonb_set(v_deleted_counts, '{user_profiles}', to_jsonb(v_count));

  -- Delete from user_dashboard_preferences
  DELETE FROM user_dashboard_preferences WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := jsonb_set(v_deleted_counts, '{user_dashboard_preferences}', to_jsonb(v_count));

  -- Delete organizations created by this user (CASCADE will handle related data)
  DELETE FROM organizations WHERE created_by = v_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := jsonb_set(v_deleted_counts, '{organizations}', to_jsonb(v_count));

  -- Delete from auth.users (this is the critical one!)
  DELETE FROM auth.users WHERE id = v_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := jsonb_set(v_deleted_counts, '{auth_users}', to_jsonb(v_count));

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'deleted_counts', v_deleted_counts
  );
END;
$$;

-- Grant execute to authenticated users (for testing)
GRANT EXECUTE ON FUNCTION cleanup_test_user(text) TO authenticated;

-- Also create a service role version for super admin
COMMENT ON FUNCTION cleanup_test_user(text) IS 'Helper function to completely remove a test user. WARNING: DESTRUCTIVE!';