/*
  # Fix Auth Triggers to Handle Missing Organization Members

  ## Problem
  Users can exist in auth.users without organization_members records (during signup/migration).
  When they sign in, triggers fire that expect organization_members to exist, causing errors.

  ## Root Cause
  - `sync_auth_user_to_platform_users` trigger runs on auth.users UPDATE
  - It loops through organization_members for the user
  - If no org_members exist, the loop is empty but UPDATE still tries to run
  - This causes "Database error granting user" 500 error

  ## Solution
  1. Wrap trigger logic in exception handlers
  2. Only process if organization_members exist
  3. Skip gracefully if data isn't ready yet
  4. Allow auth to complete even if sync fails

  ## Security
  - Maintains SECURITY DEFINER for system operations
  - No changes to permissions or RLS
  - Only adds error handling
*/

-- Fix sync_auth_user_to_platform_users to handle missing data gracefully
CREATE OR REPLACE FUNCTION sync_auth_user_to_platform_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
  has_members boolean := false;
BEGIN
  -- Wrap in exception handler to prevent blocking auth
  BEGIN
    -- Only process if last_sign_in_at changed
    IF TG_OP = 'UPDATE' AND (
      OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at OR
      OLD.email IS DISTINCT FROM NEW.email OR
      OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
    ) THEN
      
      -- Check if user has any organization_members records
      SELECT EXISTS(
        SELECT 1 FROM organization_members WHERE user_id = NEW.id
      ) INTO has_members;
      
      -- Only process if user has organization memberships
      IF has_members THEN
        -- Update all platform_users for this auth user
        FOR member_record IN
          SELECT
            om.user_id,
            om.organization_id,
            om.is_active,
            o.enterprise_account_id
          FROM organization_members om
          JOIN organizations o ON om.organization_id = o.id
          WHERE om.user_id = NEW.id
          AND o.enterprise_account_id IS NOT NULL
        LOOP
          -- Try to update, skip if platform_user doesn't exist yet
          UPDATE platform_users
          SET
            email = NEW.email,
            full_name = get_user_full_name(NEW.id),
            last_login_at = NEW.last_sign_in_at,
            status = calculate_user_status(member_record.is_active, NEW.last_sign_in_at),
            updated_at = NOW()
          WHERE user_id = NEW.id
          AND account_id = member_record.enterprise_account_id;
          
          -- Note: If no rows updated, that's OK - record will be created later
        END LOOP;
      END IF;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't block auth
    RAISE WARNING 'Failed to sync auth user to platform users: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

-- Fix trigger_update_enterprise_account_last_login to handle missing data gracefully  
CREATE OR REPLACE FUNCTION trigger_update_enterprise_account_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_max_login timestamptz;
  has_orgs boolean := false;
BEGIN
  -- Wrap in exception handler to prevent blocking auth
  BEGIN
    -- Check if user has any organization memberships
    SELECT EXISTS(
      SELECT 1 FROM organization_members WHERE user_id = NEW.id
    ) INTO has_orgs;
    
    -- Only process if user has organizations
    IF has_orgs THEN
      -- Get organization IDs for this user
      FOR v_org_id IN
        SELECT organization_id
        FROM organization_members
        WHERE user_id = NEW.id
      LOOP
        -- Get max last_sign_in_at for all members
        SELECT MAX(u.last_sign_in_at) INTO v_max_login
        FROM organization_members om
        JOIN auth.users u ON u.id = om.user_id
        WHERE om.organization_id = v_org_id;

        -- Update enterprise account if it exists
        UPDATE enterprise_accounts
        SET
          last_login_at = v_max_login,
          updated_at = NOW()
        WHERE organization_id = v_org_id;
        
        -- Note: If no rows updated, that's OK - account will be created later
      END LOOP;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't block auth
    RAISE WARNING 'Failed to update enterprise account last login: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;