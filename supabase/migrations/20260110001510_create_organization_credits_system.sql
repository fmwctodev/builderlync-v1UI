/*
  # Create Organization Credits System

  1. New Tables
    - `organization_credits`
      - `id` (uuid, primary key) - Unique identifier for the credit record
      - `organization_id` (uuid, FK to organizations) - The organization this credit balance belongs to
      - `balance` (decimal) - Current credit balance (non-negative)
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated

    - `credit_transactions`
      - `id` (uuid, primary key) - Unique identifier for the transaction
      - `organization_id` (uuid, FK to organizations) - The organization this transaction belongs to
      - `amount` (decimal) - Transaction amount (positive for credits, negative for debits)
      - `transaction_type` (text) - Type: 'credit' or 'debit'
      - `description` (text) - Human-readable description of the transaction
      - `reference_type` (text) - Type of reference (e.g., 'measurement_order', 'manual_adjustment', 'purchase')
      - `reference_id` (text) - Optional reference to related record
      - `created_at` (timestamptz) - When the transaction occurred
      - `created_by` (uuid) - User who initiated the transaction

  2. Security
    - Enable RLS on both tables
    - Add policies for organization members to view their credits and transactions
    - Only system/admin can modify credits (via functions)

  3. Functions
    - `get_organization_credit_balance(org_id)` - Get current balance
    - `deduct_credits(org_id, amount, description)` - Atomically deduct credits
    - `add_credits(org_id, amount, description)` - Atomically add credits

  4. Triggers
    - Auto-update `updated_at` on organization_credits changes
    - Auto-create credit record when organization is created
*/

-- Create organization_credits table
CREATE TABLE IF NOT EXISTS organization_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  balance decimal(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organization_credits_organization_unique UNIQUE (organization_id)
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount decimal(12, 2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  description text NOT NULL,
  reference_type text,
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_credits_org_id ON organization_credits(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_org_id ON credit_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);

-- Enable RLS
ALTER TABLE organization_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_credits
CREATE POLICY "Organization members can view their credit balance"
  ON organization_credits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_credits.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

-- RLS Policies for credit_transactions
CREATE POLICY "Organization members can view their credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = credit_transactions.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_organization_credits_updated_at ON organization_credits;
CREATE TRIGGER trigger_organization_credits_updated_at
  BEFORE UPDATE ON organization_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_credits_updated_at();

-- Function to get organization credit balance
CREATE OR REPLACE FUNCTION get_organization_credit_balance(org_id uuid)
RETURNS decimal AS $$
DECLARE
  current_balance decimal;
BEGIN
  SELECT balance INTO current_balance
  FROM organization_credits
  WHERE organization_id = org_id;
  
  IF current_balance IS NULL THEN
    RETURN 0.00;
  END IF;
  
  RETURN current_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(
  org_id uuid,
  deduct_amount decimal,
  deduct_description text,
  ref_type text DEFAULT NULL,
  ref_id text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  current_balance decimal;
  new_balance decimal;
  transaction_id uuid;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT balance INTO current_balance
  FROM organization_credits
  WHERE organization_id = org_id
  FOR UPDATE;
  
  -- Check if organization has credits record
  IF current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No credit record found for organization'
    );
  END IF;
  
  -- Check if sufficient balance
  IF current_balance < deduct_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credit balance',
      'current_balance', current_balance,
      'requested_amount', deduct_amount
    );
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - deduct_amount;
  
  -- Update the balance
  UPDATE organization_credits
  SET balance = new_balance
  WHERE organization_id = org_id;
  
  -- Record the transaction
  INSERT INTO credit_transactions (
    organization_id,
    amount,
    transaction_type,
    description,
    reference_type,
    reference_id,
    created_by
  )
  VALUES (
    org_id,
    -deduct_amount,
    'debit',
    deduct_description,
    ref_type,
    ref_id,
    auth.uid()
  )
  RETURNING id INTO transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance,
    'transaction_id', transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits atomically
CREATE OR REPLACE FUNCTION add_credits(
  org_id uuid,
  add_amount decimal,
  add_description text,
  ref_type text DEFAULT NULL,
  ref_id text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  new_balance decimal;
  transaction_id uuid;
BEGIN
  -- Ensure organization has a credit record, create if not exists
  INSERT INTO organization_credits (organization_id, balance)
  VALUES (org_id, 0)
  ON CONFLICT (organization_id) DO NOTHING;
  
  -- Update the balance with lock
  UPDATE organization_credits
  SET balance = balance + add_amount
  WHERE organization_id = org_id
  RETURNING balance INTO new_balance;
  
  -- Record the transaction
  INSERT INTO credit_transactions (
    organization_id,
    amount,
    transaction_type,
    description,
    reference_type,
    reference_id,
    created_by
  )
  VALUES (
    org_id,
    add_amount,
    'credit',
    add_description,
    ref_type,
    ref_id,
    auth.uid()
  )
  RETURNING id INTO transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance,
    'transaction_id', transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize credits for new organizations (called by trigger)
CREATE OR REPLACE FUNCTION initialize_organization_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_credits (organization_id, balance)
  VALUES (NEW.id, 0.00)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create credit record for new organizations
DROP TRIGGER IF EXISTS trigger_initialize_organization_credits ON organizations;
CREATE TRIGGER trigger_initialize_organization_credits
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION initialize_organization_credits();

-- Initialize credits for existing organizations that don't have records
INSERT INTO organization_credits (organization_id, balance)
SELECT id, 0.00
FROM organizations
WHERE id NOT IN (SELECT organization_id FROM organization_credits)
ON CONFLICT (organization_id) DO NOTHING;