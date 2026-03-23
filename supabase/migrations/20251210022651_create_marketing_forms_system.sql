/*
  # Create Marketing Forms System

  1. New Tables
    - `marketing_forms`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, required) - organization ownership
      - `name` (text, required) - form name
      - `description` (text) - form description
      - `status` (text) - draft, published, archived
      - `fields` (jsonb) - form field definitions array
      - `settings` (jsonb) - styling and configuration
      - `pipeline_id` (uuid) - target pipeline for new opportunities
      - `stage_id` (uuid) - initial stage for new opportunities
      - `public_id` (text, unique) - public identifier for embedding
      - `embed_code` (text) - generated embed code
      - `submission_count` (integer) - total submissions counter
      - `conversion_count` (integer) - converted leads counter
      - `created_by` (uuid) - user who created the form
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `form_submissions`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, required) - organization ownership
      - `form_id` (uuid, required) - reference to marketing_forms
      - `submission_data` (jsonb) - all submitted field values
      - `metadata` (jsonb) - IP, user agent, referrer, UTM parameters
      - `status` (text) - pending, processed, error
      - `contact_id` (uuid) - created/matched contact
      - `opportunity_id` (uuid) - created opportunity
      - `error_message` (text) - processing error details
      - `processed_at` (timestamptz) - when submission was processed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Policies for organization-scoped access
    - Public read access for published forms via public_id

  3. Indexes
    - Performance indexes for common queries
*/

-- Create marketing_forms table
CREATE TABLE IF NOT EXISTS marketing_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{
    "theme": {
      "primaryColor": "#dc2626",
      "backgroundColor": "#ffffff",
      "textColor": "#1f2937"
    },
    "thankYouMessage": "Thank you for your submission! We will be in touch soon.",
    "redirectUrl": null,
    "showLogo": true,
    "notifications": {
      "enabled": true,
      "recipients": []
    }
  }'::jsonb,
  pipeline_id uuid,
  stage_id uuid,
  public_id text UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 12),
  embed_code text,
  submission_count integer NOT NULL DEFAULT 0,
  conversion_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT marketing_forms_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  form_id uuid NOT NULL REFERENCES marketing_forms(id) ON DELETE CASCADE,
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  contact_id uuid,
  opportunity_id uuid,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT form_submissions_status_check CHECK (status IN ('pending', 'processed', 'error'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_forms_organization_id ON marketing_forms(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_forms_status ON marketing_forms(status);
CREATE INDEX IF NOT EXISTS idx_marketing_forms_public_id ON marketing_forms(public_id);
CREATE INDEX IF NOT EXISTS idx_marketing_forms_created_at ON marketing_forms(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_submissions_organization_id ON form_submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_id ON form_submissions(contact_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_opportunity_id ON form_submissions(opportunity_id);

-- Enable Row Level Security
ALTER TABLE marketing_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_forms

-- Allow users to view forms in their organization
CREATE POLICY "Users can view forms in their organization"
  ON marketing_forms
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow users to create forms in their organization
CREATE POLICY "Users can create forms in their organization"
  ON marketing_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow users to update forms in their organization
CREATE POLICY "Users can update forms in their organization"
  ON marketing_forms
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

-- Allow users to delete forms in their organization
CREATE POLICY "Users can delete forms in their organization"
  ON marketing_forms
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow public read access to published forms via public_id
CREATE POLICY "Anyone can view published forms by public_id"
  ON marketing_forms
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- RLS Policies for form_submissions

-- Allow users to view submissions in their organization
CREATE POLICY "Users can view submissions in their organization"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow anonymous users to create submissions for published forms
CREATE POLICY "Anyone can submit to published forms"
  ON form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketing_forms
      WHERE id = form_id AND status = 'published'
    )
  );

-- Allow users to update submissions in their organization
CREATE POLICY "Users can update submissions in their organization"
  ON form_submissions
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

-- Allow users to delete submissions in their organization
CREATE POLICY "Users can delete submissions in their organization"
  ON form_submissions
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to update submission count on form
CREATE OR REPLACE FUNCTION update_form_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE marketing_forms
    SET submission_count = submission_count + 1,
        updated_at = now()
    WHERE id = NEW.form_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE marketing_forms
    SET submission_count = GREATEST(submission_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.form_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update submission count
DROP TRIGGER IF EXISTS trigger_update_form_submission_count ON form_submissions;
CREATE TRIGGER trigger_update_form_submission_count
  AFTER INSERT OR DELETE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_form_submission_count();

-- Function to update conversion count when opportunity is created
CREATE OR REPLACE FUNCTION update_form_conversion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.opportunity_id IS NULL AND NEW.opportunity_id IS NOT NULL) THEN
    UPDATE marketing_forms
    SET conversion_count = conversion_count + 1,
        updated_at = now()
    WHERE id = NEW.form_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversion count
DROP TRIGGER IF EXISTS trigger_update_form_conversion_count ON form_submissions;
CREATE TRIGGER trigger_update_form_conversion_count
  AFTER UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_form_conversion_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketing_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS trigger_update_marketing_forms_updated_at ON marketing_forms;
CREATE TRIGGER trigger_update_marketing_forms_updated_at
  BEFORE UPDATE ON marketing_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_forms_updated_at();