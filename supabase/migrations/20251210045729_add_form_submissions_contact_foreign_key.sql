/*
  # Add Foreign Key Relationship for Form Submissions to Contacts

  ## Overview
  This migration adds a foreign key constraint between form_submissions and contacts tables
  to enable proper relational queries in Supabase PostgREST.

  ## Changes

  1. **Foreign Key Constraint**
     - Add foreign key from `form_submissions.contact_id` to `contacts.id`
     - Use `ON DELETE SET NULL` to preserve submissions if contact is deleted
     - This allows Supabase to automatically join contacts data when querying submissions

  2. **Benefits**
     - Enables `contact:contacts(...)` syntax in Supabase queries
     - Maintains referential integrity between submissions and contacts
     - Fixes the "Could not find a relationship" error in the Submissions tab

  ## Notes
  - The foreign key is nullable, allowing submissions without associated contacts
  - Existing submissions with null or invalid contact_id values are not affected
  - Index on contact_id already exists from previous migration
*/

-- Add foreign key constraint from form_submissions to contacts
DO $$
BEGIN
  -- Check if the foreign key constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'form_submissions_contact_id_fkey'
    AND table_name = 'form_submissions'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE form_submissions
      ADD CONSTRAINT form_submissions_contact_id_fkey
      FOREIGN KEY (contact_id)
      REFERENCES contacts(id)
      ON DELETE SET NULL;
  END IF;
END $$;
