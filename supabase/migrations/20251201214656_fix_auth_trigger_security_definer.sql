/*
  # Fix Authentication Trigger Security Issues

  ## Problem
  User authentication fails with "Database error granting user" because:
  - The `calculate_user_status` function lacks SECURITY DEFINER
  - The trigger fires during signup when no auth context exists
  - RLS policies block the trigger from writing to platform_users

  ## Changes
  1. Add SECURITY DEFINER to calculate_user_status function
  2. Add error handling to sync function to prevent auth failures
  3. Make the sync operation non-blocking (catch and log errors)

  ## Security
  - All functions already have appropriate access controls
  - SECURITY DEFINER is needed for system-level operations during auth
*/

-- Fix calculate_user_status to have SECURITY DEFINER
CREATE OR REPLACE FUNCTION calculate_user_status(is_active_member boolean, last_sign_in timestamp with time zone)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If member is not active, they're disabled
  IF NOT is_active_member THEN
    RETURN 'disabled';
  END IF;

  -- If never logged in, they're invited
  IF last_sign_in IS NULL THEN
    RETURN 'invited';
  END IF;

  -- If logged in within 90 days, they're active
  IF last_sign_in > NOW() - INTERVAL '90 days' THEN
    RETURN 'active';
  END IF;

  -- Otherwise they're inactive
  RETURN 'inactive';
END;
$$;

-- Update sync function to handle errors gracefully and not block auth
CREATE OR REPLACE FUNCTION sync_organization_member_to_platform_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_record RECORD;
  enterprise_account_id uuid;
  platform_role_id uuid;
  user_status text;
  user_full_name text;
  org_name text;
BEGIN
  -- Wrap everything in an exception handler to prevent blocking auth
  BEGIN
    -- On DELETE, remove platform_user
    IF TG_OP = 'DELETE' THEN
      DELETE FROM platform_users
      WHERE user_id = OLD.user_id
      AND metadata->>'organization_id' = OLD.organization_id::text;
      RETURN OLD;
    END IF;

    -- Get enterprise account ID from organization
    SELECT o.enterprise_account_id, o.name
    INTO enterprise_account_id, org_name
    FROM organizations o
    WHERE o.id = NEW.organization_id;

    -- Skip if no enterprise account
    IF enterprise_account_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Get auth user data
    SELECT
      id,
      email,
      last_sign_in_at,
      created_at,
      raw_user_meta_data
    INTO auth_user_record
    FROM auth.users
    WHERE id = NEW.user_id;

    -- Skip if auth user not found (might be in process of being created)
    IF auth_user_record.id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Map role
    platform_role_id := map_organization_role_to_platform_role(NEW.role);

    -- Calculate status
    user_status := calculate_user_status(NEW.is_active, auth_user_record.last_sign_in_at);

    -- Get full name
    user_full_name := get_user_full_name(NEW.user_id);

    -- Upsert platform_user
    INSERT INTO platform_users (
      user_id,
      account_id,
      email,
      full_name,
      status,
      role_id,
      last_login_at,
      created_at,
      updated_at,
      metadata
    ) VALUES (
      NEW.user_id,
      enterprise_account_id,
      auth_user_record.email,
      user_full_name,
      user_status,
      platform_role_id,
      auth_user_record.last_sign_in_at,
      NEW.created_at,
      NOW(),
      jsonb_build_object(
        'organization_id', NEW.organization_id,
        'organization_name', org_name,
        'organization_role', NEW.role,
        'synced_from', 'organization_members',
        'synced_at', NOW()
      )
    )
    ON CONFLICT (user_id, account_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      status = EXCLUDED.status,
      role_id = EXCLUDED.role_id,
      last_login_at = EXCLUDED.last_login_at,
      updated_at = NOW(),
      metadata = EXCLUDED.metadata;

  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't block the auth operation
    RAISE WARNING 'Failed to sync organization member to platform user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    -- Return NEW to allow the organization_member insert to succeed
  END;

  RETURN NEW;
END;
$$;