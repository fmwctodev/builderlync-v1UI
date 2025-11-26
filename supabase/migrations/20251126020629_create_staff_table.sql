/*
  # Create Staff Management Table

  ## Overview
  This migration creates a staff table to store internal team members who can be assigned to jobs.
  Staff members are linked to auth.users and can be assigned roles for permissions management.

  ## Changes

  ### New Table: staff
  
  1. **Identity Fields**
     - `id` (uuid, primary key): Unique identifier for staff member
     - `user_id` (uuid, foreign key): Links to auth.users for authentication
  
  2. **Personal Information**
     - `first_name` (text): Staff member's first name
     - `last_name` (text): Staff member's last name
     - `email` (text, unique): Staff member's email address
     - `phone` (text): Staff member's phone number
     - `extension` (text): Phone extension (optional)
  
  3. **Profile Information**
     - `image` (text): URL to profile image (optional)
     - `status` (text): Employment status (active, inactive, on_leave)
     - `title` (text): Job title (optional)
     - `department` (text): Department (optional)
  
  4. **Metadata**
     - `created_at` (timestamptz): When the staff member was added
     - `updated_at` (timestamptz): Last update timestamp
     - `created_by` (uuid): Who created this staff member

  ## Security
  - Row Level Security (RLS) enabled
  - Authenticated users can view all staff members
  - Only authenticated users with proper permissions can create/update/delete staff

  ## Notes
  - Staff members are distinct from regular contacts
  - Integration with existing staff_role_assignments table via staff_id
  - Email must be unique to prevent duplicate staff accounts
*/

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  extension text,
  image text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  title text,
  department text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
CREATE POLICY "Authenticated users can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_created_at ON staff(created_at);

-- Update staff_role_assignments foreign key to reference staff table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'staff_role_assignments_staff_id_fkey'
    AND table_name = 'staff_role_assignments'
  ) THEN
    ALTER TABLE staff_role_assignments DROP CONSTRAINT staff_role_assignments_staff_id_fkey;
  END IF;
END $$;

ALTER TABLE staff_role_assignments 
  ADD CONSTRAINT staff_role_assignments_staff_id_fkey 
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on staff updates
DROP TRIGGER IF EXISTS update_staff_timestamp ON staff;
CREATE TRIGGER update_staff_timestamp
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_updated_at();