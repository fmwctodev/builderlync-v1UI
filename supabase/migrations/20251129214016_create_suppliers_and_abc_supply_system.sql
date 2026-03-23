/*
  # Create Suppliers and ABC Supply Integration System

  1. New Tables
    - `suppliers`
      - Core supplier information for material vendors
      - Supports ABC Supply, Home Depot, SRS, Beacon, and custom suppliers
      - Stores encrypted API credentials for integrations
      - Tracks payment terms and delivery preferences
    
    - `abc_supply_branches`
      - ABC Supply branch/location information
      - Store details for preferred branches
      - Track distance and contact information
    
    - `abc_supply_products_cache`
      - Cached product catalog from ABC Supply API
      - Synced periodically to reduce API calls
      - Includes pricing, availability, and product details
    
    - `supplier_contacts`
      - Contact persons at supplier companies
      - Sales reps, account managers, delivery coordinators

  2. Security
    - Enable RLS on all tables
    - Users can view suppliers in their organization
    - Only admins/owners can create/update suppliers
    - API credentials are encrypted in jsonb field

  3. Indexes
    - Supplier lookup by type and status
    - ABC product search by SKU and name
    - Branch location queries

  4. Features
    - Multi-supplier support
    - ABC Supply API integration ready
    - Branch preference management
    - Product catalog caching
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  supplier_type text NOT NULL CHECK (supplier_type IN ('abc_supply', 'home_depot', 'srs', 'beacon', 'custom')),
  
  -- Contact Information
  contact_name text,
  phone text,
  email text,
  website text,
  
  -- Address
  address text,
  city text,
  state text,
  zip_code text,
  
  -- Account Information
  account_number text,
  payment_terms text DEFAULT 'Net 30',
  credit_limit numeric(12, 2),
  
  -- Integration Settings
  is_integration_enabled boolean DEFAULT false,
  api_credentials jsonb, -- Encrypted credentials stored here
  
  -- Delivery Preferences
  preferred_delivery_days text[], -- Array of day names
  lead_time_days integer DEFAULT 2,
  minimum_order_amount numeric(12, 2),
  delivery_fee numeric(10, 2),
  
  -- Status and Notes
  is_active boolean DEFAULT true,
  is_preferred boolean DEFAULT false,
  notes text,
  internal_notes text,
  
  -- Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ABC Supply branches table
CREATE TABLE IF NOT EXISTS abc_supply_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- ABC Supply specific identifiers
  branch_code text,
  abc_branch_id text, -- External ABC Supply branch ID
  
  -- Branch Information
  branch_name text NOT NULL,
  phone text,
  email text,
  fax text,
  
  -- Address
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  
  -- Location
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  distance_miles numeric(8, 2),
  
  -- Operating Information
  hours_of_operation jsonb, -- Store hours by day
  services_offered text[], -- Array of services
  
  -- Preferences
  is_preferred boolean DEFAULT false,
  is_active boolean DEFAULT true,
  notes text,
  
  -- Metadata
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ABC Supply products cache table
CREATE TABLE IF NOT EXISTS abc_supply_products_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- ABC Supply Product Information
  abc_product_id text NOT NULL,
  sku text NOT NULL,
  upc text,
  
  -- Product Details
  name text NOT NULL,
  description text,
  category text,
  subcategory text,
  manufacturer text,
  manufacturer_part_number text,
  
  -- Pricing
  unit_price numeric(12, 4),
  list_price numeric(12, 4),
  currency text DEFAULT 'USD',
  unit_of_measure text,
  
  -- Availability
  availability text,
  stock_status text,
  is_available boolean DEFAULT true,
  lead_time_days integer,
  
  -- Product Specifications
  specifications jsonb,
  dimensions jsonb, -- length, width, height, weight
  
  -- Images and Documents
  image_url text,
  thumbnail_url text,
  data_sheet_url text,
  
  -- Sync Information
  last_synced_at timestamptz DEFAULT now(),
  sync_status text DEFAULT 'active',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, abc_product_id)
);

-- Create supplier contacts table
CREATE TABLE IF NOT EXISTS supplier_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  
  -- Contact Information
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  department text,
  
  -- Contact Details
  email text,
  phone text,
  mobile text,
  fax text,
  
  -- Role
  role text, -- sales_rep, account_manager, delivery_coordinator, etc.
  is_primary boolean DEFAULT false,
  
  -- Status
  is_active boolean DEFAULT true,
  notes text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_organization ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_preferred ON suppliers(is_preferred) WHERE is_preferred = true;

CREATE INDEX IF NOT EXISTS idx_abc_branches_organization ON abc_supply_branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_abc_branches_code ON abc_supply_branches(branch_code);
CREATE INDEX IF NOT EXISTS idx_abc_branches_preferred ON abc_supply_branches(is_preferred) WHERE is_preferred = true;
CREATE INDEX IF NOT EXISTS idx_abc_branches_location ON abc_supply_branches(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_abc_products_organization ON abc_supply_products_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_abc_products_sku ON abc_supply_products_cache(sku);
CREATE INDEX IF NOT EXISTS idx_abc_products_abc_id ON abc_supply_products_cache(abc_product_id);
CREATE INDEX IF NOT EXISTS idx_abc_products_name ON abc_supply_products_cache USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_abc_products_category ON abc_supply_products_cache(category);
CREATE INDEX IF NOT EXISTS idx_abc_products_available ON abc_supply_products_cache(is_available) WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier ON supplier_contacts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_primary ON supplier_contacts(is_primary) WHERE is_primary = true;

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE abc_supply_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE abc_supply_products_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Users can view suppliers in their organization"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for ABC Supply branches
CREATE POLICY "Users can view ABC branches in their organization"
  ON abc_supply_branches FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage ABC branches"
  ON abc_supply_branches FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for ABC Supply products cache
CREATE POLICY "Users can view ABC products in their organization"
  ON abc_supply_products_cache FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage ABC products cache"
  ON abc_supply_products_cache FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for supplier contacts
CREATE POLICY "Users can view supplier contacts in their organization"
  ON supplier_contacts FOR SELECT
  TO authenticated
  USING (
    supplier_id IN (
      SELECT id FROM suppliers
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage supplier contacts"
  ON supplier_contacts FOR ALL
  TO authenticated
  USING (
    supplier_id IN (
      SELECT s.id FROM suppliers s
      JOIN organization_members om ON s.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );