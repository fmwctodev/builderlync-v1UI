/*
  # Add Measurement Reports and Related Tables
  
  Essential tables for:
  - Instant Estimator Reports
  - Measurement Orders
  - Property Data
  - Organization Credits
*/

-- ============================================================================
-- Instant Estimate Reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS instant_estimate_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  report_number text,
  property_address text NOT NULL,
  status text DEFAULT 'pending',
  report_type text,
  report_data jsonb DEFAULT '{}'::jsonb,
  imagery_urls jsonb DEFAULT '[]'::jsonb,
  measurements jsonb DEFAULT '{}'::jsonb,
  cost numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instant_reports_org ON instant_estimate_reports(organization_id);

-- ============================================================================
-- Measurement Orders
-- ============================================================================

CREATE TABLE IF NOT EXISTS measurement_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  order_number text,
  property_address text NOT NULL,
  order_source text DEFAULT 'manual',
  product_type text NOT NULL,
  status text DEFAULT 'pending',
  external_order_id text,
  report_data jsonb DEFAULT '{}'::jsonb,
  cost numeric(12,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_measurement_orders_org ON measurement_orders(organization_id);

-- ============================================================================
-- Property Data Cache
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_address text NOT NULL,
  data_source text NOT NULL,
  response_format text,
  cached_data jsonb NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, property_address, data_source)
);

CREATE INDEX IF NOT EXISTS idx_property_cache_org ON property_data_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_cache_address ON property_data_cache(property_address);

-- ============================================================================
-- Organization Credits
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  credit_type text NOT NULL,
  balance integer DEFAULT 0,
  total_purchased integer DEFAULT 0,
  total_used integer DEFAULT 0,
  last_transaction_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, credit_type)
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  credit_type text NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  reference_id uuid,
  reference_type text,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_credits_org ON organization_credits(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_trans_org ON credit_transactions(organization_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE instant_estimate_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization reports"
  ON instant_estimate_reports FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization reports"
  ON instant_estimate_reports FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can view organization measurement orders"
  ON measurement_orders FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization measurement orders"
  ON measurement_orders FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can view organization property cache"
  ON property_data_cache FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization property cache"
  ON property_data_cache FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can view organization credits"
  ON organization_credits FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization credits"
  ON organization_credits FOR ALL
  TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can view organization credit transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create organization credit transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_has_org_access(organization_id));
