/*
  # Multi-Tenant Organization Scoping - Part 1: Helper Function and Core Tables

  ## Overview
  This migration begins transforming BuilderLync into a true multi-tenant SaaS platform
  by adding organization_id to core tenant-scoped tables.

  ## Changes
  1. Create helper function get_current_organization_id()
  2. Add organization_id to core tables: contacts, jobs, staff, appointments, calendar_events
  3. Create indexes for performance

  ## Security
  - Organization ID will be used for RLS policies
  - Data isolation enforced at database level
*/

-- Helper function to get current organization ID
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS uuid AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Try to get organization_id from JWT custom claims
  org_id := (auth.jwt() ->> 'organization_id')::uuid;

  -- If not in JWT, get from organization_members table
  IF org_id IS NULL THEN
    SELECT organization_id INTO org_id
    FROM organization_members
    WHERE user_id = auth.uid()
      AND status = 'active'
    ORDER BY joined_at DESC
    LIMIT 1;
  END IF;

  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add organization_id to contacts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
    CREATE INDEX idx_contacts_org_created ON contacts(organization_id, created_at DESC);
  END IF;
END $$;

-- Add organization_id to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_jobs_organization_id ON jobs(organization_id);
    CREATE INDEX idx_jobs_org_created ON jobs(organization_id, created_at DESC);
  END IF;
END $$;

-- Add organization_id to staff table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE staff ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_staff_organization_id ON staff(organization_id);
  END IF;
END $$;

-- Add organization_id to calendar_events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_calendar_events_organization_id ON calendar_events(organization_id);
  END IF;
END $$;

-- Add organization_id to appointments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_appointments_organization_id ON appointments(organization_id);
    CREATE INDEX idx_appointments_org_date ON appointments(organization_id, scheduled_at);
  END IF;
END $$;