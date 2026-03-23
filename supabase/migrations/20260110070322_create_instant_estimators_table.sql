/*
  # Create Instant Estimators Table

  This migration creates the main table for storing instant estimator widgets
  that organizations can create and configure.

  ## New Tables

  1. `instant_estimators`
     - `id` (UUID, primary key) - Unique identifier for the estimator
     - `organization_id` (UUID, foreign key) - Organization that owns this estimator
     - `name` (text) - User-defined name for the estimator (e.g., "Website homepage")
     - `slug` (text) - URL-friendly identifier for embedding
     - `is_active` (boolean) - Whether the estimator is active/published
     - `embed_code` (text) - Generated embed code for the widget
     - `settings` (JSONB) - Additional configuration settings
     - `created_at`, `updated_at` timestamps

  ## Security
  - RLS enabled with organization-scoped access policies
  - Users can only access estimators belonging to their organization
*/

CREATE TABLE IF NOT EXISTS instant_estimators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  is_active BOOLEAN DEFAULT true,
  embed_code TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instant_estimators_org 
  ON instant_estimators(organization_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_instant_estimators_org_slug 
  ON instant_estimators(organization_id, slug) 
  WHERE slug IS NOT NULL;

ALTER TABLE instant_estimators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization estimators"
  ON instant_estimators
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own organization estimators"
  ON instant_estimators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own organization estimators"
  ON instant_estimators
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

CREATE POLICY "Users can delete own organization estimators"
  ON instant_estimators
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE OR REPLACE FUNCTION update_instant_estimators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_instant_estimators_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_instant_estimators_updated_at_trigger
      BEFORE UPDATE ON instant_estimators
      FOR EACH ROW
      EXECUTE FUNCTION update_instant_estimators_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION generate_estimator_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug = lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'generate_estimator_slug_trigger'
  ) THEN
    CREATE TRIGGER generate_estimator_slug_trigger
      BEFORE INSERT ON instant_estimators
      FOR EACH ROW
      EXECUTE FUNCTION generate_estimator_slug();
  END IF;
END $$;
