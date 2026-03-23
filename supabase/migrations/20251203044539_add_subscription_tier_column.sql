/*
  # Add subscription_tier Column to Fix Schema Mismatch

  ## Problem
  - Sync function in migration 20251201040626 references organizations.subscription_tier at line 301
  - Column doesn't exist in organizations table, causing "record old has no field subscription_tier" error
  - Account creation fails when sync function tries to access this field
  - Same column is also missing from enterprise_accounts table

  ## Solution
  1. Add subscription_tier to organizations table
  2. Add subscription_tier to enterprise_accounts table
  3. Backfill data from existing plan-related columns
  4. Add indexes for performance
  5. Add CHECK constraints for data quality
  6. Create trigger to keep subscription_tier and selected_plan in sync

  ## Changes
  - organizations: Add subscription_tier column (nullable text)
  - enterprise_accounts: Add subscription_tier column (nullable text)
  - Backfill organizations.subscription_tier from selected_plan
  - Backfill enterprise_accounts.subscription_tier from plan column
  - Add CHECK constraints to validate tier values
  - Add indexes on subscription_tier columns
  - Create sync trigger to maintain consistency

  ## Security
  - No RLS changes needed
  - Existing policies continue to work
  - Column is nullable to support gradual adoption
*/

-- Step 1: Add subscription_tier column to organizations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE organizations
    ADD COLUMN subscription_tier text;

    RAISE NOTICE 'Added subscription_tier column to organizations table';
  END IF;
END $$;

-- Step 2: Backfill organizations.subscription_tier from selected_plan
UPDATE organizations
SET subscription_tier = COALESCE(selected_plan, 'Starter')
WHERE subscription_tier IS NULL;

-- Step 3: Add subscription_tier column to enterprise_accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE enterprise_accounts
    ADD COLUMN subscription_tier text;

    RAISE NOTICE 'Added subscription_tier column to enterprise_accounts table';
  END IF;
END $$;

-- Step 4: Backfill enterprise_accounts.subscription_tier from plan column
UPDATE enterprise_accounts
SET subscription_tier = plan
WHERE subscription_tier IS NULL;

-- Step 5: Add CHECK constraints for valid subscription tiers
DO $$
BEGIN
  -- Add constraint to organizations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organizations_subscription_tier_check'
  ) THEN
    ALTER TABLE organizations
    ADD CONSTRAINT organizations_subscription_tier_check
    CHECK (subscription_tier IN ('Starter', 'Pro', 'Enterprise') OR subscription_tier IS NULL);

    RAISE NOTICE 'Added CHECK constraint to organizations.subscription_tier';
  END IF;

  -- Add constraint to enterprise_accounts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'enterprise_accounts_subscription_tier_check'
  ) THEN
    ALTER TABLE enterprise_accounts
    ADD CONSTRAINT enterprise_accounts_subscription_tier_check
    CHECK (subscription_tier IN ('Starter', 'Pro', 'Enterprise') OR subscription_tier IS NULL);

    RAISE NOTICE 'Added CHECK constraint to enterprise_accounts.subscription_tier';
  END IF;
END $$;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier
ON organizations(subscription_tier)
WHERE subscription_tier IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_subscription_tier
ON enterprise_accounts(subscription_tier)
WHERE subscription_tier IS NOT NULL;

-- Step 7: Create trigger function to keep subscription_tier and selected_plan in sync
CREATE OR REPLACE FUNCTION sync_subscription_tier()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When subscription_tier changes, update selected_plan
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    NEW.selected_plan := NEW.subscription_tier;
  END IF;

  -- When selected_plan changes, update subscription_tier
  IF NEW.selected_plan IS DISTINCT FROM OLD.selected_plan THEN
    NEW.subscription_tier := NEW.selected_plan;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger on organizations table
DROP TRIGGER IF EXISTS trigger_sync_subscription_tier ON organizations;
CREATE TRIGGER trigger_sync_subscription_tier
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_tier();

-- Step 9: Verify the changes
DO $$
DECLARE
  org_count INTEGER;
  acct_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations WHERE subscription_tier IS NOT NULL;
  SELECT COUNT(*) INTO acct_count FROM enterprise_accounts WHERE subscription_tier IS NOT NULL;

  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE '  - Organizations with subscription_tier: %', org_count;
  RAISE NOTICE '  - Enterprise accounts with subscription_tier: %', acct_count;
  RAISE NOTICE '  - Indexes created on both tables';
  RAISE NOTICE '  - CHECK constraints added to both tables';
  RAISE NOTICE '  - Sync trigger created for organizations';
END $$;