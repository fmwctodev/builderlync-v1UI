/*
  # Create Credit Packages System
  
  1. New Tables
    - `credit_packages`
      - `id` (uuid, primary key)
      - `name` (text) - Display name of the package
      - `credits` (integer) - Number of credits in the package
      - `price_cents` (integer) - Price in cents
      - `stripe_price_id` (text) - Stripe Price ID for checkout
      - `description` (text) - Package description
      - `is_popular` (boolean) - Whether to highlight this package
      - `is_active` (boolean) - Whether the package is available for purchase
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `credit_purchases`
      - `id` (uuid, primary key)
      - `organization_id` (uuid) - The purchasing organization
      - `credit_package_id` (uuid) - The package purchased
      - `credits_purchased` (integer) - Number of credits purchased
      - `amount_paid_cents` (integer) - Amount paid in cents
      - `stripe_payment_intent_id` (text) - Stripe payment intent ID
      - `stripe_checkout_session_id` (text) - Stripe checkout session ID
      - `status` (text) - Purchase status: pending, completed, failed, refunded
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_by` (uuid) - User who made the purchase

  2. Security
    - Enable RLS on both tables
    - Anyone can view active credit packages
    - Only organization members can view their purchases

  3. Seed Data
    - Default credit packages for different tiers
*/

-- Create credit_packages table
CREATE TABLE IF NOT EXISTS credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  stripe_price_id text,
  description text,
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create credit_purchases table
CREATE TABLE IF NOT EXISTS credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  credit_package_id uuid REFERENCES credit_packages(id),
  credits_purchased integer NOT NULL CHECK (credits_purchased > 0),
  amount_paid_cents integer NOT NULL CHECK (amount_paid_cents >= 0),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_credit_packages_sort ON credit_packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_org_id ON credit_purchases(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_stripe_session ON credit_purchases(stripe_checkout_session_id);

-- Enable RLS
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_packages
CREATE POLICY "Anyone can view active credit packages"
  ON credit_packages
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for credit_purchases
CREATE POLICY "Organization members can view their credit purchases"
  ON credit_purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = credit_purchases.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

CREATE POLICY "Organization members can create credit purchases"
  ON credit_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = credit_purchases.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_credit_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_credit_packages_updated_at ON credit_packages;
CREATE TRIGGER trigger_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_packages_updated_at();

-- Seed default credit packages
INSERT INTO credit_packages (name, credits, price_cents, description, is_popular, sort_order)
VALUES
  ('Starter Pack', 10, 4900, '10 credits for occasional use', false, 1),
  ('Standard Pack', 25, 9900, '25 credits - Best value for small teams', true, 2),
  ('Pro Pack', 50, 17900, '50 credits for growing businesses', false, 3),
  ('Enterprise Pack', 100, 29900, '100 credits for high-volume users', false, 4)
ON CONFLICT DO NOTHING;
