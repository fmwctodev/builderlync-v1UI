/*
  # Create Brand Board System

  1. Tables: brand_assets, brand_guidelines
  2. Features: Brand asset library, usage guidelines
*/

CREATE TABLE IF NOT EXISTS brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  asset_name text NOT NULL,
  asset_url text NOT NULL,
  thumbnail_url text,
  file_size bigint,
  mime_type text,
  width integer,
  height integer,
  version integer DEFAULT 1,
  parent_version_id uuid REFERENCES brand_assets(id) ON DELETE SET NULL,
  description text,
  tags text[] DEFAULT ARRAY[]::text[],
  download_count integer DEFAULT 0,
  last_downloaded_at timestamptz,
  is_primary boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brand_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guideline_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  display_order integer DEFAULT 0,
  examples jsonb DEFAULT '[]'::jsonb,
  dos_and_donts jsonb DEFAULT '{}'::jsonb,
  is_published boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_org ON brand_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_org ON brand_guidelines(organization_id);

ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view brand assets" ON brand_assets FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage brand assets" ON brand_assets FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Members view brand guidelines" ON brand_guidelines FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage brand guidelines" ON brand_guidelines FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));
