/*
  # Create Stripe Integration System Tables
  
  1. New Tables
    - stripe_customers: Stripe customer mapping
    - stripe_subscriptions: Subscription tracking
    - stripe_orders: Order tracking
    - stripe_products: Product catalog
    - stripe_prices: Price definitions
    - stripe_invoices: Invoice sync
    - stripe_payments: Payment tracking
    - stripe_events: Webhook events
    - stripe_sync_log: Sync logging
    - credit_packages: Credit package catalog
    - credit_purchases: Credit purchase history
    - coupons: Discount coupons
    - payment_integrations: Payment processor connections
    
  2. Security
    - Enable RLS on all tables
    - User/organization-scoped access
*/

-- Stripe Customers Table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE,
  email text,
  name text,
  phone text,
  default_payment_method_id text,
  balance integer DEFAULT 0,
  currency text DEFAULT 'usd',
  is_deleted boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own stripe customer"
    ON stripe_customers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Subscriptions Table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_price_id text,
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  quantity integer DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own stripe subscriptions"
    ON stripe_subscriptions FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM stripe_customers
        WHERE stripe_customers.id = stripe_subscriptions.customer_id
        AND stripe_customers.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Orders Table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  checkout_session_id text UNIQUE,
  payment_intent_id text,
  status text DEFAULT 'pending',
  amount_total integer,
  currency text DEFAULT 'usd',
  line_items jsonb DEFAULT '[]'::jsonb,
  shipping_details jsonb,
  billing_details jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own stripe orders"
    ON stripe_orders FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM stripe_customers
        WHERE stripe_customers.id = stripe_orders.customer_id
        AND stripe_customers.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Products Table
CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  product_type text,
  images jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view stripe products"
    ON stripe_products FOR SELECT
    TO authenticated
    USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Prices Table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES stripe_products(id) ON DELETE CASCADE,
  stripe_price_id text NOT NULL UNIQUE,
  currency text DEFAULT 'usd',
  unit_amount integer,
  recurring_interval text,
  recurring_interval_count integer,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view stripe prices"
    ON stripe_prices FOR SELECT
    TO authenticated
    USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Invoices Table
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  stripe_invoice_id text NOT NULL UNIQUE,
  subscription_id text,
  status text,
  amount_due integer,
  amount_paid integer,
  amount_remaining integer,
  currency text DEFAULT 'usd',
  invoice_pdf text,
  hosted_invoice_url text,
  due_date timestamptz,
  paid_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own stripe invoices"
    ON stripe_invoices FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM stripe_customers
        WHERE stripe_customers.id = stripe_invoices.customer_id
        AND stripe_customers.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Payments Table
CREATE TABLE IF NOT EXISTS stripe_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  stripe_charge_id text,
  amount integer NOT NULL,
  currency text DEFAULT 'usd',
  status text,
  payment_method_type text,
  receipt_url text,
  failure_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own stripe payments"
    ON stripe_payments FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM stripe_customers
        WHERE stripe_customers.id = stripe_payments.customer_id
        AND stripe_customers.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Events Table
CREATE TABLE IF NOT EXISTS stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  data jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access stripe events
DO $$ BEGIN
  CREATE POLICY "Service role can manage stripe events"
    ON stripe_events FOR ALL
    TO service_role
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe Sync Log Table
CREATE TABLE IF NOT EXISTS stripe_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  stripe_id text,
  action text NOT NULL,
  status text DEFAULT 'success',
  error_message text,
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_sync_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access stripe sync log
DO $$ BEGIN
  CREATE POLICY "Service role can manage stripe sync log"
    ON stripe_sync_log FOR ALL
    TO service_role
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Credit Packages Table
CREATE TABLE IF NOT EXISTS credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  credits integer NOT NULL,
  price_cents integer NOT NULL,
  stripe_price_id text,
  bonus_credits integer DEFAULT 0,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active credit packages"
    ON credit_packages FOR SELECT
    TO authenticated
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Credit Purchases Table
CREATE TABLE IF NOT EXISTS credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  package_id uuid REFERENCES credit_packages(id),
  credits_purchased integer NOT NULL,
  bonus_credits integer DEFAULT 0,
  amount_paid integer NOT NULL,
  currency text DEFAULT 'usd',
  stripe_payment_id text,
  stripe_checkout_session_id text,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view credit purchases in their org"
    ON credit_purchases FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = credit_purchases.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text,
  discount_type text NOT NULL,
  discount_value numeric NOT NULL,
  min_purchase_amount numeric,
  max_discount_amount numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  applicable_products jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, code)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage coupons in their org"
    ON coupons FOR ALL
    TO authenticated
    USING (
      organization_id IS NULL OR
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = coupons.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payment Integrations Table
CREATE TABLE IF NOT EXISTS payment_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  provider text NOT NULL DEFAULT 'stripe',
  is_connected boolean DEFAULT false,
  account_id text,
  access_token text,
  refresh_token text,
  publishable_key text,
  webhook_secret text,
  capabilities jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  last_verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_integrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage payment integrations in their org"
    ON payment_integrations FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = payment_integrations.organization_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('owner', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_org ON stripe_customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer ON stripe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product ON stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_customer ON stripe_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_customer ON stripe_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_org ON credit_purchases(organization_id);
CREATE INDEX IF NOT EXISTS idx_coupons_org ON coupons(organization_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_payment_integrations_org ON payment_integrations(organization_id);
