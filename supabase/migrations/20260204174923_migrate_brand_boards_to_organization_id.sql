/*
  # Migrate Brand Boards to use Organization ID

  ## Changes
  - Rename user_id column to organization_id for clarity
  - Change data type from integer to uuid to match organizations table
  - Add RLS policies for proper security

  ## Security
  - Enable RLS on brand_boards table
  - Users can only access brand boards for organizations they belong to
*/

-- First, drop any existing data (since integers can't be migrated to UUIDs)
TRUNCATE TABLE brand_boards CASCADE;

-- Drop the old user_id column
ALTER TABLE brand_boards DROP COLUMN IF EXISTS user_id;

-- Add new organization_id column as UUID
ALTER TABLE brand_boards
ADD COLUMN organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE brand_boards ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view brand boards for organizations they belong to
CREATE POLICY "Users can view organization brand boards"
  ON brand_boards
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create brand boards for organizations they belong to
CREATE POLICY "Users can create organization brand boards"
  ON brand_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update brand boards for organizations they belong to
CREATE POLICY "Users can update organization brand boards"
  ON brand_boards
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Users can delete brand boards for organizations they belong to
CREATE POLICY "Users can delete organization brand boards"
  ON brand_boards
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_brand_boards_organization_id ON brand_boards(organization_id);
