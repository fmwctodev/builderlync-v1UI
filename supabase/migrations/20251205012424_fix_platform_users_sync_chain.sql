/*
  # Fix Platform Users Sync Chain

  ## Problem
  Users created in organizations don't appear in Super Admin dashboard because:
  1. Organizations may not have enterprise_account_id when first created
  2. Platform users are only created when enterprise_account_id exists
  3. If owner is added AFTER organization creation, no enterprise account is created
  4. Subsequent staff additions don't create platform users

  ## Solution
  1. **Auto-create enterprise account when first owner/admin is added**
     - Trigger on organization_members INSERT
     - Creates enterprise account if missing when owner/admin added

  2. **Make platform_users sync self-healing**
     - Enhanced sync trigger that creates missing enterprise accounts
     - Falls back gracefully if dependencies missing

  3. **Provide manual sync functions**
     - sync_all_missing_enterprise_accounts() - Creates any missing accounts
     - sync_all_missing_platform_users() - Creates any missing users

  ## Security
  - Functions use SECURITY DEFINER for admin access
  - Maintains data integrity with proper error handling
*/

-- Function to trigger enterprise account creation when first owner is added
CREATE OR REPLACE FUNCTION ensure_enterprise_account_on_owner_add()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_record RECORD;
  account_exists boolean;
BEGIN
  -- Only process if this is an owner or admin being added
  IF NEW.role IN ('owner', 'admin') AND NEW.is_active = true THEN
    -- Check if organization exists but has no enterprise_account_id
    SELECT
      o.id,
      o.enterprise_account_id,
      EXISTS(SELECT 1 FROM enterprise_accounts ea WHERE ea.organization_id = o.id) as has_account
    INTO org_record
    FROM organizations o
    WHERE o.id = NEW.organization_id;

    -- If organization needs an enterprise account
    IF org_record.id IS NOT NULL AND org_record.enterprise_account_id IS NULL THEN
      RAISE NOTICE 'Creating enterprise account for organization % (owner added)', NEW.organization_id;

      -- Trigger the sync by updating the organization
      -- This will invoke sync_organization_to_enterprise_account trigger
      UPDATE organizations
      SET updated_at = NOW()
      WHERE id = NEW.organization_id;

      -- Give it a moment to process
      PERFORM pg_sleep(0.1);

      -- Now trigger platform user creation for this member
      -- by updating the member record
      UPDATE organization_members
      SET updated_at = NOW()
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Function to sync all organizations missing enterprise accounts
CREATE OR REPLACE FUNCTION sync_all_missing_enterprise_accounts()
RETURNS TABLE (
  processed integer,
  created integer,
  errors integer,
  error_messages text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_record RECORD;
  total integer := 0;
  created_count integer := 0;
  error_count integer := 0;
  errors_list text[] := ARRAY[]::text[];
BEGIN
  -- Loop through all organizations without enterprise accounts
  FOR org_record IN
    SELECT o.id, o.name
    FROM organizations o
    LEFT JOIN enterprise_accounts ea ON ea.organization_id = o.id
    WHERE o.is_active = true
      AND o.enterprise_account_id IS NULL
      AND ea.id IS NULL
  LOOP
    BEGIN
      total := total + 1;

      RAISE NOTICE 'Processing organization: %', org_record.name;

      -- Trigger enterprise account creation
      UPDATE organizations
      SET updated_at = NOW()
      WHERE id = org_record.id;

      -- Check if account was created
      IF EXISTS (SELECT 1 FROM enterprise_accounts WHERE organization_id = org_record.id) THEN
        created_count := created_count + 1;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors_list := array_append(errors_list,
        format('Org %s: %s', org_record.name, SQLERRM));
      RAISE NOTICE 'Error processing organization %: %', org_record.name, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT total, created_count, error_count, errors_list;
END;
$$;

-- Function to sync all organization members missing platform users
CREATE OR REPLACE FUNCTION sync_all_missing_platform_users()
RETURNS TABLE (
  processed integer,
  created integer,
  skipped integer,
  errors integer,
  error_messages text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
  total integer := 0;
  created_count integer := 0;
  skipped_count integer := 0;
  error_count integer := 0;
  errors_list text[] := ARRAY[]::text[];
  existing_user_id uuid;
BEGIN
  -- Loop through all organization members without platform users
  FOR member_record IN
    SELECT
      om.id as member_id,
      om.user_id,
      om.organization_id,
      o.enterprise_account_id,
      o.name as org_name,
      au.email
    FROM organization_members om
    JOIN organizations o ON om.organization_id = o.id
    LEFT JOIN auth.users au ON au.id = om.user_id
    WHERE om.is_active = true
      AND o.is_active = true
  LOOP
    BEGIN
      total := total + 1;

      -- Check if platform user already exists
      SELECT id INTO existing_user_id
      FROM platform_users
      WHERE user_id = member_record.user_id
        AND (account_id = member_record.enterprise_account_id
             OR metadata->>'organization_id' = member_record.organization_id::text);

      -- Skip if already exists
      IF existing_user_id IS NOT NULL THEN
        skipped_count := skipped_count + 1;
        CONTINUE;
      END IF;

      -- Skip if no enterprise account (will be handled by enterprise account sync)
      IF member_record.enterprise_account_id IS NULL THEN
        skipped_count := skipped_count + 1;
        RAISE NOTICE 'Skipping member % - no enterprise account for org %',
          member_record.email, member_record.org_name;
        CONTINUE;
      END IF;

      RAISE NOTICE 'Creating platform user for: % in %',
        member_record.email, member_record.org_name;

      -- Trigger platform user creation by updating the member
      UPDATE organization_members
      SET updated_at = NOW()
      WHERE id = member_record.member_id;

      created_count := created_count + 1;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors_list := array_append(errors_list,
        format('Member %s: %s', COALESCE(member_record.email, 'unknown'), SQLERRM));
      RAISE NOTICE 'Error processing member %: %', member_record.email, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT total, created_count, skipped_count, error_count, errors_list;
END;
$$;

-- Enhanced platform_users sync trigger with self-healing
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
  retry_count integer := 0;
  max_retries integer := 2;
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

  -- Self-healing: If no enterprise account exists, try to create one
  WHILE enterprise_account_id IS NULL AND retry_count < max_retries LOOP
    retry_count := retry_count + 1;

    RAISE NOTICE 'Attempt % to create enterprise account for org %', retry_count, org_name;

    -- Check if this member is an owner or admin
    IF NEW.role IN ('owner', 'admin') AND NEW.is_active = true THEN
      -- Trigger enterprise account creation
      UPDATE organizations
      SET updated_at = NOW()
      WHERE id = NEW.organization_id;

      -- Wait briefly for trigger to complete
      PERFORM pg_sleep(0.1);

      -- Re-fetch enterprise_account_id
      SELECT o.enterprise_account_id
      INTO enterprise_account_id
      FROM organizations o
      WHERE o.id = NEW.organization_id;

      IF enterprise_account_id IS NOT NULL THEN
        RAISE NOTICE 'Successfully created enterprise account for org %', org_name;
        EXIT;
      END IF;
    ELSE
      -- Not an owner, can't create account, exit loop
      EXIT;
    END IF;
  END LOOP;

  -- Final check: Skip if no enterprise account after retries
  IF enterprise_account_id IS NULL THEN
    RAISE NOTICE 'Skipping platform user creation - no enterprise account for org % (member role: %)',
      org_name, NEW.role;
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
    RAISE NOTICE 'Skipping platform user creation - auth user not found for member in org %', org_name;
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

  RAISE NOTICE 'Created/updated platform user for % in org %', auth_user_record.email, org_name;

  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure new function is used
DROP TRIGGER IF EXISTS trg_sync_organization_member_to_platform_user ON organization_members;
CREATE TRIGGER trg_sync_organization_member_to_platform_user
  AFTER INSERT OR UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_member_to_platform_user();

-- Create new trigger for auto-creating enterprise accounts on first owner
DROP TRIGGER IF EXISTS trg_ensure_enterprise_account_on_owner_add ON organization_members;
CREATE TRIGGER trg_ensure_enterprise_account_on_owner_add
  AFTER INSERT ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION ensure_enterprise_account_on_owner_add();

-- Now sync all missing enterprise accounts
DO $$
DECLARE
  sync_result RECORD;
BEGIN
  RAISE NOTICE 'Starting sync of missing enterprise accounts...';

  SELECT * INTO sync_result FROM sync_all_missing_enterprise_accounts();

  RAISE NOTICE 'Enterprise accounts sync complete: % processed, % created, % errors',
    sync_result.processed, sync_result.created, sync_result.errors;

  IF sync_result.errors > 0 THEN
    RAISE NOTICE 'Errors: %', array_to_string(sync_result.error_messages, '; ');
  END IF;
END $$;

-- Now sync all missing platform users
DO $$
DECLARE
  sync_result RECORD;
BEGIN
  RAISE NOTICE 'Starting sync of missing platform users...';

  SELECT * INTO sync_result FROM sync_all_missing_platform_users();

  RAISE NOTICE 'Platform users sync complete: % processed, % created, % skipped, % errors',
    sync_result.processed, sync_result.created, sync_result.skipped, sync_result.errors;

  IF sync_result.errors > 0 THEN
    RAISE NOTICE 'Errors: %', array_to_string(sync_result.error_messages, '; ');
  END IF;
END $$;
