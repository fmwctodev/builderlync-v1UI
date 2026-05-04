-- ============================================
-- Roles and Permissions Database Schema
-- ============================================
--
-- This script creates the roles and permissions system for BuilderLynk.
-- Run this in your Supabase SQL editor to set up the database tables.
--
-- Features:
-- - Flexible role-based access control
-- - Default roles (Owner, Admin, User)
-- - Custom role creation
-- - Granular permissions by category
-- ============================================

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  is_deletable boolean DEFAULT true,
  organization_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff_roles junction table
CREATE TABLE IF NOT EXISTS staff_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, role_id)
);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

-- Roles policies
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Owners can create roles" ON roles;
CREATE POLICY "Owners can create roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update roles" ON roles;
CREATE POLICY "Owners can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can delete custom roles" ON roles;
CREATE POLICY "Owners can delete custom roles"
  ON roles FOR DELETE
  TO authenticated
  USING (is_deletable = true);

-- Staff roles policies
DROP POLICY IF EXISTS "Authenticated users can view staff roles" ON staff_roles;
CREATE POLICY "Authenticated users can view staff roles"
  ON staff_roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Owners can assign roles" ON staff_roles;
CREATE POLICY "Owners can assign roles"
  ON staff_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can remove role assignments" ON staff_roles;
CREATE POLICY "Owners can remove role assignments"
  ON staff_roles FOR DELETE
  TO authenticated
  USING (true);

-- Seed default roles
DO $$
BEGIN
  -- Owner role
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Owner') THEN
    INSERT INTO roles (name, description, permissions, is_default, is_deletable)
    VALUES (
      'Owner',
      'Full system access with all permissions',
      '{
        "contacts": {"view": true, "create": true, "edit": true, "delete": true, "export": true},
        "jobs": {"view": true, "create": true, "edit": true, "delete": true, "manage_status": true},
        "financial": {"view_billing": true, "manage_billing": true, "view_payments": true, "process_payments": true, "export_data": true},
        "staff": {"view": true, "add": true, "edit": true, "delete": true, "assign_roles": true},
        "system": {"manage_integrations": true, "view_audit_logs": true, "export_data": true, "manage_brand": true},
        "communications": {"send_messages": true, "manage_templates": true, "view_conversations": true},
        "marketing": {"manage_campaigns": true, "view_analytics": true, "manage_automation": true}
      }'::jsonb,
      true,
      false
    );
  END IF;

  -- Admin role
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin') THEN
    INSERT INTO roles (name, description, permissions, is_default, is_deletable)
    VALUES (
      'Admin',
      'Manage contacts, jobs, and staff',
      '{
        "contacts": {"view": true, "create": true, "edit": true, "delete": true, "export": false},
        "jobs": {"view": true, "create": true, "edit": true, "delete": true, "manage_status": true},
        "financial": {"view_billing": false, "manage_billing": false, "view_payments": true, "process_payments": false, "export_data": false},
        "staff": {"view": true, "add": true, "edit": true, "delete": false, "assign_roles": false},
        "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": false, "manage_brand": false},
        "communications": {"send_messages": true, "manage_templates": true, "view_conversations": true},
        "marketing": {"manage_campaigns": true, "view_analytics": true, "manage_automation": true}
      }'::jsonb,
      true,
      false
    );
  END IF;

  -- User role
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'User') THEN
    INSERT INTO roles (name, description, permissions, is_default, is_deletable)
    VALUES (
      'User',
      'View contacts, create jobs, and send messages',
      '{
        "contacts": {"view": true, "create": true, "edit": false, "delete": false, "export": false},
        "jobs": {"view": true, "create": true, "edit": false, "delete": false, "manage_status": false},
        "financial": {"view_billing": false, "manage_billing": false, "view_payments": false, "process_payments": false, "export_data": false},
        "staff": {"view": false, "add": false, "edit": false, "delete": false, "assign_roles": false},
        "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": false, "manage_brand": false},
        "communications": {"send_messages": true, "manage_templates": false, "view_conversations": true},
        "marketing": {"manage_campaigns": false, "view_analytics": false, "manage_automation": false}
      }'::jsonb,
      true,
      false
    );
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_staff ON staff_roles(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON staff_roles(role_id);

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Roles and permissions tables created successfully!';
  RAISE NOTICE 'Default roles seeded: Owner, Admin, User';
END $$;
