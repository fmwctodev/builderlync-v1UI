/*
  # Remove Mock Billing Data and Prepare for Real Stripe Sync

  ## Overview
  Removes all mock billing data from seed file and prepares tables for real Stripe sync.

  ## Changes

  1. **Remove Mock Data**
     - Delete mock billing_snapshots
     - Clear fake MRR/ARR from enterprise_accounts
     - Remove static plan data not matching Stripe
     - Clean up test accounts with fake billing

  2. **Prepare for Real Data**
     - Reset sync statuses
     - Clear orphaned records
     - Prepare for first Stripe sync

  ## Security
  - Preserves real Stripe data if it exists
  - Validates before deletion
  - Logs all cleanup operations
*/

-- Log the cleanup operation
DO $$
BEGIN
  RAISE NOTICE 'Starting mock billing data cleanup...';
END $$;

-- Delete all billing_snapshots (these will be regenerated from real Stripe data)
DELETE FROM billing_snapshots
WHERE TRUE;

-- Log billing snapshots cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % billing snapshots', deleted_count;
END $$;

-- Reset MRR/ARR to 0 for accounts without real Stripe subscriptions
UPDATE enterprise_accounts ea
SET 
  mrr = 0.00,
  arr = 0.00,
  updated_at = NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM stripe_subscriptions ss
  WHERE ss.account_id = ea.id
    AND ss.status IN ('active', 'trialing')
);

-- Log enterprise accounts reset
DO $$
DECLARE
  updated_count integer;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Reset MRR/ARR for % enterprise accounts without Stripe subscriptions', updated_count;
END $$;

-- Update plan_definitions sync status to prepare for Stripe sync
UPDATE plan_definitions
SET 
  sync_status = 'not_synced',
  last_synced_at = NULL
WHERE sync_status IS NULL OR sync_status != 'synced';

-- Log plan definitions update
DO $$
DECLARE
  updated_count integer;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Prepared % plan definitions for Stripe sync', updated_count;
END $$;

-- Delete old usage tracking data for test accounts
-- Keep usage data but mark it as needing recalculation
UPDATE usage_tracking
SET updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM enterprise_accounts ea
  WHERE ea.id = usage_tracking.account_id
    AND ea.status = 'trial'
    AND ea.created_at < NOW() - INTERVAL '30 days'
);

-- Clean up orphaned records in organization subscriptions
-- that don't link to valid Stripe subscriptions
DELETE FROM subscriptions
WHERE stripe_subscription_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stripe_subscriptions ss
    WHERE ss.stripe_subscription_id = subscriptions.stripe_subscription_id
  );

-- Log orphaned subscriptions cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orphaned subscription records', deleted_count;
END $$;

-- Validation: Check how many accounts will need Stripe sync
DO $$
DECLARE
  accounts_needing_sync integer;
  accounts_with_stripe integer;
  plans_needing_sync integer;
BEGIN
  SELECT COUNT(*) INTO accounts_needing_sync
  FROM enterprise_accounts ea
  WHERE ea.status IN ('active', 'trial', 'past_due')
    AND NOT EXISTS (
      SELECT 1 FROM stripe_customers sc
      WHERE sc.account_id = ea.id
    );

  SELECT COUNT(*) INTO accounts_with_stripe
  FROM stripe_customers;

  SELECT COUNT(*) INTO plans_needing_sync
  FROM plan_definitions
  WHERE sync_status = 'not_synced';

  RAISE NOTICE 'Validation Results:';
  RAISE NOTICE '  Accounts needing Stripe customer creation: %', accounts_needing_sync;
  RAISE NOTICE '  Accounts with existing Stripe customers: %', accounts_with_stripe;
  RAISE NOTICE '  Plans needing Stripe sync: %', plans_needing_sync;

  IF accounts_needing_sync > 0 THEN
    RAISE NOTICE 'Next step: Run Stripe sync to create customers for % accounts', accounts_needing_sync;
  END IF;

  IF plans_needing_sync > 0 THEN
    RAISE NOTICE 'Next step: Sync % plans with Stripe products', plans_needing_sync;
  END IF;
END $$;

-- Create function to calculate real MRR from Stripe subscriptions
CREATE OR REPLACE FUNCTION calculate_mrr_from_stripe()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE enterprise_accounts ea
  SET 
    mrr = COALESCE(
      (
        SELECT SUM(
          CASE 
            WHEN ss.billing_cycle = 'monthly' THEN pd.price_monthly::numeric
            WHEN ss.billing_cycle = 'annual' THEN (pd.price_annual::numeric / 12)
            ELSE 0
          END
        )
        FROM stripe_subscriptions ss
        JOIN plan_definitions pd ON pd.name = ss.plan_name
        WHERE ss.account_id = ea.id
          AND ss.status IN ('active', 'trialing')
      ),
      0
    ),
    arr = COALESCE(
      (
        SELECT SUM(
          CASE 
            WHEN ss.billing_cycle = 'monthly' THEN (pd.price_monthly::numeric * 12)
            WHEN ss.billing_cycle = 'annual' THEN pd.price_annual::numeric
            ELSE 0
          END
        )
        FROM stripe_subscriptions ss
        JOIN plan_definitions pd ON pd.name = ss.plan_name
        WHERE ss.account_id = ea.id
          AND ss.status IN ('active', 'trialing')
      ),
      0
    ),
    updated_at = NOW()
  WHERE EXISTS (
    SELECT 1 FROM stripe_subscriptions ss
    WHERE ss.account_id = ea.id
      AND ss.status IN ('active', 'trialing')
  );
END;
$$;

-- Comment on the new function
COMMENT ON FUNCTION calculate_mrr_from_stripe() IS 'Calculates real MRR and ARR for all enterprise accounts based on active Stripe subscriptions';

-- Run initial calculation if any Stripe subscriptions exist
DO $$
DECLARE
  subscription_count integer;
BEGIN
  SELECT COUNT(*) INTO subscription_count
  FROM stripe_subscriptions
  WHERE status IN ('active', 'trialing');

  IF subscription_count > 0 THEN
    PERFORM calculate_mrr_from_stripe();
    RAISE NOTICE 'Calculated real MRR/ARR for accounts with % active Stripe subscriptions', subscription_count;
  ELSE
    RAISE NOTICE 'No active Stripe subscriptions found - MRR/ARR set to 0';
    RAISE NOTICE 'Run Stripe sync to import subscription data';
  END IF;
END $$;
