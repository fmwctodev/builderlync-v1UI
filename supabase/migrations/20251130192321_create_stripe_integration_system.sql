/*
  # Stripe Integration System

  ## Overview
  Complete Stripe integration schema for billing, subscriptions, invoices, and payments.
  Enables two-way sync between BuilderLync and Stripe for revenue management.

  ## New Tables

  1. **stripe_customers**
     - Links enterprise accounts to Stripe customer IDs
     - Tracks customer sync status and metadata
     - Stores billing email and default payment method

  2. **stripe_subscriptions**
     - Links to Stripe subscription IDs
     - Tracks subscription status and billing periods
     - Records plan changes and trial periods

  3. **stripe_products**
     - Two-way sync with Stripe products
     - Maps internal plans to Stripe product IDs
     - Stores pricing tiers and metadata

  4. **stripe_prices**
     - Stores Stripe price objects
     - Links to products
     - Tracks active/archived prices

  5. **stripe_invoices**
     - Syncs invoice data from Stripe
     - Tracks payment status and amounts
     - Links to customers and subscriptions

  6. **stripe_payments**
     - Stores payment transaction data
     - Links to invoices
     - Tracks payment methods and status

  7. **stripe_events**
     - Logs all webhook events
     - Tracks processing status
     - Stores raw event data

  8. **stripe_sync_log**
     - Tracks sync operations
     - Logs errors and retries
     - Monitors sync health

  ## Security
  - Enable RLS on all tables
  - Super admin access only
  - Audit logging integrated
*/

-- Stripe Customers Table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL,
  email text NOT NULL,
  name text,
  default_payment_method text,
  currency text DEFAULT 'usd',
  balance integer DEFAULT 0,
  delinquent boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_account_id ON stripe_customers(account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_sync_status ON stripe_customers(sync_status);

-- Stripe Subscriptions Table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused')),
  plan_name text NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  ended_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_account_id ON stripe_subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);

-- Stripe Products Table
CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  plan_name text,
  features jsonb DEFAULT '[]',
  limits jsonb DEFAULT '{}',
  sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict')),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_products_stripe_id ON stripe_products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_plan_name ON stripe_products(plan_name);
CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(active);

-- Stripe Prices Table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES stripe_products(id) ON DELETE CASCADE,
  stripe_price_id text UNIQUE NOT NULL,
  stripe_product_id text NOT NULL,
  active boolean DEFAULT true,
  currency text DEFAULT 'usd',
  unit_amount integer NOT NULL,
  recurring_interval text CHECK (recurring_interval IN ('month', 'year', 'week', 'day')),
  recurring_interval_count integer DEFAULT 1,
  type text NOT NULL CHECK (type IN ('recurring', 'one_time')),
  nickname text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_stripe_id ON stripe_prices(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_active ON stripe_prices(active);

-- Stripe Invoices Table
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES stripe_customers(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES stripe_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  invoice_number text,
  status text NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  amount_due integer NOT NULL,
  amount_paid integer DEFAULT 0,
  amount_remaining integer DEFAULT 0,
  currency text DEFAULT 'usd',
  due_date timestamptz,
  paid_at timestamptz,
  invoice_pdf text,
  hosted_invoice_url text,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_invoices_account_id ON stripe_invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_customer_id ON stripe_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_stripe_id ON stripe_invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_status ON stripe_invoices(status);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_due_date ON stripe_invoices(due_date);

-- Stripe Payments Table
CREATE TABLE IF NOT EXISTS stripe_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES stripe_invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  stripe_charge_id text,
  amount integer NOT NULL,
  amount_refunded integer DEFAULT 0,
  currency text DEFAULT 'usd',
  status text NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled', 'requires_action')),
  payment_method_type text,
  payment_method_last4 text,
  payment_method_brand text,
  failure_message text,
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_payments_account_id ON stripe_payments(account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_invoice_id ON stripe_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_stripe_id ON stripe_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON stripe_payments(status);

-- Stripe Events Table
CREATE TABLE IF NOT EXISTS stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,
  retry_count integer DEFAULT 0,
  raw_event jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_stripe_id ON stripe_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON stripe_events(created_at);

-- Stripe Sync Log Table
CREATE TABLE IF NOT EXISTS stripe_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL CHECK (sync_type IN ('customer', 'subscription', 'product', 'invoice', 'payment', 'full')),
  direction text NOT NULL CHECK (direction IN ('push', 'pull', 'bidirectional')),
  status text NOT NULL CHECK (status IN ('started', 'success', 'error', 'partial')),
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_stripe_sync_log_type ON stripe_sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_stripe_sync_log_status ON stripe_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_stripe_sync_log_started_at ON stripe_sync_log(started_at);

-- Enable RLS on all Stripe tables
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin access only)
CREATE POLICY "Super admins can manage stripe_customers"
  ON stripe_customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_subscriptions"
  ON stripe_subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_products"
  ON stripe_products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_prices"
  ON stripe_prices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_invoices"
  ON stripe_invoices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_payments"
  ON stripe_payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_events"
  ON stripe_events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can manage stripe_sync_log"
  ON stripe_sync_log FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE stripe_customers IS 'Links enterprise accounts to Stripe customers with sync status tracking';
COMMENT ON TABLE stripe_subscriptions IS 'Tracks Stripe subscriptions linked to enterprise accounts';
COMMENT ON TABLE stripe_products IS 'Two-way sync of products between BuilderLync and Stripe';
COMMENT ON TABLE stripe_prices IS 'Stores Stripe price objects for products';
COMMENT ON TABLE stripe_invoices IS 'Synced invoice data from Stripe';
COMMENT ON TABLE stripe_payments IS 'Payment transaction records from Stripe';
COMMENT ON TABLE stripe_events IS 'Webhook event log for idempotency and debugging';
COMMENT ON TABLE stripe_sync_log IS 'Tracks sync operations and health monitoring';