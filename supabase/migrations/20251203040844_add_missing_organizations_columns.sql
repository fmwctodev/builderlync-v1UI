/*
  # Add Missing Columns to Organizations Table

  This migration adds all missing columns from the organizations system schema
  that were not created in the initial table creation.

  ## Changes
  - Add all missing columns: legal_name, display_name, email, phone, website, address fields
  - Add branding columns: logo_url, logo_square_url, favicon_url, primary_color
  - Add business info: industry, business_type, tax_id, license_number
  - Add settings: timezone, currency, date_format, time_format, language
  - Add limits: trial_ends_at, max_users, max_locations, storage_limit_gb
  - Add metadata: enabled_modules, feature_flags, metadata, is_active
*/

-- Add all missing columns to organizations table
DO $$
BEGIN
  -- Legal and display information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'legal_name') THEN
    ALTER TABLE organizations ADD COLUMN legal_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'display_name') THEN
    ALTER TABLE organizations ADD COLUMN display_name text;
  END IF;

  -- Contact information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'email') THEN
    ALTER TABLE organizations ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'phone') THEN
    ALTER TABLE organizations ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'website') THEN
    ALTER TABLE organizations ADD COLUMN website text;
  END IF;

  -- Address fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address_line1') THEN
    ALTER TABLE organizations ADD COLUMN address_line1 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address_line2') THEN
    ALTER TABLE organizations ADD COLUMN address_line2 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'city') THEN
    ALTER TABLE organizations ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'state') THEN
    ALTER TABLE organizations ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'postal_code') THEN
    ALTER TABLE organizations ADD COLUMN postal_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'country') THEN
    ALTER TABLE organizations ADD COLUMN country text DEFAULT 'US';
  END IF;

  -- Branding
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'logo_url') THEN
    ALTER TABLE organizations ADD COLUMN logo_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'logo_square_url') THEN
    ALTER TABLE organizations ADD COLUMN logo_square_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'favicon_url') THEN
    ALTER TABLE organizations ADD COLUMN favicon_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'primary_color') THEN
    ALTER TABLE organizations ADD COLUMN primary_color text DEFAULT '#dc2626';
  END IF;

  -- Business information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'industry') THEN
    ALTER TABLE organizations ADD COLUMN industry text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'business_type') THEN
    ALTER TABLE organizations ADD COLUMN business_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'tax_id') THEN
    ALTER TABLE organizations ADD COLUMN tax_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'license_number') THEN
    ALTER TABLE organizations ADD COLUMN license_number text;
  END IF;

  -- Settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'timezone') THEN
    ALTER TABLE organizations ADD COLUMN timezone text DEFAULT 'America/New_York';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'currency') THEN
    ALTER TABLE organizations ADD COLUMN currency text DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'date_format') THEN
    ALTER TABLE organizations ADD COLUMN date_format text DEFAULT 'MM/DD/YYYY';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'time_format') THEN
    ALTER TABLE organizations ADD COLUMN time_format text DEFAULT '12h';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'language') THEN
    ALTER TABLE organizations ADD COLUMN language text DEFAULT 'en';
  END IF;

  -- Subscription and limits
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE organizations ADD COLUMN trial_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'max_users') THEN
    ALTER TABLE organizations ADD COLUMN max_users integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'max_locations') THEN
    ALTER TABLE organizations ADD COLUMN max_locations integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'storage_limit_gb') THEN
    ALTER TABLE organizations ADD COLUMN storage_limit_gb integer DEFAULT 10;
  END IF;

  -- JSON fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'enabled_modules') THEN
    ALTER TABLE organizations ADD COLUMN enabled_modules jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'feature_flags') THEN
    ALTER TABLE organizations ADD COLUMN feature_flags jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'metadata') THEN
    ALTER TABLE organizations ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Active status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'is_active') THEN
    ALTER TABLE organizations ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_enterprise_account_id ON organizations(enterprise_account_id);
