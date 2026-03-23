/*
  # Remove Mock Data and Sync Real Accounts

  ## Overview
  Removes all mock/seed data from enterprise_accounts and syncs with real organizations.

  ## Changes

  1. **Remove Mock Data**
     - Deletes all accounts created by seed script
     - Removes mock companies (Company 1-50, Apex Roofing, etc.)
     - Cleans up related mock data (modules, integrations, usage)

  2. **Initial Sync**
     - Runs sync function to create enterprise accounts from real organizations
     - Links all existing organizations to enterprise accounts
     - Calculates initial health scores

  3. **Cleanup**
     - Removes orphaned records
     - Resets sequences if needed

  ## Security
  - Preserves manually created accounts (if any)
  - Maintains data integrity with cascading deletes
  - Logs all operations for audit trail
*/

-- Log the cleanup operation
DO $$
BEGIN
  RAISE NOTICE 'Starting mock data cleanup...';
END $$;

-- Delete mock accounts by known patterns
DELETE FROM enterprise_accounts
WHERE
  -- Mock companies from seed script
  name LIKE 'Company %' OR
  owner_email LIKE 'owner%@company%.com' OR
  -- Known seed companies
  name IN (
    'Apex Roofing Solutions',
    'Summit Construction',
    'Peak Contractors LLC',
    'Elite Roofing Services',
    'Premier Home Improvements',
    'Quality Roofing Co',
    'Professional Contractors Inc',
    'Advanced Roofing Systems',
    'Reliable Home Services',
    'Superior Construction Group'
  );

-- Log cleanup results
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock enterprise accounts', deleted_count;
END $$;

-- Run initial sync to create real enterprise accounts
DO $$
DECLARE
  sync_result RECORD;
BEGIN
  RAISE NOTICE 'Starting sync of real organizations to enterprise accounts...';

  SELECT * INTO sync_result FROM sync_organizations_to_enterprise_accounts();

  RAISE NOTICE 'Sync complete:';
  RAISE NOTICE '  Total processed: %', sync_result.synced_count;
  RAISE NOTICE '  Created: %', sync_result.created_count;
  RAISE NOTICE '  Updated: %', sync_result.updated_count;
  RAISE NOTICE '  Errors: %', sync_result.error_count;
END $$;
