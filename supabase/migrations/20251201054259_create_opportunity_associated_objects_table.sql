/*
  # Create Opportunity Associated Objects Table

  ## Overview
  This migration creates the opportunity_associated_objects table for linking
  various objects (invoices, proposals, reports, etc.) to opportunities.

  ## Changes

  1. New Tables
    - `opportunity_associated_objects`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, required) - Reference to opportunity
      - `object_type` (text) - Type of object (invoice, proposal, report, etc.)
      - `object_id` (uuid) - ID of the associated object
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on table
    - Add policies for organization members

  3. Indexes
    - Index on opportunity_id for lookups
    - Index on object_type for filtering
*/

-- Create opportunity_associated_objects table
CREATE TABLE IF NOT EXISTS opportunity_associated_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  object_type text NOT NULL,
  object_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opp_assoc_objects_opportunity_id ON opportunity_associated_objects(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_assoc_objects_object_type ON opportunity_associated_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_opp_assoc_objects_object_id ON opportunity_associated_objects(object_id);

-- Enable RLS
ALTER TABLE opportunity_associated_objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view opportunity objects"
  ON opportunity_associated_objects FOR SELECT
  TO authenticated
  USING (
    opportunity_id IN (
      SELECT o.id FROM opportunities o
      WHERE o.organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can create opportunity objects"
  ON opportunity_associated_objects FOR INSERT
  TO authenticated
  WITH CHECK (
    opportunity_id IN (
      SELECT o.id FROM opportunities o
      WHERE o.organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can delete opportunity objects"
  ON opportunity_associated_objects FOR DELETE
  TO authenticated
  USING (
    opportunity_id IN (
      SELECT o.id FROM opportunities o
      WHERE o.organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
      )
    )
  );
