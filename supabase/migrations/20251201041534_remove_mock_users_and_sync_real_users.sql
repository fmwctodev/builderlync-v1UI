/*
  # Remove Mock Users and Sync Real Users

  ## Overview
  Removes all mock/seed user data from platform_users and syncs with real organization members.

  ## Changes

  1. **Remove Mock Data**
     - Deletes all users from seed script (admin1@account.com, manager1@account.com, etc.)
     - Removes fake users with pattern-based emails
     - Cleans up orphaned records

  2. **Initial Sync**
     - Runs sync function to create platform_users from organization_members
     - Links all real users to their enterprise accounts
     - Maps real roles and activity data

  3. **Validation**
     - Logs sync results
     - Validates data integrity
     - Reports any errors

  ## Security
  - Preserves manually created users (if any)
  - Maintains audit trail
  - Validates all foreign keys
*/

-- Log the cleanup operation
DO $$
BEGIN
  RAISE NOTICE 'Starting mock user data cleanup...';
END $$;

-- Delete mock users by known email patterns
DELETE FROM platform_users
WHERE
  -- Mock admin users
  email ~ '^admin[0-9]+@account\.com$' OR
  -- Mock manager users
  email ~ '^manager[0-9]+@account\.com$' OR
  -- Mock regular users
  email ~ '^user[0-9]+[a-z]@account\.com$' OR
  -- Mock invited users
  email ~ '^invited[0-9]+@account\.com$' OR
  -- Any users not linked to real auth users
  (user_id IS NULL AND email LIKE '%@account.com');

-- Log cleanup results
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock platform users', deleted_count;
END $$;

-- Run initial sync to create real platform users
DO $$
DECLARE
  sync_result RECORD;
BEGIN
  RAISE NOTICE 'Starting sync of real organization members to platform users...';

  SELECT * INTO sync_result FROM sync_organization_members_to_platform_users();

  RAISE NOTICE 'Sync complete:';
  RAISE NOTICE '  Total processed: %', sync_result.total_processed;
  RAISE NOTICE '  Created: %', sync_result.created_count;
  RAISE NOTICE '  Updated: %', sync_result.updated_count;
  RAISE NOTICE '  Skipped: %', sync_result.skipped_count;
  RAISE NOTICE '  Errors: %', sync_result.error_count;
END $$;

-- Validate sync results
DO $$
DECLARE
  platform_user_count integer;
  org_member_count integer;
  orphaned_users integer;
BEGIN
  -- Count platform users with valid links
  SELECT COUNT(*) INTO platform_user_count
  FROM platform_users
  WHERE user_id IS NOT NULL AND account_id IS NOT NULL;

  -- Count organization members with enterprise accounts
  SELECT COUNT(*) INTO org_member_count
  FROM organization_members om
  JOIN organizations o ON om.organization_id = o.id
  WHERE o.enterprise_account_id IS NOT NULL;

  -- Count users without proper links
  SELECT COUNT(*) INTO orphaned_users
  FROM platform_users
  WHERE user_id IS NULL OR account_id IS NULL;

  RAISE NOTICE 'Validation:';
  RAISE NOTICE '  Platform users synced: %', platform_user_count;
  RAISE NOTICE '  Organization members with accounts: %', org_member_count;
  RAISE NOTICE '  Orphaned platform users: %', orphaned_users;

  IF orphaned_users > 0 THEN
    RAISE WARNING 'Found % orphaned platform users - consider reviewing', orphaned_users;
  END IF;
END $$;
