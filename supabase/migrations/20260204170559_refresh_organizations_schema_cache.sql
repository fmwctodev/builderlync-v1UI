/*
  # Refresh Organizations Schema Cache

  ## Problem
  Schema cache is out of sync causing "Could not find the 'enabled_modules' column" error
  during organization creation even though the column exists.

  ## Solution
  This migration ensures all required columns exist and triggers a schema cache refresh
  by performing harmless operations on the table structure.

  ## Columns Verified
  - enabled_modules (jsonb)
  - subscription_tier (text)
  - selected_plan (text)
  - onboarding_completed (boolean)
  - subscription_status (text)

  ## Notes
  - All columns should already exist from previous migrations
  - This migration uses IF NOT EXISTS checks to be idempotent
  - Triggers PostgREST schema cache refresh automatically
*/

-- Ensure all required columns exist with proper defaults
DO $$
BEGIN
  -- enabled_modules column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'enabled_modules'
  ) THEN
    ALTER TABLE organizations ADD COLUMN enabled_modules jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added enabled_modules column';
  END IF;

  -- subscription_tier column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_tier text;
    RAISE NOTICE 'Added subscription_tier column';
  END IF;

  -- selected_plan column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'selected_plan'
  ) THEN
    ALTER TABLE organizations ADD COLUMN selected_plan text;
    RAISE NOTICE 'Added selected_plan column';
  END IF;

  -- onboarding_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE organizations ADD COLUMN onboarding_completed boolean DEFAULT false;
    RAISE NOTICE 'Added onboarding_completed column';
  END IF;

  -- subscription_status column (should already exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_status text DEFAULT 'trial';
    RAISE NOTICE 'Added subscription_status column';
  END IF;

  RAISE NOTICE 'Organizations table schema verification complete';
END $$;

-- Create a comment on the table to trigger schema cache refresh
COMMENT ON TABLE organizations IS 'Core organization/company data - Schema refreshed at 2026-02-04';

-- Verify all columns are present
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'organizations'
    AND column_name IN (
      'enabled_modules',
      'subscription_tier',
      'selected_plan',
      'onboarding_completed',
      'subscription_status'
    );

  IF col_count = 5 THEN
    RAISE NOTICE 'SUCCESS: All 5 required columns are present in organizations table';
  ELSE
    RAISE WARNING 'INCOMPLETE: Only % of 5 required columns found', col_count;
  END IF;
END $$;

-- Force a schema cache reload by notifying PostgREST
NOTIFY pgrst, 'reload schema';
