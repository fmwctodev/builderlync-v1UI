/*
  # Create Instant Estimator Settings System

  This migration creates the database schema for the enhanced Instant Estimator
  widget builder settings, matching Roofr's functionality.

  ## New Tables

  1. `instant_estimator_global_settings`
     - Organization-wide settings for Instant Estimator
     - `id` (UUID, primary key)
     - `organization_id` (UUID, foreign key to organizations)
     - `google_reviews_enabled` (boolean) - Whether to show Google Reviews
     - `project_showcase_id` (text) - CompanyCam/Project Showcase ID
     - `created_at`, `updated_at` timestamps

  2. `instant_estimator_materials`
     - Materials with pitch-based pricing for each estimator
     - `id` (UUID, primary key)
     - `organization_id` (UUID, foreign key)
     - `estimator_id` (text) - Reference to instant estimator
     - `name` (text) - Material name
     - `material_type` (text) - Type: Asphalt, Metal, Tile, etc.
     - `image_url` (text, nullable) - Thumbnail image
     - `low_price` (decimal, nullable) - Price for low pitch roofs
     - `moderate_price` (decimal, nullable) - Price for moderate pitch
     - `steep_price` (decimal, nullable) - Price for steep pitch
     - `flat_price` (decimal, nullable) - Price for flat roofs
     - `multi_story_surcharge` (decimal, nullable) - Additional cost for multi-story
     - `sort_order` (integer) - Display order
     - `created_at`, `updated_at` timestamps

  3. `instant_estimator_configs`
     - Per-estimator configuration settings
     - `id` (UUID, primary key)
     - `organization_id` (UUID, foreign key)
     - `estimator_id` (text) - Reference to instant estimator
     - `default_job_owner_id` (UUID, nullable) - Default assignee for leads
     - `scheduling_link` (text, nullable) - Calendar booking link
     - `financing_link` (text, nullable) - Financing page URL
     - `show_customer_reviews` (boolean) - Toggle for reviews display
     - `show_social_media` (boolean) - Toggle for social media links
     - `show_project_showcase` (boolean) - Toggle for project showcase
     - `pricing_settings` (JSONB) - Pricing configuration
     - `created_at`, `updated_at` timestamps

  ## Security
  - RLS enabled on all tables
  - Organization-scoped access policies
*/

-- Create instant_estimator_global_settings table
CREATE TABLE IF NOT EXISTS instant_estimator_global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  google_reviews_enabled BOOLEAN DEFAULT false,
  project_showcase_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique constraint on organization_id (one settings record per org)
CREATE UNIQUE INDEX IF NOT EXISTS idx_instant_estimator_global_settings_org 
  ON instant_estimator_global_settings(organization_id);

-- Create instant_estimator_materials table
CREATE TABLE IF NOT EXISTS instant_estimator_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  estimator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  material_type TEXT NOT NULL DEFAULT 'Asphalt',
  image_url TEXT,
  low_price DECIMAL(10, 2),
  moderate_price DECIMAL(10, 2),
  steep_price DECIMAL(10, 2),
  flat_price DECIMAL(10, 2),
  multi_story_surcharge DECIMAL(10, 2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for materials table
CREATE INDEX IF NOT EXISTS idx_instant_estimator_materials_org 
  ON instant_estimator_materials(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimator_materials_estimator 
  ON instant_estimator_materials(estimator_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimator_materials_org_estimator 
  ON instant_estimator_materials(organization_id, estimator_id);

-- Create instant_estimator_configs table
CREATE TABLE IF NOT EXISTS instant_estimator_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  estimator_id TEXT NOT NULL,
  default_job_owner_id UUID,
  scheduling_link TEXT,
  financing_link TEXT,
  show_customer_reviews BOOLEAN DEFAULT false,
  show_social_media BOOLEAN DEFAULT false,
  show_project_showcase BOOLEAN DEFAULT false,
  pricing_settings JSONB DEFAULT '{
    "restrict_materials": false,
    "pricing_type": "per-square-foot",
    "show_price_range": false,
    "lower_range": "0",
    "upper_range": "0",
    "show_financing": false,
    "term_length": "1",
    "interest_rate": "0"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique constraint on organization_id + estimator_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_instant_estimator_configs_org_estimator 
  ON instant_estimator_configs(organization_id, estimator_id);

-- Create index for estimator lookups
CREATE INDEX IF NOT EXISTS idx_instant_estimator_configs_estimator 
  ON instant_estimator_configs(estimator_id);

-- Enable RLS on all tables
ALTER TABLE instant_estimator_global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_estimator_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_estimator_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instant_estimator_global_settings
CREATE POLICY "Users can view own organization global settings"
  ON instant_estimator_global_settings
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own organization global settings"
  ON instant_estimator_global_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own organization global settings"
  ON instant_estimator_global_settings
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for instant_estimator_materials
CREATE POLICY "Users can view own organization materials"
  ON instant_estimator_materials
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own organization materials"
  ON instant_estimator_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own organization materials"
  ON instant_estimator_materials
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete own organization materials"
  ON instant_estimator_materials
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for instant_estimator_configs
CREATE POLICY "Users can view own organization configs"
  ON instant_estimator_configs
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own organization configs"
  ON instant_estimator_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own organization configs"
  ON instant_estimator_configs
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_instant_estimator_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_instant_estimator_global_settings_updated_at
  BEFORE UPDATE ON instant_estimator_global_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimator_updated_at();

CREATE TRIGGER update_instant_estimator_materials_updated_at
  BEFORE UPDATE ON instant_estimator_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimator_updated_at();

CREATE TRIGGER update_instant_estimator_configs_updated_at
  BEFORE UPDATE ON instant_estimator_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimator_updated_at();
