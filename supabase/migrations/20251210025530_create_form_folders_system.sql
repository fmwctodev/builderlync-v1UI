/*
  # Create Form Folders System

  1. New Tables
    - `form_folders`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, required) - organization ownership
      - `name` (text, required) - folder name
      - `parent_folder_id` (uuid) - self-referential for nested folders
      - `color` (text) - optional color for folder customization
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Table Modifications
    - Add `folder_id` column to `marketing_forms` table

  3. Security
    - Enable RLS on form_folders table
    - Add policies for organization-scoped access

  4. Indexes
    - Performance indexes for common queries
*/

-- Create form_folders table
CREATE TABLE IF NOT EXISTS form_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES form_folders(id) ON DELETE CASCADE,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add folder_id column to marketing_forms table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_forms' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE marketing_forms ADD COLUMN folder_id uuid REFERENCES form_folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_folders_organization_id ON form_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_folders_parent_folder_id ON form_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_marketing_forms_folder_id ON marketing_forms(folder_id);

-- Enable Row Level Security
ALTER TABLE form_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_folders

-- Allow users to view folders in their organization
CREATE POLICY "Users can view folders in their organization"
  ON form_folders
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow users to create folders in their organization
CREATE POLICY "Users can create folders in their organization"
  ON form_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow users to update folders in their organization
CREATE POLICY "Users can update folders in their organization"
  ON form_folders
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

-- Allow users to delete folders in their organization
CREATE POLICY "Users can delete folders in their organization"
  ON form_folders
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_form_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS trigger_update_form_folders_updated_at ON form_folders;
CREATE TRIGGER trigger_update_form_folders_updated_at
  BEFORE UPDATE ON form_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_form_folders_updated_at();
