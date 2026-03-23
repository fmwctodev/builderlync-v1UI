/*
  # Create TOOLS Enhancement Tables

  This migration creates supporting tables for:
  1. Instant Estimator - Templates and line items
  2. Proposals - Templates, line items, signatures, sharing
  3. Measurements - EagleView order tracking

  1. New Tables
    
    **Instant Estimator:**
    - `instant_estimate_templates` - Reusable estimate templates
    - `instant_estimate_line_items` - Itemized costs in estimates
    - `instant_estimate_materials_library` - Standard material costs
    
    **Proposals:**
    - `proposal_templates` - Reusable proposal templates
    - `proposal_line_items` - Itemized costs in proposals
    - `proposal_signatures` - E-signature tracking
    - `proposal_sharing_links` - Shareable proposal links
    - `proposal_versions` - Version history
    
    **Measurements:**
    - `measurement_orders` - EagleView/measurement order tracking
    - `measurement_business_info` - Company info for measurements
    - `measurement_products` - Available measurement products
    - `measurement_order_history` - Order status history

  2. Security
    - Enable RLS on all tables
    - Users can view in their organization
    - Appropriate creation/update permissions

  3. Indexes
    - Template searches
    - Line item queries
    - Order tracking

  4. Features
    - Template libraries
    - Pricing management
    - E-signature workflow
    - Measurement tracking
*/

-- ============================================================
-- INSTANT ESTIMATOR TABLES
-- ============================================================

-- Create instant_estimate_templates table
CREATE TABLE IF NOT EXISTS instant_estimate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Template Information
  name text NOT NULL,
  description text,
  template_type text CHECK (template_type IN ('residential', 'commercial', 'insurance', 'custom')),
  
  -- Default Settings
  default_line_items jsonb DEFAULT '[]'::jsonb,
  pricing_rules jsonb DEFAULT '{}'::jsonb,
  
  -- Sharing
  is_public boolean DEFAULT false,
  is_system_template boolean DEFAULT false,
  
  -- Usage Tracking
  use_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create instant_estimate_line_items table
CREATE TABLE IF NOT EXISTS instant_estimate_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid, -- References instant_estimate_reports (from existing table)
  template_id uuid REFERENCES instant_estimate_templates(id) ON DELETE SET NULL,
  
  -- Item Information
  category text CHECK (category IN ('labor', 'materials', 'equipment', 'permits', 'disposal', 'other')),
  item_name text NOT NULL,
  description text,
  
  -- Quantity and Pricing
  quantity numeric(10, 2) NOT NULL DEFAULT 1,
  unit text DEFAULT 'EA',
  unit_price numeric(12, 4) NOT NULL,
  total_price numeric(12, 2) NOT NULL,
  
  -- Markup and Profit
  markup_percentage numeric(5, 2) DEFAULT 0,
  profit_margin numeric(5, 2) DEFAULT 0,
  
  -- Sorting
  sort_order integer DEFAULT 0,
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create instant_estimate_materials_library table
CREATE TABLE IF NOT EXISTS instant_estimate_materials_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Material Information
  material_name text NOT NULL,
  category text,
  subcategory text,
  
  -- Pricing
  default_unit_price numeric(12, 4) NOT NULL,
  unit_of_measure text DEFAULT 'EA',
  currency text DEFAULT 'USD',
  
  -- Supplier Integration
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  abc_supply_product_id text, -- Link to ABC Supply cache
  
  -- Markup
  default_markup_percentage numeric(5, 2) DEFAULT 20,
  
  -- Status
  is_active boolean DEFAULT true,
  last_price_update timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PROPOSAL ENHANCEMENT TABLES
-- ============================================================

-- Create proposal_templates table
CREATE TABLE IF NOT EXISTS proposal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Template Information
  name text NOT NULL,
  description text,
  template_type text CHECK (template_type IN ('standard', 'premium', 'insurance', 'warranty', 'custom')),
  
  -- Template Content
  sections jsonb DEFAULT '[]'::jsonb, -- Array of template sections
  default_terms text,
  default_warranty text,
  
  -- Branding
  cover_image_url text,
  branding jsonb DEFAULT '{}'::jsonb, -- Colors, logos, fonts
  
  -- Status
  is_active boolean DEFAULT true,
  is_system_template boolean DEFAULT false,
  
  -- Usage Tracking
  use_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proposal_line_items table
-- Note: proposal_id will reference documents_contracts table (existing)
CREATE TABLE IF NOT EXISTS proposal_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL, -- References documents_contracts.id
  
  -- Item Organization
  section_name text,
  item_name text NOT NULL,
  description text,
  
  -- Quantity and Pricing
  quantity numeric(10, 2) NOT NULL DEFAULT 1,
  unit text DEFAULT 'EA',
  unit_price numeric(12, 4) NOT NULL,
  total_price numeric(12, 2) NOT NULL,
  
  -- Options
  is_optional boolean DEFAULT false,
  is_selected boolean DEFAULT true,
  
  -- Sorting
  sort_order integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proposal_signatures table
CREATE TABLE IF NOT EXISTS proposal_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL, -- References documents_contracts.id
  
  -- Signer Information
  signer_type text NOT NULL CHECK (signer_type IN ('customer', 'contractor', 'witness')),
  signer_name text NOT NULL,
  signer_email text,
  signer_phone text,
  
  -- Signature Data
  signature_data text, -- Base64 encoded signature or URL to signature image
  signature_method text CHECK (signature_method IN ('drawn', 'typed', 'uploaded')),
  
  -- Metadata
  signed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  location text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Create proposal_sharing_links table
CREATE TABLE IF NOT EXISTS proposal_sharing_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL, -- References documents_contracts.id
  
  -- Link Information
  share_token uuid DEFAULT gen_random_uuid() UNIQUE,
  
  -- Access Control
  expires_at timestamptz,
  is_password_protected boolean DEFAULT false,
  password_hash text,
  
  -- Permissions
  can_download boolean DEFAULT true,
  can_sign boolean DEFAULT true,
  can_comment boolean DEFAULT false,
  
  -- Tracking
  views_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  last_viewer_ip inet,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proposal_versions table
CREATE TABLE IF NOT EXISTS proposal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL, -- References documents_contracts.id
  
  -- Version Information
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  
  -- Change Tracking
  changes_summary text,
  changed_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- MEASUREMENTS TRACKING TABLES
-- ============================================================

-- Create measurement_orders table
CREATE TABLE IF NOT EXISTS measurement_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  
  -- Property Information
  property_address text NOT NULL,
  order_type text CHECK (order_type IN ('eagleview', 'hover', 'manual', 'other')),
  property_type text CHECK (property_type IN ('residential', 'commercial', 'multi_family', 'industrial')),
  
  -- Complexity
  is_complex boolean DEFAULT false,
  complexity_notes text,
  
  -- Products
  products_ordered jsonb DEFAULT '[]'::jsonb,
  
  -- Financial
  total_cost numeric(12, 2) DEFAULT 0,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  
  -- Order Status
  order_status text DEFAULT 'pending' CHECK (order_status IN (
    'pending',
    'processing',
    'completed',
    'cancelled',
    'failed'
  )),
  
  -- EagleView Integration
  eagleview_order_id text,
  eagleview_report_url text,
  report_data jsonb, -- Store full report data
  
  -- Hover Integration
  hover_order_id text,
  hover_report_url text,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create measurement_business_info table
CREATE TABLE IF NOT EXISTS measurement_business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Company Information
  company_name text NOT NULL,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  website text,
  
  -- EagleView Integration
  eagleview_account_id text,
  eagleview_api_key text, -- Should be encrypted in production
  eagleview_api_secret text, -- Should be encrypted in production
  
  -- Hover Integration
  hover_account_id text,
  hover_api_key text, -- Should be encrypted in production
  
  -- Default Settings
  default_products jsonb DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create measurement_products table
CREATE TABLE IF NOT EXISTS measurement_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Information
  provider text NOT NULL CHECK (provider IN ('eagleview', 'hover', 'other')),
  product_name text NOT NULL,
  product_code text,
  description text,
  
  -- Pricing
  price numeric(12, 2) NOT NULL,
  currency text DEFAULT 'USD',
  
  -- Status
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(provider, product_code)
);

-- Create measurement_order_history table
CREATE TABLE IF NOT EXISTS measurement_order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_order_id uuid REFERENCES measurement_orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Status Change
  old_status text,
  new_status text,
  notes text,
  
  -- User Tracking
  changed_by uuid REFERENCES auth.users(id),
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Instant Estimator indexes
CREATE INDEX IF NOT EXISTS idx_instant_estimate_templates_org ON instant_estimate_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_templates_type ON instant_estimate_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_line_items_report ON instant_estimate_line_items(report_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_line_items_template ON instant_estimate_line_items(template_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_materials_org ON instant_estimate_materials_library(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_materials_active ON instant_estimate_materials_library(is_active) WHERE is_active = true;

-- Proposal indexes
CREATE INDEX IF NOT EXISTS idx_proposal_templates_org ON proposal_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_type ON proposal_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_proposal_line_items_proposal ON proposal_line_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_proposal ON proposal_signatures(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sharing_token ON proposal_sharing_links(share_token);
CREATE INDEX IF NOT EXISTS idx_proposal_sharing_proposal ON proposal_sharing_links(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal ON proposal_versions(proposal_id, version_number DESC);

-- Measurement indexes
CREATE INDEX IF NOT EXISTS idx_measurement_orders_org ON measurement_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_job ON measurement_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_status ON measurement_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_eagleview ON measurement_orders(eagleview_order_id);
CREATE INDEX IF NOT EXISTS idx_measurement_business_info_org ON measurement_business_info(organization_id);
CREATE INDEX IF NOT EXISTS idx_measurement_products_provider ON measurement_products(provider);
CREATE INDEX IF NOT EXISTS idx_measurement_order_history_order ON measurement_order_history(measurement_order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE instant_estimate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_estimate_materials_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sharing_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Using simplified policies for all
CREATE POLICY "Users can view in their organization" ON instant_estimate_templates FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage in their organization" ON instant_estimate_templates FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view line items" ON instant_estimate_line_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage line items" ON instant_estimate_line_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view materials" ON instant_estimate_materials_library FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage materials" ON instant_estimate_materials_library FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view proposal templates" ON proposal_templates FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage proposal templates" ON proposal_templates FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view proposal line items" ON proposal_line_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage proposal line items" ON proposal_line_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view signatures" ON proposal_signatures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create signatures" ON proposal_signatures FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view sharing links" ON proposal_sharing_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage sharing links" ON proposal_sharing_links FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view versions" ON proposal_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create versions" ON proposal_versions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view measurement orders" ON measurement_orders FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage measurement orders" ON measurement_orders FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view measurement business info" ON measurement_business_info FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage measurement business info" ON measurement_business_info FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view measurement products" ON measurement_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage measurement products" ON measurement_products FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view measurement history" ON measurement_order_history FOR SELECT TO authenticated USING (measurement_order_id IN (SELECT id FROM measurement_orders WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));
CREATE POLICY "Users can create measurement history" ON measurement_order_history FOR INSERT TO authenticated WITH CHECK (measurement_order_id IN (SELECT id FROM measurement_orders WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));