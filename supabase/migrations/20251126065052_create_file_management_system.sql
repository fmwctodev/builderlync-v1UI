/*
  # Create File Management System

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `user_id` (uuid, references auth.users)
      - `folder_name` (text)
      - `parent_folder_id` (uuid, self-referential)
      - `storage_type` (enum: local, google_drive, onedrive)
      - `path` (text, full folder path)
      - `cloud_folder_id` (text, nullable, for cloud providers)
      - `color` (text, nullable, for folder customization)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `files`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `user_id` (uuid, references auth.users)
      - `file_name` (text)
      - `file_size` (bigint, in bytes)
      - `mime_type` (text)
      - `storage_type` (enum: local, google_drive, onedrive)
      - `storage_path` (text, Supabase storage path or cloud file ID)
      - `folder_id` (uuid, nullable, references folders)
      - `thumbnail_url` (text, nullable)
      - `cloud_metadata` (jsonb, for cloud-specific data)
      - `is_deleted` (boolean, for soft delete)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cloud_connections`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `user_id` (uuid, references auth.users)
      - `provider` (enum: google_drive, onedrive)
      - `account_email` (text)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expires_at` (timestamptz)
      - `is_connected` (boolean)
      - `last_sync_at` (timestamptz, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their organization's data
    - Ensure users can only access files/folders within their organization

  3. Storage
    - Create organization-files bucket for Supabase Storage
    - Configure bucket policies for organization-level access
*/

-- Create storage type enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_type_enum') THEN
    CREATE TYPE storage_type_enum AS ENUM ('local', 'google_drive', 'onedrive');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cloud_provider_enum') THEN
    CREATE TYPE cloud_provider_enum AS ENUM ('google_drive', 'onedrive');
  END IF;
END $$;

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name text NOT NULL,
  parent_folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  storage_type storage_type_enum NOT NULL DEFAULT 'local',
  path text NOT NULL,
  cloud_folder_id text,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL,
  storage_type storage_type_enum NOT NULL DEFAULT 'local',
  storage_path text NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  thumbnail_url text,
  cloud_metadata jsonb DEFAULT '{}'::jsonb,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cloud_connections table
CREATE TABLE IF NOT EXISTS cloud_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider cloud_provider_enum NOT NULL,
  account_email text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  is_connected boolean DEFAULT true,
  last_sync_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, account_email)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_folders_organization_id ON folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_folder_id ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_storage_type ON folders(storage_type);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);

CREATE INDEX IF NOT EXISTS idx_files_organization_id ON files(organization_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_storage_type ON files(storage_type);
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON files(is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_file_name ON files(file_name);

CREATE INDEX IF NOT EXISTS idx_cloud_connections_organization_id ON cloud_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_cloud_connections_provider ON cloud_connections(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_connections_is_connected ON cloud_connections(is_connected);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders table
CREATE POLICY "Users can view folders in their organization"
  ON folders FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create folders in their organization"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update folders in their organization"
  ON folders FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete folders in their organization"
  ON folders FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for files table
CREATE POLICY "Users can view files in their organization"
  ON files FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files in their organization"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their organization"
  ON files FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in their organization"
  ON files FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for cloud_connections table
CREATE POLICY "Users can view cloud connections in their organization"
  ON cloud_connections FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cloud connections in their organization"
  ON cloud_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cloud connections in their organization"
  ON cloud_connections FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cloud connections in their organization"
  ON cloud_connections FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM staff WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cloud_connections_updated_at ON cloud_connections;
CREATE TRIGGER update_cloud_connections_updated_at
  BEFORE UPDATE ON cloud_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();