/*
  # Add Contact Association to Jobs Table

  1. Changes
    - Add `contact_id` (bigint, nullable) - Reference to the contact/customer
    - Add `contact_name` (text, nullable) - Cached contact name for quick display
  
  2. Indexes
    - Index on contact_id for filtering jobs by contact
  
  3. Notes
    - contact_id is nullable to allow jobs without assigned contacts
    - contact_name is denormalized for performance (cached from contacts table)
    - When a contact is selected, both contact_id and contact_name should be set
*/

-- Add contact fields to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN contact_id BIGINT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'contact_name'
  ) THEN
    ALTER TABLE jobs ADD COLUMN contact_name TEXT;
  END IF;
END $$;

-- Create index for contact_id lookups
CREATE INDEX IF NOT EXISTS idx_jobs_contact_id ON jobs(contact_id);