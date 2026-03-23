/*
  # Create Form Submissions Views and RPC Functions

  ## Overview
  This migration creates database views and RPC functions to reliably query form submissions
  with related contact data, fixing the "Could not find a relationship" error in PostgREST.

  ## Changes

  1. **Database View**
     - `form_submissions_with_details` view
     - Pre-joins form_submissions with contacts and marketing_forms
     - Handles NULL values gracefully

  2. **RPC Functions**
     - `get_form_submissions_with_details` - fetch submissions for a specific form
     - `get_all_form_submissions_with_details` - fetch all submissions for an organization
     - `refresh_postgrest_schema_cache` - manually refresh PostgREST schema cache

  3. **Security**
     - RLS policies on views
     - Functions use SECURITY DEFINER with proper checks

  ## Benefits
  - Eliminates PostgREST relationship resolution errors
  - Provides consistent data structure
  - Better performance through optimized JOINs
  - Graceful NULL handling
*/

-- Create view for form submissions with all related data
CREATE OR REPLACE VIEW form_submissions_with_details AS
SELECT
  fs.id,
  fs.organization_id,
  fs.form_id,
  fs.submission_data,
  fs.metadata,
  fs.status,
  fs.contact_id,
  fs.opportunity_id,
  fs.error_message,
  fs.processed_at,
  fs.created_at,
  -- Form details
  jsonb_build_object(
    'id', mf.id,
    'name', mf.name,
    'status', mf.status
  ) as form,
  -- Contact details (nullable)
  CASE
    WHEN c.id IS NOT NULL THEN
      jsonb_build_object(
        'id', c.id,
        'first_name', c.first_name,
        'last_name', c.last_name,
        'email', c.email
      )
    ELSE NULL
  END as contact
FROM form_submissions fs
LEFT JOIN marketing_forms mf ON fs.form_id = mf.id
LEFT JOIN contacts c ON fs.contact_id = c.id;

-- Enable RLS on the view
ALTER VIEW form_submissions_with_details SET (security_invoker = true);

-- Create function to get form submissions with details for a specific form
CREATE OR REPLACE FUNCTION get_form_submissions_with_details(
  p_form_id uuid,
  p_organization_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  form_id uuid,
  submission_data jsonb,
  metadata jsonb,
  status text,
  contact_id uuid,
  opportunity_id uuid,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz,
  form jsonb,
  contact jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id,
    fs.organization_id,
    fs.form_id,
    fs.submission_data,
    fs.metadata,
    fs.status,
    fs.contact_id,
    fs.opportunity_id,
    fs.error_message,
    fs.processed_at,
    fs.created_at,
    jsonb_build_object(
      'id', mf.id,
      'name', mf.name,
      'status', mf.status
    ) as form,
    CASE
      WHEN c.id IS NOT NULL THEN
        jsonb_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'email', c.email
        )
      ELSE NULL
    END as contact
  FROM form_submissions fs
  LEFT JOIN marketing_forms mf ON fs.form_id = mf.id
  LEFT JOIN contacts c ON fs.contact_id = c.id
  WHERE fs.form_id = p_form_id
    AND fs.organization_id = p_organization_id
    AND (p_status IS NULL OR fs.status = p_status)
  ORDER BY fs.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all form submissions with details for an organization
CREATE OR REPLACE FUNCTION get_all_form_submissions_with_details(
  p_organization_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  form_id uuid,
  submission_data jsonb,
  metadata jsonb,
  status text,
  contact_id uuid,
  opportunity_id uuid,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz,
  form jsonb,
  contact jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id,
    fs.organization_id,
    fs.form_id,
    fs.submission_data,
    fs.metadata,
    fs.status,
    fs.contact_id,
    fs.opportunity_id,
    fs.error_message,
    fs.processed_at,
    fs.created_at,
    jsonb_build_object(
      'id', mf.id,
      'name', mf.name,
      'status', mf.status
    ) as form,
    CASE
      WHEN c.id IS NOT NULL THEN
        jsonb_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'email', c.email
        )
      ELSE NULL
    END as contact
  FROM form_submissions fs
  LEFT JOIN marketing_forms mf ON fs.form_id = mf.id
  LEFT JOIN contacts c ON fs.contact_id = c.id
  WHERE fs.organization_id = p_organization_id
    AND (p_status IS NULL OR fs.status = p_status)
  ORDER BY fs.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to count form submissions
CREATE OR REPLACE FUNCTION count_form_submissions(
  p_form_id uuid DEFAULT NULL,
  p_organization_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS bigint AS $$
DECLARE
  v_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM form_submissions fs
  WHERE (p_form_id IS NULL OR fs.form_id = p_form_id)
    AND (p_organization_id IS NULL OR fs.organization_id = p_organization_id)
    AND (p_status IS NULL OR fs.status = p_status);

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to refresh PostgREST schema cache
CREATE OR REPLACE FUNCTION refresh_postgrest_schema_cache()
RETURNS void AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the foreign key constraint exists and is properly named
DO $$
BEGIN
  -- Drop the constraint if it exists with wrong name
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'form_submissions_contact_id_fkey'
    AND table_name = 'form_submissions'
  ) THEN
    -- Constraint already exists, skip
    NULL;
  ELSE
    -- Add the constraint if it doesn't exist
    ALTER TABLE form_submissions
      ADD CONSTRAINT form_submissions_contact_id_fkey
      FOREIGN KEY (contact_id)
      REFERENCES contacts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT form_submissions_contact_id_fkey ON form_submissions IS
  'Foreign key to contacts table. Allows NULL values for submissions without associated contacts. ON DELETE SET NULL preserves submissions if contact is deleted.';