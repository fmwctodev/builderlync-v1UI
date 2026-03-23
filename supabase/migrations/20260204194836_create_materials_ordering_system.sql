/*
  # Create Materials & Ordering System Tables
  
  1. New Tables
    - material_orders: Material purchase orders
    - material_order_items: Order line items
    - material_order_history: Order history tracking
    - measurement_business_info: Business info for measurements
    - measurement_products: Measurement products catalog
    - measurement_order_history: Measurement order history
    - abc_supply_accounts: ABC Supply integration
    - abc_supply_branches: ABC Supply branch locations
    - suppliers: General supplier management
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Material Orders Table
CREATE TABLE IF NOT EXISTS material_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  po_number text,
  supplier_id uuid,
  supplier_name text,
  status text DEFAULT 'draft',
  order_date date,
  expected_delivery_date date,
  actual_delivery_date date,
  shipping_address text,
  shipping_method text,
  subtotal numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  total numeric DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE material_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage material orders in their org"
    ON material_orders FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = material_orders.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Material Order Items Table
CREATE TABLE IF NOT EXISTS material_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_order_id uuid NOT NULL REFERENCES material_orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_sku text,
  description text,
  quantity numeric NOT NULL,
  unit text DEFAULT 'each',
  unit_price numeric NOT NULL,
  total_price numeric,
  received_quantity numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE material_order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage material order items"
    ON material_order_items FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM material_orders
        JOIN user_organizations ON user_organizations.organization_id = material_orders.organization_id
        WHERE material_orders.id = material_order_items.material_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Material Order History Table
CREATE TABLE IF NOT EXISTS material_order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_order_id uuid NOT NULL REFERENCES material_orders(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_status text,
  new_status text,
  user_id uuid REFERENCES auth.users(id),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE material_order_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view material order history"
    ON material_order_history FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM material_orders
        JOIN user_organizations ON user_organizations.organization_id = material_orders.organization_id
        WHERE material_orders.id = material_order_history.material_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Measurement Business Info Table
CREATE TABLE IF NOT EXISTS measurement_business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  business_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  billing_address text,
  billing_city text,
  billing_state text,
  billing_zip text,
  default_delivery_method text DEFAULT 'email',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE measurement_business_info ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage measurement business info in their org"
    ON measurement_business_info FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = measurement_business_info.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Measurement Products Table
CREATE TABLE IF NOT EXISTS measurement_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  category text,
  provider text,
  base_price numeric,
  credits_required integer DEFAULT 1,
  turnaround_days integer,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE measurement_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view measurement products"
    ON measurement_products FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Measurement Order History Table
CREATE TABLE IF NOT EXISTS measurement_order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_order_id uuid NOT NULL REFERENCES measurement_orders(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_status text,
  new_status text,
  user_id uuid REFERENCES auth.users(id),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE measurement_order_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view measurement order history"
    ON measurement_order_history FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM measurement_orders
        JOIN user_organizations ON user_organizations.organization_id = measurement_orders.organization_id
        WHERE measurement_orders.id = measurement_order_history.measurement_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ABC Supply Accounts Table
CREATE TABLE IF NOT EXISTS abc_supply_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_number text NOT NULL,
  account_name text,
  is_verified boolean DEFAULT false,
  default_branch_id text,
  api_credentials jsonb,
  last_sync_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, account_number)
);

ALTER TABLE abc_supply_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage ABC Supply accounts in their org"
    ON abc_supply_accounts FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = abc_supply_accounts.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ABC Supply Branches Table
CREATE TABLE IF NOT EXISTS abc_supply_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id text NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  fax text,
  email text,
  location_lat numeric,
  location_lng numeric,
  hours jsonb DEFAULT '{}'::jsonb,
  services jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE abc_supply_branches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view ABC Supply branches"
    ON abc_supply_branches FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'US',
  website text,
  payment_terms text,
  notes text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage suppliers in their org"
    ON suppliers FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = suppliers.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_material_orders_org ON material_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_job ON material_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_status ON material_orders(status);
CREATE INDEX IF NOT EXISTS idx_material_order_items_order ON material_order_items(material_order_id);
CREATE INDEX IF NOT EXISTS idx_material_order_history_order ON material_order_history(material_order_id);
CREATE INDEX IF NOT EXISTS idx_measurement_business_info_org ON measurement_business_info(organization_id);
CREATE INDEX IF NOT EXISTS idx_measurement_order_history_order ON measurement_order_history(measurement_order_id);
CREATE INDEX IF NOT EXISTS idx_abc_supply_accounts_org ON abc_supply_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON suppliers(organization_id);
