/*
  # Add Real-Time Sync Triggers for Platform Users

  ## Overview
  Creates triggers to automatically sync platform_users when source data changes.

  ## Changes

  1. **Organization Member Triggers**
     - Trigger on INSERT: Create new platform_user
     - Trigger on UPDATE: Sync changes to platform_user
     - Trigger on DELETE: Remove platform_user

  2. **Auth Users Triggers**
     - Update platform_user when user signs in
     - Sync email and metadata changes
     - Update status based on activity

  3. **Organizations Triggers**
     - Update platform_users when enterprise_account changes
     - Handle organization name changes

  ## Security
  - Triggers use SECURITY DEFINER functions
  - Maintains data integrity
  - Proper error handling
*/

-- Trigger function for organization_members changes
CREATE OR REPLACE FUNCTION sync_organization_member_to_platform_user()
RETURNS TRIGGER
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

  -- Skip if auth user not found
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

  RETURN NEW;
END;
$$;

-- Trigger function for auth.users changes (last sign in)
CREATE OR REPLACE FUNCTION sync_auth_user_to_platform_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Only process if last_sign_in_at changed
  IF TG_OP = 'UPDATE' AND (
    OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at OR
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
  ) THEN
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
      UPDATE platform_users
      SET
        email = NEW.email,
        full_name = get_user_full_name(NEW.id),
        last_login_at = NEW.last_sign_in_at,
        status = calculate_user_status(member_record.is_active, NEW.last_sign_in_at),
        updated_at = NOW()
      WHERE user_id = NEW.id
        AND account_id = member_record.enterprise_account_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger function for organizations changes
CREATE OR REPLACE FUNCTION sync_organization_to_platform_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If organization name changed or enterprise_account_id changed
  IF TG_OP = 'UPDATE' AND (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.enterprise_account_id IS DISTINCT FROM NEW.enterprise_account_id
  ) THEN
    -- Update all platform_users for this organization
    UPDATE platform_users pu
    SET
      account_id = COALESCE(NEW.enterprise_account_id, OLD.enterprise_account_id),
      metadata = jsonb_set(
        jsonb_set(
          COALESCE(pu.metadata, '{}'::jsonb),
          '{organization_name}',
          to_jsonb(NEW.name)
        ),
        '{synced_at}',
        to_jsonb(NOW())
      ),
      updated_at = NOW()
    WHERE pu.metadata->>'organization_id' = NEW.id::text;
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers on organization_members table
DROP TRIGGER IF EXISTS trg_sync_organization_member_to_platform_user ON organization_members;
CREATE TRIGGER trg_sync_organization_member_to_platform_user
  AFTER INSERT OR UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_member_to_platform_user();

DROP TRIGGER IF EXISTS trg_sync_organization_member_delete ON organization_members;
CREATE TRIGGER trg_sync_organization_member_delete
  AFTER DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_member_to_platform_user();

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS trg_sync_auth_user_to_platform_users ON auth.users;
CREATE TRIGGER trg_sync_auth_user_to_platform_users
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_platform_users();

-- Create trigger on organizations table
DROP TRIGGER IF EXISTS trg_sync_organization_to_platform_users ON organizations;
CREATE TRIGGER trg_sync_organization_to_platform_users
  AFTER UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_to_platform_users();
