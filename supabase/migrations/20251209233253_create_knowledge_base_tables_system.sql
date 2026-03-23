/*
  # Create Knowledge Base Tables System

  ## Overview
  This migration adds support for structured table/database uploads in the Sierra AI knowledge base.
  Users can upload CSV files containing structured data that the AI agent can query and reference.

  ## New Tables
  
  ### `knowledge_base_tables`
  Stores metadata and configuration for uploaded tables/databases
  - `id` (uuid, primary key)
  - `organization_id` (uuid, references organizations)
  - `collection_id` (uuid, references knowledge_base_collections, optional)
  - `name` (text) - user-defined name for the table
  - `description` (text) - optional description
  - `source_file_name` (text) - original CSV filename
  - `column_definitions` (jsonb) - array of column metadata (name, type, selected)
  - `row_count` (integer) - number of rows in the table
  - `status` (text) - 'draft' or 'published'
  - `created_by` (uuid)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `knowledge_base_table_rows`
  Stores the actual row data for each table
  - `id` (uuid, primary key)
  - `table_id` (uuid, references knowledge_base_tables)
  - `row_index` (integer) - position in the table
  - `row_data` (jsonb) - key-value pairs for each column
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on both tables
  - Users can only access their own organization's tables
  - Policies enforce organization-level isolation
*/

-- Create knowledge_base_tables table
CREATE TABLE IF NOT EXISTS knowledge_base_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  collection_id uuid REFERENCES knowledge_base_collections(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  source_file_name text NOT NULL,
  column_definitions jsonb NOT NULL DEFAULT '[]'::jsonb,
  row_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create knowledge_base_table_rows table
CREATE TABLE IF NOT EXISTS knowledge_base_table_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES knowledge_base_tables(id) ON DELETE CASCADE NOT NULL,
  row_index integer NOT NULL,
  row_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_tables_organization_id ON knowledge_base_tables(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_tables_collection_id ON knowledge_base_tables(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_tables_status ON knowledge_base_tables(status);
CREATE INDEX IF NOT EXISTS idx_kb_table_rows_table_id ON knowledge_base_table_rows(table_id);
CREATE INDEX IF NOT EXISTS idx_kb_table_rows_row_index ON knowledge_base_table_rows(table_id, row_index);

-- Enable Row Level Security
ALTER TABLE knowledge_base_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_table_rows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_base_tables
CREATE POLICY "Users can view tables in their organization"
  ON knowledge_base_tables FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create tables in their organization"
  ON knowledge_base_tables FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update tables in their organization"
  ON knowledge_base_tables FOR UPDATE
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

CREATE POLICY "Users can delete tables in their organization"
  ON knowledge_base_tables FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for knowledge_base_table_rows
CREATE POLICY "Users can view table rows in their organization"
  ON knowledge_base_table_rows FOR SELECT
  TO authenticated
  USING (
    table_id IN (
      SELECT id FROM knowledge_base_tables 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can create table rows in their organization"
  ON knowledge_base_table_rows FOR INSERT
  TO authenticated
  WITH CHECK (
    table_id IN (
      SELECT id FROM knowledge_base_tables 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can update table rows in their organization"
  ON knowledge_base_table_rows FOR UPDATE
  TO authenticated
  USING (
    table_id IN (
      SELECT id FROM knowledge_base_tables 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  )
  WITH CHECK (
    table_id IN (
      SELECT id FROM knowledge_base_tables 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can delete table rows in their organization"
  ON knowledge_base_table_rows FOR DELETE
  TO authenticated
  USING (
    table_id IN (
      SELECT id FROM knowledge_base_tables 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );