/*
  # Create Organization Pricing Catalog Table

  1. New Tables
    - `org_pricing_catalog`
      - `id` (uuid, primary key) - Unique identifier
      - `organization_id` (uuid, not null) - References organizations table
      - `sku` (text, not null) - Stock keeping unit identifier
      - `name` (text, not null) - Display name
      - `description` (text) - Optional description
      - `default_unit_price` (decimal) - Default price per unit
      - `unit` (text, not null) - Unit of measurement (bundle, roll, allowance, etc.)
      - `category` (text) - Category for grouping (roofing_materials, accessories, labor)
      - `is_active` (boolean) - Whether item is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `org_pricing_catalog` table
    - Add policies for organization members to manage catalog

  3. Indexes
    - Unique constraint on (organization_id, sku)
    - Index on organization_id
    - Index on category

  4. Default Catalog Function
    - Function to seed default catalog items for new organizations
*/

CREATE TABLE IF NOT EXISTS org_pricing_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  description text,
  default_unit_price decimal DEFAULT 0,
  unit text NOT NULL,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, sku)
);

ALTER TABLE org_pricing_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view pricing catalog"
  ON org_pricing_catalog
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = org_pricing_catalog.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

CREATE POLICY "Organization admins can manage pricing catalog"
  ON org_pricing_catalog
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = org_pricing_catalog.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = org_pricing_catalog.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_org_pricing_catalog_organization_id ON org_pricing_catalog(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_pricing_catalog_category ON org_pricing_catalog(category);
CREATE INDEX IF NOT EXISTS idx_org_pricing_catalog_is_active ON org_pricing_catalog(is_active) WHERE is_active = true;

CREATE OR REPLACE FUNCTION seed_default_pricing_catalog(p_organization_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO org_pricing_catalog (organization_id, sku, name, description, default_unit_price, unit, category)
  VALUES
    (p_organization_id, 'shingles_bundle', 'Shingles (Bundle)', 'Standard architectural shingles per bundle', 0, 'bundle', 'roofing_materials'),
    (p_organization_id, 'underlayment_roll', 'Underlayment (Roll)', 'Synthetic underlayment per roll', 0, 'roll', 'roofing_materials'),
    (p_organization_id, 'starter_allowance', 'Starter Strip', 'Starter strip shingles allowance', 0, 'allowance', 'accessories'),
    (p_organization_id, 'ridgecap_allowance', 'Ridge Cap', 'Ridge cap shingles allowance', 0, 'allowance', 'accessories'),
    (p_organization_id, 'dripedge_allowance', 'Drip Edge', 'Drip edge flashing allowance', 0, 'allowance', 'accessories'),
    (p_organization_id, 'ice_water_shield', 'Ice & Water Shield', 'Ice and water shield underlayment', 0, 'roll', 'roofing_materials'),
    (p_organization_id, 'flashing_allowance', 'Flashing', 'Metal flashing materials allowance', 0, 'allowance', 'accessories'),
    (p_organization_id, 'vents_allowance', 'Roof Vents', 'Roof ventilation allowance', 0, 'allowance', 'accessories'),
    (p_organization_id, 'nails_allowance', 'Roofing Nails', 'Coil roofing nails allowance', 0, 'allowance', 'accessories'),
    (p_organization_id, 'labor_sqft', 'Labor (per sq ft)', 'Installation labor per square foot', 0, 'sqft', 'labor'),
    (p_organization_id, 'tear_off_sqft', 'Tear Off (per sq ft)', 'Removal of existing roofing per square foot', 0, 'sqft', 'labor'),
    (p_organization_id, 'disposal_allowance', 'Disposal', 'Debris disposal and cleanup allowance', 0, 'allowance', 'labor')
  ON CONFLICT (organization_id, sku) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION update_org_pricing_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_org_pricing_catalog_updated_at
  BEFORE UPDATE ON org_pricing_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_org_pricing_catalog_updated_at();