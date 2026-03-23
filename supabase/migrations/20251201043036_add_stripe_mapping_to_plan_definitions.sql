/*
  # Add Stripe Product Mapping to Plan Definitions

  ## Overview
  Adds columns to link plan_definitions with Stripe products and prices for bidirectional sync.

  ## Changes

  1. **Plan Definitions Updates**
     - Add stripe_product_id to link with Stripe products
     - Add stripe_price_monthly_id for monthly price in Stripe
     - Add stripe_price_annual_id for annual price in Stripe
     - Add last_synced_at to track sync status
     - Add sync_status to monitor sync health

  2. **Indexes**
     - Index on stripe_product_id for fast lookups
     - Index on sync_status for filtering

  ## Security
  - No RLS changes needed (existing policies apply)
  - Maintains data integrity with proper constraints
*/

-- Add Stripe mapping columns to plan_definitions
DO $$
BEGIN
  -- Add stripe_product_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plan_definitions' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE plan_definitions
    ADD COLUMN stripe_product_id text UNIQUE;
  END IF;

  -- Add stripe_price_monthly_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plan_definitions' AND column_name = 'stripe_price_monthly_id'
  ) THEN
    ALTER TABLE plan_definitions
    ADD COLUMN stripe_price_monthly_id text;
  END IF;

  -- Add stripe_price_annual_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plan_definitions' AND column_name = 'stripe_price_annual_id'
  ) THEN
    ALTER TABLE plan_definitions
    ADD COLUMN stripe_price_annual_id text;
  END IF;

  -- Add last_synced_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plan_definitions' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE plan_definitions
    ADD COLUMN last_synced_at timestamptz;
  END IF;

  -- Add sync_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plan_definitions' AND column_name = 'sync_status'
  ) THEN
    ALTER TABLE plan_definitions
    ADD COLUMN sync_status text DEFAULT 'not_synced' 
    CHECK (sync_status IN ('synced', 'not_synced', 'pending', 'error'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plan_definitions_stripe_product_id 
  ON plan_definitions(stripe_product_id);

CREATE INDEX IF NOT EXISTS idx_plan_definitions_sync_status 
  ON plan_definitions(sync_status);

-- Add foreign key to stripe_products if the column doesn't have one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'plan_definitions_stripe_product_id_fkey'
  ) THEN
    ALTER TABLE plan_definitions
    ADD CONSTRAINT plan_definitions_stripe_product_id_fkey
    FOREIGN KEY (stripe_product_id)
    REFERENCES stripe_products(stripe_product_id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Comment on new columns
COMMENT ON COLUMN plan_definitions.stripe_product_id IS 'Links to Stripe product for bidirectional sync';
COMMENT ON COLUMN plan_definitions.stripe_price_monthly_id IS 'Stripe price ID for monthly billing';
COMMENT ON COLUMN plan_definitions.stripe_price_annual_id IS 'Stripe price ID for annual billing';
COMMENT ON COLUMN plan_definitions.last_synced_at IS 'Timestamp of last successful sync with Stripe';
COMMENT ON COLUMN plan_definitions.sync_status IS 'Current sync status with Stripe (synced, not_synced, pending, error)';
