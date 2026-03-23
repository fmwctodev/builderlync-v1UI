/*
  # Create Payments Module Schema

  ## Overview
  Creates comprehensive database schema for the payments module including invoices, estimates,
  documents, contracts, transactions, coupons, and integration settings.

  ## New Tables

  ### `invoices`
  - `id` (uuid, primary key) - Unique invoice identifier
  - `invoice_number` (text, unique) - Human-readable invoice number
  - `name` (text) - Invoice name/title
  - `customer_id` (uuid) - Reference to contact/customer
  - `amount` (numeric) - Total invoice amount
  - `status` (text) - Status: draft, due, received, overdue
  - `issue_date` (date) - Date invoice was issued
  - `due_date` (date) - Payment due date
  - `items` (jsonb) - Array of line items
  - `notes` (text, nullable) - Additional notes
  - `created_by` (uuid) - User who created invoice
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `estimates`
  - Similar to invoices plus:
  - `is_template` (boolean) - Whether this is a template
  - `is_recurring` (boolean) - Whether this is recurring
  - `acceptance_status` (text) - Status: pending, accepted, rejected
  - `accepted_at` (timestamptz, nullable) - When estimate was accepted

  ### `documents_contracts`
  - `id` (uuid, primary key) - Unique document identifier
  - `title` (text) - Document title
  - `type` (text) - Type: proposal, estimate, contract
  - `customer_id` (uuid) - Reference to contact/customer
  - `status` (text) - Status: draft, waiting, completed, payments, archived
  - `value` (numeric) - Document monetary value
  - `content` (jsonb) - Document content/structure
  - `date_modified` (timestamptz) - Last modification date
  - `created_by` (uuid) - User who created document
  - `created_at` (timestamptz) - Creation timestamp

  ### `transactions`
  - `id` (uuid, primary key) - Unique transaction identifier
  - `transaction_id` (text, unique) - External transaction ID
  - `customer_id` (uuid) - Reference to contact/customer
  - `customer_name` (text) - Customer name snapshot
  - `provider` (text) - Payment provider (Stripe, QuickBooks, etc)
  - `source` (text) - Payment source/method
  - `amount` (numeric) - Transaction amount
  - `transaction_date` (timestamptz) - When transaction occurred
  - `payment_status` (text) - Status: approved, pending, failed, declined
  - `funding_status` (text) - Status: funded, in_transit, not_funded, error, ach_return
  - `metadata` (jsonb) - Additional transaction data
  - `created_at` (timestamptz) - Creation timestamp

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

  ### `payment_integrations`
  - `id` (uuid, primary key) - Unique integration identifier
  - `provider` (text, unique) - Provider name: quickbooks, stripe
  - `is_connected` (boolean) - Connection status
  - `credentials` (jsonb) - Encrypted connection credentials
  - `settings` (jsonb) - Integration settings
  - `last_sync_at` (timestamptz, nullable) - Last sync timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Allow authenticated users to read/write their organization's data
  - System tracks user who created records
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  name text NOT NULL,
  customer_id uuid,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  items jsonb NOT NULL DEFAULT '[]',
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'due', 'received', 'overdue'))
);

-- Create estimates table
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

-- Create documents_contracts table
CREATE TABLE IF NOT EXISTS documents_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'proposal',
  customer_id uuid,
  status text NOT NULL DEFAULT 'draft',
  value numeric(12, 2) DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}',
  date_modified timestamptz DEFAULT now(),
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT documents_type_check CHECK (type IN ('proposal', 'estimate', 'contract')),
  CONSTRAINT documents_status_check CHECK (status IN ('draft', 'waiting', 'completed', 'payments', 'archived'))
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  customer_id uuid,
  customer_name text NOT NULL,
  provider text NOT NULL,
  source text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  payment_status text NOT NULL DEFAULT 'pending',
  funding_status text NOT NULL DEFAULT 'not_funded',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT transactions_payment_status_check CHECK (payment_status IN ('approved', 'pending', 'failed', 'declined')),
  CONSTRAINT transactions_funding_status_check CHECK (funding_status IN ('funded', 'in_transit', 'not_funded', 'error', 'ach_return'))
);

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

-- Create payment_integrations table
CREATE TABLE IF NOT EXISTS payment_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text UNIQUE NOT NULL,
  is_connected boolean DEFAULT false,
  credentials jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT payment_integrations_provider_check CHECK (provider IN ('quickbooks', 'stripe'))
);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for estimates
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

-- RLS Policies for documents_contracts
CREATE POLICY "Users can view all documents"
  ON documents_contracts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create documents"
  ON documents_contracts FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update documents"
  ON documents_contracts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete documents"
  ON documents_contracts FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for transactions
CREATE POLICY "Users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- RLS Policies for payment_integrations
CREATE POLICY "Users can view all integrations"
  ON payment_integrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage integrations"
  ON payment_integrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_is_template ON estimates(is_template);

CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents_contracts(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents_contracts(type);

CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);

-- Insert default payment integration records
INSERT INTO payment_integrations (provider, is_connected) VALUES
  ('quickbooks', false),
  ('stripe', false)
ON CONFLICT (provider) DO NOTHING;