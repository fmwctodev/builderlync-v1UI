/*
  # Create Activities Table

  ## Overview
  This migration creates the activities table for tracking user and system activities
  related to contacts, jobs, and other entities within an organization.

  ## Changes

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, required) - Organization this activity belongs to
      - `type` (text) - Activity type (call, email, sms, note, meeting, task, etc.)
      - `title` (text) - Activity title/subject
      - `description` (text) - Detailed activity description
      - `contact_id` (uuid) - Related contact
      - `job_id` (bigint) - Related job
      - `opportunity_id` (uuid) - Related opportunity
      - `user_id` (uuid) - User who performed the activity
      - `user_name` (text) - Name of user for display
      - `metadata` (jsonb) - Additional activity data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `activities` table
    - Add policy for organization members to view activities
    - Add policy for organization members to create activities
    - Add policy for organization members to update activities
    - Add policy for organization members to delete activities

  3. Indexes
    - Index on organization_id for filtering
    - Index on contact_id for related lookups
    - Index on job_id for related lookups
    - Index on type for filtering
    - Index on created_at for sorting
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  job_id bigint REFERENCES jobs(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_job_id ON activities(job_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update activities"
  ON activities FOR UPDATE
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

CREATE POLICY "Organization members can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();
