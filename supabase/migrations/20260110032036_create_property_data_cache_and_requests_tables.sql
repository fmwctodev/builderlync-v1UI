/*
  # Create Property Data Cache and Requests Tables
  
  This migration creates tables to support the Roof Data Preview feature
  in the Instant Estimator, enabling caching of property data and logging
  of API requests for auditing purposes.

  1. New Tables
    - `property_data_cache`
      - `id` (uuid, primary key) - Unique identifier
      - `organization_id` (uuid, foreign key) - Organization that owns this cache entry
      - `property_id` (text, indexed) - External property identifier (e.g., Google Place ID)
      - `address_text` (text) - Full formatted address string
      - `roof_area_sqft` (numeric) - Estimated roof area in square feet
      - `pitch` (numeric, nullable) - Roof pitch value if available
      - `raw_response` (jsonb) - Complete raw API response for reference
      - `source` (text) - Data source identifier (e.g., 'EagleView')
      - `fetched_at` (timestamptz) - When the data was fetched from source
      - `expires_at` (timestamptz) - Cache expiration timestamp
      - `created_at` (timestamptz) - Record creation timestamp
      
    - `property_data_requests`
      - `id` (uuid, primary key) - Unique identifier
      - `organization_id` (uuid, foreign key, nullable) - Organization making the request
      - `property_id` (text) - Property identifier for the request
      - `address_text` (text) - Address being looked up
      - `status` (text) - Request status: 'success' or 'error'
      - `response_format` (text) - Response format: 'json', 'xml', or 'unknown'
      - `error_message` (text, nullable) - Error details if request failed
      - `duration_ms` (integer) - Request duration in milliseconds
      - `created_at` (timestamptz) - Request timestamp

  2. Security
    - Enable RLS on both tables
    - Organizations can only access their own cache entries
    - Request logs are organization-scoped for auditing

  3. Indexes
    - property_data_cache: property_id, organization_id, expires_at
    - property_data_requests: organization_id, created_at
*/

-- Create property_data_cache table
CREATE TABLE IF NOT EXISTS property_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  address_text text NOT NULL,
  roof_area_sqft numeric,
  pitch numeric,
  raw_response jsonb,
  source text NOT NULL DEFAULT 'EagleView',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create property_data_requests table for logging
CREATE TABLE IF NOT EXISTS property_data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  property_id text NOT NULL,
  address_text text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error')),
  response_format text CHECK (response_format IN ('json', 'xml', 'unknown')),
  error_message text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE property_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_data_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_data_cache

-- Organizations can view their own cached property data
CREATE POLICY "Organizations can view own property data cache"
  ON property_data_cache
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- Organizations can insert their own cached property data
CREATE POLICY "Organizations can insert property data cache"
  ON property_data_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- Organizations can update their own cached property data
CREATE POLICY "Organizations can update own property data cache"
  ON property_data_cache
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- Organizations can delete their own cached property data
CREATE POLICY "Organizations can delete own property data cache"
  ON property_data_cache
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- RLS Policies for property_data_requests

-- Organizations can view their own request logs
CREATE POLICY "Organizations can view own property data requests"
  ON property_data_requests
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- Organizations can insert their own request logs
CREATE POLICY "Organizations can insert property data requests"
  ON property_data_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NULL OR organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_data_cache_property_id 
  ON property_data_cache(property_id);

CREATE INDEX IF NOT EXISTS idx_property_data_cache_org_id 
  ON property_data_cache(organization_id);

CREATE INDEX IF NOT EXISTS idx_property_data_cache_expires_at 
  ON property_data_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_property_data_requests_org_id 
  ON property_data_requests(organization_id);

CREATE INDEX IF NOT EXISTS idx_property_data_requests_created_at 
  ON property_data_requests(created_at DESC);

-- Create composite index for cache lookups
CREATE INDEX IF NOT EXISTS idx_property_data_cache_lookup 
  ON property_data_cache(organization_id, property_id, expires_at);
