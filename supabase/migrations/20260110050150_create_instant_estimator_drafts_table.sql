/*
  # Create Instant Estimator Drafts Table

  1. New Tables
    - `instant_estimator_drafts`
      - `id` (uuid, primary key) - Unique identifier for the draft
      - `organization_id` (uuid, not null) - Organization that owns this draft
      - `user_id` (uuid, not null) - User who created the draft
      - `property_id` (text, not null) - Property identifier from address lookup
      - `address_text` (text, not null) - Full address text for display
      - `roof_area_sqft` (numeric, nullable) - Estimated roof area in square feet
      - `effective_pitch` (numeric, nullable) - Effective roof pitch value
      - `materials_config` (jsonb, nullable) - Selected materials configuration
      - `materials_summary` (jsonb, nullable) - Summary of materials for display
      - `job_id` (uuid, nullable) - Associated job if any
      - `customer_id` (uuid, nullable) - Associated customer/contact if any
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Indexes
    - Index on (organization_id, property_id) for draft lookup by property
    - Index on (organization_id, user_id) for listing user's drafts

  3. Security
    - Enable RLS on instant_estimator_drafts table
    - Add policies for organization-scoped access
*/

CREATE TABLE IF NOT EXISTS instant_estimator_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  property_id text NOT NULL,
  address_text text NOT NULL,
  roof_area_sqft numeric,
  effective_pitch numeric,
  materials_config jsonb,
  materials_summary jsonb,
  job_id uuid,
  customer_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instant_estimator_drafts_org_property 
  ON instant_estimator_drafts(organization_id, property_id);

CREATE INDEX IF NOT EXISTS idx_instant_estimator_drafts_org_user 
  ON instant_estimator_drafts(organization_id, user_id);

ALTER TABLE instant_estimator_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view drafts in their organization"
  ON instant_estimator_drafts
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Users can create drafts in their organization"
  ON instant_estimator_drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own drafts"
  ON instant_estimator_drafts
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Users can delete their own drafts"
  ON instant_estimator_drafts
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE OR REPLACE FUNCTION update_instant_estimator_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER instant_estimator_drafts_updated_at
  BEFORE UPDATE ON instant_estimator_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimator_draft_timestamp();