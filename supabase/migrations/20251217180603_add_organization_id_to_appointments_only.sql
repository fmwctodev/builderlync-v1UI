/*
  # Add Organization ID to Appointments

  ## Overview
  This migration adds organization_id to appointments table
  to support multi-tenant reporting and ensures proper RLS policies

  ## Changes
  1. Add organization_id column to appointments table if missing
  2. Create indexes for performance
  3. Update RLS policies for organization scoping
*/

-- Add organization_id to appointments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN organization_id uuid;
    CREATE INDEX IF NOT EXISTS idx_appointments_organization ON appointments(organization_id);
  END IF;
END $$;

-- Update RLS policies for appointments to include organization scoping
DROP POLICY IF EXISTS "All authenticated users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Users view appointments in org" ON appointments;
DROP POLICY IF EXISTS "Users manage appointments in org" ON appointments;

CREATE POLICY "Users view appointments in org" ON appointments FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR organization_id IS NULL
  );

CREATE POLICY "Users manage appointments in org" ON appointments FOR ALL TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR organization_id IS NULL
  );
