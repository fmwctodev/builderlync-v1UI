/*
  # Create Coupons System and Add Tracking to Invoices/Estimates

  ## Overview
  Creates the coupons table for managing discount codes and adds coupon tracking
  to invoices and estimates tables.

  ## New Tables
  
  ### `coupons`
  - `id` (uuid, primary key) - Unique coupon identifier
  - `name` (text) - Coupon name
  - `code` (text, unique) - Coupon code
  - `discount_type` (text) - Type: percentage, fixed_amount
  - `discount_value` (numeric) - Discount amount or percentage
  - `status` (text) - Status: active, scheduled, expired
  - `start_date` (date) - When coupon becomes active
  - `end_date` (date, nullable) - When coupon expires
  - `redemption_count` (integer) - Number of times used
  - `max_redemptions` (integer, nullable) - Maximum allowed uses
  - `created_by` (uuid) - User who created coupon
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `estimates` (if not exists)
  - Similar to invoices structure for estimate management

  ## Changes to Existing Tables
  - `invoices` - Add coupon_id, coupon_code, coupon_discount_amount
  - `estimates` - Add coupon_id, coupon_code, coupon_discount_amount

  ## Security
  - Enable RLS on coupons table
  - Allow authenticated users to read/write coupons
  - Foreign key constraints for data integrity
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric(12, 2) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  redemption_count integer DEFAULT 0,
  max_redemptions integer,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT coupons_discount_type_check CHECK (discount_type IN ('percentage', 'fixed_amount')),
  CONSTRAINT coupons_status_check CHECK (status IN ('active', 'scheduled', 'expired'))
);

-- Create estimates table if it doesn't exist
CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number text UNIQUE NOT NULL,
  name text NOT NULL,
  customer_id uuid,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  is_template boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  acceptance_status text DEFAULT 'pending',
  accepted_at timestamptz,
  items jsonb NOT NULL DEFAULT '[]',
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT estimates_status_check CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  CONSTRAINT estimates_acceptance_check CHECK (acceptance_status IN ('pending', 'accepted', 'rejected'))
);

-- Enable RLS on coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Users can view all coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create coupons"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update coupons"
  ON coupons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete coupons"
  ON coupons FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Enable RLS on estimates if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'estimates'
  ) THEN
    ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view all estimates"
      ON estimates FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Users can create estimates"
      ON estimates FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());

    CREATE POLICY "Users can update estimates"
      ON estimates FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);

    CREATE POLICY "Users can delete estimates"
      ON estimates FOR DELETE
      TO authenticated
      USING (created_by = auth.uid());
  END IF;
END $$;

-- Add coupon tracking columns to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'coupon_id'
  ) THEN
    ALTER TABLE invoices
    ADD COLUMN coupon_id uuid,
    ADD COLUMN coupon_code text,
    ADD COLUMN coupon_discount_amount numeric(12, 2) DEFAULT 0;
  END IF;
END $$;

-- Add coupon tracking columns to estimates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'estimates' AND column_name = 'coupon_id'
  ) THEN
    ALTER TABLE estimates
    ADD COLUMN coupon_id uuid,
    ADD COLUMN coupon_code text,
    ADD COLUMN coupon_discount_amount numeric(12, 2) DEFAULT 0;
  END IF;
END $$;

-- Add foreign key constraints after columns are created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_coupon_id_fkey'
  ) THEN
    ALTER TABLE invoices
    ADD CONSTRAINT invoices_coupon_id_fkey
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'estimates_coupon_id_fkey'
  ) THEN
    ALTER TABLE estimates
    ADD CONSTRAINT estimates_coupon_id_fkey
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_invoices_coupon_id ON invoices(coupon_id);
CREATE INDEX IF NOT EXISTS idx_estimates_coupon_id ON estimates(coupon_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
