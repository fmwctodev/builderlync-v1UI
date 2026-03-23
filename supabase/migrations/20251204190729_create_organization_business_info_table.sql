/*
  # Create Organization Business Info Table
  
  1. New Tables
    - `organization_business_info` - Stores detailed business information for each organization
  
  2. Changes
    - Comprehensive business details including contact, location, representative info
    - One-to-one relationship with organizations table
    - All business settings in one dedicated table
  
  3. Security
    - Enable RLS on organization_business_info table
    - Users can only access their organization's business info
    - Policies for SELECT, INSERT, UPDATE operations
*/

-- Create organization_business_info table
CREATE TABLE IF NOT EXISTS organization_business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- General Business Information
  friendly_business_name text,
  legal_business_name text,
  business_email text,
  business_phone text,
  branded_domain text,
  business_website text,
  business_niche text,
  business_currency text DEFAULT 'USD',
  
  -- Physical Address
  street_address text,
  city text,
  postal_code text,
  state_region text,
  country text DEFAULT 'United States',
  
  -- Platform Settings
  timezone text DEFAULT 'GMT-06:00 America/Chicago (CST)',
  platform_language text DEFAULT 'English (United States)',
  outbound_language text,
  
  -- Business Details
  business_type text,
  business_industry text,
  registration_id_type text,
  registration_number text,
  not_registered boolean DEFAULT false,
  business_regions jsonb DEFAULT '["usa-canada"]'::jsonb,
  
  -- Authorized Representative
  representative_first_name text,
  representative_last_name text,
  representative_email text,
  representative_job_position text,
  representative_phone text,
  
  -- Contact Preferences
  allow_duplicate_contact boolean DEFAULT false,
  contact_search_preference text DEFAULT 'Email',
  contact_search_secondary text DEFAULT 'Phone',
  
  -- Branding
  logo_url text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_org_business_info_organization_id 
  ON organization_business_info(organization_id);

-- Enable Row Level Security
ALTER TABLE organization_business_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their organization's business info
CREATE POLICY "Users can view org business info"
  ON organization_business_info
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Users can insert business info for their organization
CREATE POLICY "Users can insert org business info"
  ON organization_business_info
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Users can update their organization's business info
CREATE POLICY "Users can update org business info"
  ON organization_business_info
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_business_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_organization_business_info_timestamp
  BEFORE UPDATE ON organization_business_info
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_business_info_updated_at();
