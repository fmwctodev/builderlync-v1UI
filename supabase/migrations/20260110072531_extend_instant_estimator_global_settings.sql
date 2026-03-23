/*
  # Extend Instant Estimator Global Settings System

  This migration extends the global settings for Instant Estimator to support
  all the widget builder configuration options from Roofr, including materials,
  pricing, contact info, scheduling, and lead-to-opportunity integration.

  ## Changes to Existing Tables

  1. `instant_estimator_global_settings` - Extended with new columns:
     - `default_job_owner_id` (UUID, nullable) - Default assignee for leads
     - `default_point_of_contact_id` (UUID, nullable) - Staff member for contact card
     - `default_scheduling_link` (text, nullable) - Calendar booking link
     - `default_financing_link` (text, nullable) - Financing page URL
     - `restrict_materials` (boolean) - Restrict to configured materials only
     - `pricing_type` (text) - 'per_sqft' or 'per_square'
     - `show_price_range` (boolean) - Show price range to customers
     - `lower_range_percent` (integer) - Lower range percentage
     - `upper_range_percent` (integer) - Upper range percentage
     - `show_financing` (boolean) - Show financing options
     - `show_customer_reviews` (boolean) - Show customer reviews
     - `show_social_media` (boolean) - Show social media links
     - `webhook_enabled` (boolean) - Enable webhook notifications
     - `webhook_url` (text, nullable) - Webhook endpoint URL
     - `lead_notification_email` (text, nullable) - Email for lead notifications
     - `default_lead_pipeline_type` (text) - Default pipeline: Residential/Commercial/Insurance

  ## New Tables

  2. `instant_estimator_default_materials`
     - Global material templates that apply to all estimators by default
     - `id` (UUID, primary key)
     - `organization_id` (UUID, foreign key)
     - `name` (text) - Material name
     - `material_type` (text) - Type: Asphalt, Metal, Tile, etc.
     - `image_url` (text, nullable) - Thumbnail image
     - `low_price` (decimal) - Price for low pitch roofs
     - `moderate_price` (decimal) - Price for moderate pitch
     - `steep_price` (decimal) - Price for steep pitch
     - `flat_price` (decimal) - Price for flat roofs
     - `multi_story_surcharge` (decimal) - Additional cost for multi-story
     - `sort_order` (integer) - Display order
     - `created_at`, `updated_at` timestamps

  3. `instant_estimator_leads`
     - Tracks leads generated from instant estimators
     - Links to opportunities for pipeline integration
     - `id` (UUID, primary key)
     - `organization_id` (UUID, foreign key)
     - `estimator_id` (text) - Reference to instant estimator
     - `opportunity_id` (UUID, nullable) - Linked opportunity
     - `contact_name`, `contact_email`, `contact_phone` (text)
     - `property_address`, `property_city`, `property_state`, `property_zip` (text)
     - `selected_material` (text) - Material chosen by customer
     - `estimated_price` (decimal) - Calculated estimate
     - `roof_sqft` (decimal) - Roof square footage
     - `pitch_category` (text) - Roof pitch: low/moderate/steep/flat
     - `pipeline_type` (text) - Residential/Commercial/Insurance
     - `status` (text) - new/converted/dismissed
     - `created_at` timestamp

  ## Security
  - RLS enabled on all new tables
  - Organization-scoped access policies
*/

-- Extend instant_estimator_global_settings table with new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'default_job_owner_id'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN default_job_owner_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'default_point_of_contact_id'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN default_point_of_contact_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'default_scheduling_link'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN default_scheduling_link TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'default_financing_link'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN default_financing_link TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'restrict_materials'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN restrict_materials BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'pricing_type'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN pricing_type TEXT DEFAULT 'per_sqft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'show_price_range'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN show_price_range BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'lower_range_percent'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN lower_range_percent INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'upper_range_percent'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN upper_range_percent INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'show_financing'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN show_financing BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'show_customer_reviews'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN show_customer_reviews BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'show_social_media'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN show_social_media BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'webhook_enabled'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN webhook_enabled BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'webhook_url'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN webhook_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'lead_notification_email'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN lead_notification_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimator_global_settings' AND column_name = 'default_lead_pipeline_type'
  ) THEN
    ALTER TABLE instant_estimator_global_settings ADD COLUMN default_lead_pipeline_type TEXT DEFAULT 'Residential';
  END IF;
END $$;

-- Create instant_estimator_default_materials table for global material templates
CREATE TABLE IF NOT EXISTS instant_estimator_default_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  material_type TEXT NOT NULL DEFAULT 'Asphalt',
  image_url TEXT,
  low_price DECIMAL(10, 2),
  moderate_price DECIMAL(10, 2),
  steep_price DECIMAL(10, 2),
  flat_price DECIMAL(10, 2),
  multi_story_surcharge DECIMAL(10, 2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for default materials table
CREATE INDEX IF NOT EXISTS idx_ie_default_materials_org 
  ON instant_estimator_default_materials(organization_id);
CREATE INDEX IF NOT EXISTS idx_ie_default_materials_sort 
  ON instant_estimator_default_materials(organization_id, sort_order);

-- Create instant_estimator_leads table for tracking leads
CREATE TABLE IF NOT EXISTS instant_estimator_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  estimator_id TEXT NOT NULL,
  opportunity_id UUID,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  selected_material TEXT,
  estimated_price DECIMAL(10, 2),
  roof_sqft DECIMAL(10, 2),
  pitch_category TEXT,
  pipeline_type TEXT DEFAULT 'Residential',
  status TEXT DEFAULT 'new',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for leads table
CREATE INDEX IF NOT EXISTS idx_ie_leads_org 
  ON instant_estimator_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_ie_leads_estimator 
  ON instant_estimator_leads(estimator_id);
CREATE INDEX IF NOT EXISTS idx_ie_leads_opportunity 
  ON instant_estimator_leads(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_ie_leads_status 
  ON instant_estimator_leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_ie_leads_pipeline 
  ON instant_estimator_leads(organization_id, pipeline_type);
CREATE INDEX IF NOT EXISTS idx_ie_leads_created 
  ON instant_estimator_leads(organization_id, created_at DESC);

-- Enable RLS on new tables
ALTER TABLE instant_estimator_default_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_estimator_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instant_estimator_default_materials
CREATE POLICY "Users can view own organization default materials"
  ON instant_estimator_default_materials
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own organization default materials"
  ON instant_estimator_default_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own organization default materials"
  ON instant_estimator_default_materials
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

CREATE POLICY "Users can delete own organization default materials"
  ON instant_estimator_default_materials
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for instant_estimator_leads
CREATE POLICY "Users can view own organization leads"
  ON instant_estimator_leads
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own organization leads"
  ON instant_estimator_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own organization leads"
  ON instant_estimator_leads
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

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_ie_default_materials_updated_at
  BEFORE UPDATE ON instant_estimator_default_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimator_updated_at();
