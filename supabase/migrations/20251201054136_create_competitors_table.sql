/*
  # Create Competitors Table

  ## Overview
  This migration creates the competitors table for tracking competitor information
  for reputation management and competitive analysis within an organization.

  ## Changes

  1. New Tables
    - `competitors`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, required) - Organization this competitor belongs to
      - `name` (text) - Competitor business name
      - `address` (text) - Business address
      - `phone` (text) - Contact phone
      - `website` (text) - Website URL
      - `google_place_id` (text) - Google Places API ID
      - `google_rating` (numeric) - Google rating score
      - `google_reviews_count` (integer) - Number of Google reviews
      - `yelp_rating` (numeric) - Yelp rating score
      - `yelp_reviews_count` (integer) - Number of Yelp reviews
      - `facebook_rating` (numeric) - Facebook rating score
      - `facebook_reviews_count` (integer) - Number of Facebook reviews
      - `notes` (text) - Internal notes about competitor
      - `metadata` (jsonb) - Additional competitor data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `competitors` table
    - Add policy for organization members to view competitors
    - Add policy for organization members to create competitors
    - Add policy for organization members to update competitors
    - Add policy for organization members to delete competitors

  3. Indexes
    - Index on organization_id for filtering
    - Index on name for search
    - Index on google_place_id for external API lookups
*/

-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  website text DEFAULT '',
  google_place_id text,
  google_rating numeric DEFAULT 0,
  google_reviews_count integer DEFAULT 0,
  yelp_rating numeric DEFAULT 0,
  yelp_reviews_count integer DEFAULT 0,
  facebook_rating numeric DEFAULT 0,
  facebook_reviews_count integer DEFAULT 0,
  notes text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competitors_organization_id ON competitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_competitors_name ON competitors(name);
CREATE INDEX IF NOT EXISTS idx_competitors_google_place_id ON competitors(google_place_id);

-- Enable RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view competitors"
  ON competitors FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create competitors"
  ON competitors FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update competitors"
  ON competitors FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can delete competitors"
  ON competitors FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();
