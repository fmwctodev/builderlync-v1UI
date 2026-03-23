/*
  # Create Instant Estimate Charges Table

  1. New Tables
    - `instant_estimate_charges`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, FK to organizations)
      - `property_id` (text) - Google Places property identifier
      - `address_text` (text) - human-readable address
      - `credits_charged` (integer) - amount charged (0 for Pro/Enterprise)
      - `transaction_id` (uuid, nullable) - FK to credit_transactions for Standard charges
      - `plan_tier_at_charge` (text) - tier at time of charge
      - `charged_at` (timestamptz) - when the charge was made
      - `expires_at` (timestamptz) - when the charge expires (30 days from charged_at)
      - `created_by` (uuid, FK to auth.users)

  2. Security
    - Enable RLS on `instant_estimate_charges` table
    - Add policies for organization-scoped access

  3. Functions
    - `check_instant_estimate_charge` - checks for non-expired charge for a property
    - `record_instant_estimate_charge` - records a new charge with expiration
*/

-- Create the instant_estimate_charges table
CREATE TABLE IF NOT EXISTS instant_estimate_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  address_text text NOT NULL,
  credits_charged integer NOT NULL DEFAULT 0,
  transaction_id uuid REFERENCES credit_transactions(id) ON DELETE SET NULL,
  plan_tier_at_charge text NOT NULL CHECK (plan_tier_at_charge IN ('standard', 'pro', 'enterprise')),
  charged_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_instant_estimate_charges_org_id 
  ON instant_estimate_charges(organization_id);

CREATE INDEX IF NOT EXISTS idx_instant_estimate_charges_property_id 
  ON instant_estimate_charges(property_id);

CREATE INDEX IF NOT EXISTS idx_instant_estimate_charges_expires_at 
  ON instant_estimate_charges(expires_at);

-- Composite index for common lookup pattern (org + property + expiration check)
CREATE INDEX IF NOT EXISTS idx_instant_estimate_charges_org_property_expires 
  ON instant_estimate_charges(organization_id, property_id, expires_at DESC);

-- Enable RLS
ALTER TABLE instant_estimate_charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Select: Organization members can view their organization's charges
CREATE POLICY "Organization members can view instant estimate charges"
  ON instant_estimate_charges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = instant_estimate_charges.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

-- Insert: Organization members can create charges
CREATE POLICY "Organization members can create instant estimate charges"
  ON instant_estimate_charges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = instant_estimate_charges.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

-- Update: Organization members can update their own charges
CREATE POLICY "Organization members can update instant estimate charges"
  ON instant_estimate_charges
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = instant_estimate_charges.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = instant_estimate_charges.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

-- Delete: Only admins/owners can delete charges (for cleanup purposes)
CREATE POLICY "Organization admins can delete instant estimate charges"
  ON instant_estimate_charges
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = instant_estimate_charges.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
      AND om.role IN ('owner', 'admin')
    )
  );

-- Function to check for a valid (non-expired) charge for a property
CREATE OR REPLACE FUNCTION check_instant_estimate_charge(
  p_organization_id uuid,
  p_property_id text
)
RETURNS TABLE (
  charge_id uuid,
  credits_charged integer,
  plan_tier_at_charge text,
  charged_at timestamptz,
  expires_at timestamptz,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    iec.id as charge_id,
    iec.credits_charged,
    iec.plan_tier_at_charge,
    iec.charged_at,
    iec.expires_at,
    (iec.expires_at > now()) as is_valid
  FROM instant_estimate_charges iec
  WHERE iec.organization_id = p_organization_id
    AND iec.property_id = p_property_id
  ORDER BY iec.charged_at DESC
  LIMIT 1;
END;
$$;

-- Function to record a new instant estimate charge
CREATE OR REPLACE FUNCTION record_instant_estimate_charge(
  p_organization_id uuid,
  p_property_id text,
  p_address_text text,
  p_credits_charged integer,
  p_transaction_id uuid,
  p_plan_tier text,
  p_user_id uuid
)
RETURNS TABLE (
  charge_id uuid,
  expires_at timestamptz,
  already_charged boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_charge_id uuid;
  v_existing_expires_at timestamptz;
  v_new_charge_id uuid;
  v_new_expires_at timestamptz;
BEGIN
  -- Check for existing valid charge
  SELECT iec.id, iec.expires_at
  INTO v_existing_charge_id, v_existing_expires_at
  FROM instant_estimate_charges iec
  WHERE iec.organization_id = p_organization_id
    AND iec.property_id = p_property_id
    AND iec.expires_at > now()
  LIMIT 1;

  -- If valid charge exists, return it
  IF v_existing_charge_id IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_charge_id, v_existing_expires_at, true;
    RETURN;
  END IF;

  -- Calculate expiration (30 days from now)
  v_new_expires_at := now() + interval '30 days';

  -- Insert new charge record
  INSERT INTO instant_estimate_charges (
    organization_id,
    property_id,
    address_text,
    credits_charged,
    transaction_id,
    plan_tier_at_charge,
    charged_at,
    expires_at,
    created_by
  ) VALUES (
    p_organization_id,
    p_property_id,
    p_address_text,
    p_credits_charged,
    p_transaction_id,
    p_plan_tier,
    now(),
    v_new_expires_at,
    p_user_id
  )
  RETURNING id INTO v_new_charge_id;

  RETURN QUERY SELECT v_new_charge_id, v_new_expires_at, false;
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_instant_estimate_charges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_instant_estimate_charges_updated_at ON instant_estimate_charges;
CREATE TRIGGER trigger_update_instant_estimate_charges_updated_at
  BEFORE UPDATE ON instant_estimate_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimate_charges_updated_at();
