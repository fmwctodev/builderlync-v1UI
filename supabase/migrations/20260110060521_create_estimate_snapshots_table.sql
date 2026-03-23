/*
  # Create Estimate Snapshots Table

  1. New Tables
    - `estimate_snapshots`
      - `id` (uuid, primary key) - Unique identifier
      - `organization_id` (uuid, not null) - References organizations table
      - `user_id` (uuid, not null) - References auth.users who created the snapshot
      - `property_id` (text, not null) - Property identifier from property data service
      - `address_text` (text, not null) - Human-readable address
      - `roof_area_sqft` (decimal) - Total roof area in square feet
      - `pitch_effective` (decimal) - Effective pitch value
      - `imagery_included` (boolean) - Whether imagery was included in estimate
      - `materials_calc_inputs` (jsonb) - Input parameters (wastePercent, bundlesPerSquare, etc.)
      - `materials_calc_outputs` (jsonb) - Calculated outputs (squares, bundles, rolls, etc.)
      - `assumptions` (jsonb) - Array of assumption strings
      - `notes` (text) - Optional notes
      - `source` (text) - Source of the snapshot (default: 'instant_estimator')
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on `estimate_snapshots` table
    - Add policy for organization members to read their own data
    - Add policy for organization members to create snapshots
    - Add policy for organization members to delete their own snapshots

  3. Indexes
    - Index on organization_id for fast filtering
    - Index on property_id for property lookups
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS estimate_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  address_text text NOT NULL,
  roof_area_sqft decimal,
  pitch_effective decimal,
  imagery_included boolean DEFAULT false,
  materials_calc_inputs jsonb DEFAULT '{}',
  materials_calc_outputs jsonb DEFAULT '{}',
  assumptions jsonb DEFAULT '[]',
  notes text,
  source text DEFAULT 'instant_estimator',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE estimate_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view estimate snapshots"
  ON estimate_snapshots
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = estimate_snapshots.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

CREATE POLICY "Organization members can create estimate snapshots"
  ON estimate_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = estimate_snapshots.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

CREATE POLICY "Users can delete their own estimate snapshots"
  ON estimate_snapshots
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = estimate_snapshots.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_estimate_snapshots_organization_id ON estimate_snapshots(organization_id);
CREATE INDEX IF NOT EXISTS idx_estimate_snapshots_property_id ON estimate_snapshots(property_id);
CREATE INDEX IF NOT EXISTS idx_estimate_snapshots_created_at ON estimate_snapshots(created_at DESC);