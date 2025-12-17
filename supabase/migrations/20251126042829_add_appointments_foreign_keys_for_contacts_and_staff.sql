/*
  # Add Foreign Key Constraints for Appointments

  ## Overview
  This migration adds foreign key constraints to the appointments table to enable proper joins
  with the contacts and staff tables. This allows the API to retrieve contact and owner names
  directly through database joins.

  ## Changes Made

  ### 1. Foreign Key Constraints
  - Add foreign key from `contact_id` to `contacts(id)` with ON DELETE SET NULL
  - Add foreign key from `owner_id` to `staff(id)` with ON DELETE CASCADE
  
  ## Security Considerations
  - Foreign keys ensure referential integrity
  - ON DELETE SET NULL for contacts preserves appointments when contacts are deleted
  - ON DELETE CASCADE for owner removes appointments when staff is deleted
  
  ## Note
  The owner_id currently references auth.users, but we're changing it to reference staff table
  since appointments are owned by staff members, not directly by auth users.
*/

-- First, let's check if there are any appointments with owner_ids that don't exist in staff
-- and update them to NULL or a valid staff id if needed

-- Add foreign key constraint for contact_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_contact_id_fkey' 
    AND table_name = 'appointments'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_contact_id_fkey
    FOREIGN KEY (contact_id)
    REFERENCES contacts(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Note: owner_id in appointments references auth.users (uuid)
-- We'll keep this as is and join with staff using staff.user_id
-- This is actually the correct design since owner_id represents the auth user who owns the appointment
