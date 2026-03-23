/*
  # Add Promo Code Tracking to Measurement Orders

  ## Overview
  Adds columns to the measurement_orders table to track promo code usage
  for measurement orders placed using the credits system.

  ## Changes to Existing Tables

  ### `measurement_orders`
  - `promo_code_id` (uuid, nullable) - Foreign key reference to coupons table
  - `promo_code` (text, nullable) - The promo code that was applied (denormalized for historical record)
  - `promo_discount_credits` (integer, default 0) - Number of credits discounted by the promo
  - `credits_charged` (integer, nullable) - Final credits charged after promo discount

  ## Security
  - No changes to RLS policies needed (inherits existing measurement_orders policies)

  ## Notes
  - promo_code is stored separately from promo_code_id for historical record keeping
  - If a coupon is deleted, the order still retains the code that was used
  - credits_charged represents the final amount after any promo discount
*/

-- Add promo tracking columns to measurement_orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'promo_code_id'
  ) THEN
    ALTER TABLE measurement_orders
    ADD COLUMN promo_code_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
    ADD COLUMN promo_code text,
    ADD COLUMN promo_discount_credits integer DEFAULT 0,
    ADD COLUMN credits_charged integer;
  END IF;
END $$;

-- Create index for promo code lookups
CREATE INDEX IF NOT EXISTS idx_measurement_orders_promo_code_id 
  ON measurement_orders(promo_code_id) 
  WHERE promo_code_id IS NOT NULL;

-- Create index for promo code text lookups
CREATE INDEX IF NOT EXISTS idx_measurement_orders_promo_code 
  ON measurement_orders(promo_code) 
  WHERE promo_code IS NOT NULL;
