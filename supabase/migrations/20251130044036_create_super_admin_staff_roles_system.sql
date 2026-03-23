/*
  # Super Admin Staff and Roles System

  1. New Tables
    - `super_admin_role_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template name (Company Admin, Support Admin, etc.)
      - `description` (text) - Description of the role
      - `role_type` (text) - Type identifier for the role
      - `permissions` (jsonb) - Complete permission structure
      - `is_system_template` (boolean) - Whether this is a built-in template
      - `is_active` (boolean) - Whether template is available for use
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_roles`
      - `id` (uuid, primary key)
      - `template_id` (uuid, references super_admin_role_templates, nullable)
      - `name` (text) - Role name
      - `description` (text) - Role description
      - `permissions` (jsonb) - Actual permissions (can be customized from template)
      - `is_custom` (boolean) - Whether this is fully custom or based on template
      - `staff_count` (integer, default 0)
      - `is_deletable` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_staff`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Staff member's email address
      - `first_name` (text) - Staff member's first name
      - `last_name` (text) - Staff member's last name
      - `phone` (text) - Phone number
      - `status` (text) - active, inactive, pending
      - `avatar_url` (text) - Profile picture URL
      - `last_login_at` (timestamptz) - Last login timestamp
      - `invited_at` (timestamptz) - When invitation was sent
      - `invited_by` (uuid) - Who sent the invitation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_staff_role_assignments`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, references super_admin_staff)
      - `role_id` (uuid, references super_admin_roles)
      - `assigned_at` (timestamptz)
      - `assigned_by` (uuid)

  2. Security
    - Enable RLS on all tables
    - Add policies for super admin access only

  3. Seed Data
    - Insert 9 predefined role templates with complete permissions
*/

-- Create super_admin_role_templates table
CREATE TABLE IF NOT EXISTS super_admin_role_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  role_type text NOT NULL UNIQUE,
  permissions jsonb NOT NULL,
  is_system_template boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_roles table
CREATE TABLE IF NOT EXISTS super_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES super_admin_role_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL,
  permissions jsonb NOT NULL,
  is_custom boolean DEFAULT false,
  staff_count integer DEFAULT 0,
  is_deletable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_staff table
CREATE TABLE IF NOT EXISTS super_admin_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  status text DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  avatar_url text,
  last_login_at timestamptz,
  invited_at timestamptz DEFAULT now(),
  invited_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_staff_role_assignments table
CREATE TABLE IF NOT EXISTS super_admin_staff_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES super_admin_staff(id) ON DELETE CASCADE,
  role_id uuid REFERENCES super_admin_roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid,
  UNIQUE(staff_id, role_id)
);

-- Enable RLS
ALTER TABLE super_admin_role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_staff_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for super admin access
CREATE POLICY "Super admins can view role templates"
  ON super_admin_role_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage roles"
  ON super_admin_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage staff"
  ON super_admin_staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage staff role assignments"
  ON super_admin_staff_role_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

-- Insert 9 predefined role templates with complete permission structures
INSERT INTO super_admin_role_templates (name, description, role_type, permissions) VALUES
(
  'Company Admin',
  'Full system control with all permissions across all super admin modules',
  'company_admin',
  '{
    "overview": {"view": true, "export": true},
    "accounts": {"view": true, "create": true, "edit": true, "delete": true, "manage_billing": true, "suspend": true},
    "users": {"view": true, "create": true, "edit": true, "delete": true, "manage_roles": true, "impersonate": true},
    "billing": {"view": true, "edit_plans": true, "process_payments": true, "refunds": true, "export": true},
    "usage": {"view": true, "edit_limits": true, "export": true},
    "features": {"view": true, "toggle_flags": true, "manage_overrides": true},
    "integrations": {"view": true, "manage": true, "view_health": true, "test_connections": true},
    "security": {"view_audit": true, "manage_permissions": true, "view_sessions": true, "force_logout": true},
    "support": {"view": true, "create": true, "edit": true, "close": true, "assign": true, "manage_feedback": true},
    "system": {"view_health": true, "manage_settings": true, "view_logs": true, "deploy": true},
    "settings": {"view": true, "manage_staff": true, "manage_roles": true, "system_config": true}
  }'::jsonb
),
(
  'Support Admin',
  'Full support operations with elevated access to accounts and users',
  'support_admin',
  '{
    "overview": {"view": true, "export": false},
    "accounts": {"view": true, "create": false, "edit": true, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": true, "delete": false, "manage_roles": false, "impersonate": true},
    "billing": {"view": true, "edit_plans": false, "process_payments": false, "refunds": false, "export": false},
    "usage": {"view": true, "edit_limits": false, "export": false},
    "features": {"view": true, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": true, "manage": false, "view_health": true, "test_connections": false},
    "security": {"view_audit": true, "manage_permissions": false, "view_sessions": true, "force_logout": false},
    "support": {"view": true, "create": true, "edit": true, "close": true, "assign": true, "manage_feedback": true},
    "system": {"view_health": true, "manage_settings": false, "view_logs": true, "deploy": false},
    "settings": {"view": true, "manage_staff": false, "manage_roles": false, "system_config": false}
  }'::jsonb
),
(
  'Support User',
  'Basic support ticket management with view-only access to accounts',
  'support_user',
  '{
    "overview": {"view": true, "export": false},
    "accounts": {"view": true, "create": false, "edit": false, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": false, "edit_plans": false, "process_payments": false, "refunds": false, "export": false},
    "usage": {"view": true, "edit_limits": false, "export": false},
    "features": {"view": false, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": false, "manage": false, "view_health": false, "test_connections": false},
    "security": {"view_audit": false, "manage_permissions": false, "view_sessions": false, "force_logout": false},
    "support": {"view": true, "create": true, "edit": true, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": false, "manage_settings": false, "view_logs": false, "deploy": false},
    "settings": {"view": false, "manage_staff": false, "manage_roles": false, "system_config": false}
  }'::jsonb
),
(
  'Sales Admin',
  'Full sales operations with account management and team oversight',
  'sales_admin',
  '{
    "overview": {"view": true, "export": true},
    "accounts": {"view": true, "create": true, "edit": true, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": true, "edit_plans": false, "process_payments": false, "refunds": false, "export": true},
    "usage": {"view": true, "edit_limits": false, "export": true},
    "features": {"view": true, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": true, "manage": false, "view_health": false, "test_connections": false},
    "security": {"view_audit": false, "manage_permissions": false, "view_sessions": false, "force_logout": false},
    "support": {"view": true, "create": false, "edit": false, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": false, "manage_settings": false, "view_logs": false, "deploy": false},
    "settings": {"view": true, "manage_staff": true, "manage_roles": false, "system_config": false}
  }'::jsonb
),
(
  'Sales User',
  'Basic sales operations with account viewing and editing',
  'sales_user',
  '{
    "overview": {"view": true, "export": false},
    "accounts": {"view": true, "create": true, "edit": true, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": true, "edit_plans": false, "process_payments": false, "refunds": false, "export": false},
    "usage": {"view": true, "edit_limits": false, "export": false},
    "features": {"view": false, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": false, "manage": false, "view_health": false, "test_connections": false},
    "security": {"view_audit": false, "manage_permissions": false, "view_sessions": false, "force_logout": false},
    "support": {"view": false, "create": false, "edit": false, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": false, "manage_settings": false, "view_logs": false, "deploy": false},
    "settings": {"view": false, "manage_staff": false, "manage_roles": false, "system_config": false}
  }'::jsonb
),
(
  'Developer Admin',
  'Full development access including integrations, API, and system management',
  'developer_admin',
  '{
    "overview": {"view": true, "export": true},
    "accounts": {"view": true, "create": false, "edit": false, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": false, "edit_plans": false, "process_payments": false, "refunds": false, "export": false},
    "usage": {"view": true, "edit_limits": false, "export": true},
    "features": {"view": true, "toggle_flags": true, "manage_overrides": true},
    "integrations": {"view": true, "manage": true, "view_health": true, "test_connections": true},
    "security": {"view_audit": true, "manage_permissions": false, "view_sessions": true, "force_logout": false},
    "support": {"view": true, "create": false, "edit": false, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": true, "manage_settings": true, "view_logs": true, "deploy": true},
    "settings": {"view": true, "manage_staff": false, "manage_roles": false, "system_config": true}
  }'::jsonb
),
(
  'Developer User',
  'Read-only development access to integrations and system health',
  'developer_user',
  '{
    "overview": {"view": true, "export": false},
    "accounts": {"view": true, "create": false, "edit": false, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": false, "edit_plans": false, "process_payments": false, "refunds": false, "export": false},
    "usage": {"view": true, "edit_limits": false, "export": false},
    "features": {"view": true, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": true, "manage": false, "view_health": true, "test_connections": false},
    "security": {"view_audit": false, "manage_permissions": false, "view_sessions": false, "force_logout": false},
    "support": {"view": true, "create": false, "edit": false, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": true, "manage_settings": false, "view_logs": true, "deploy": false},
    "settings": {"view": false, "manage_staff": false, "manage_roles": false, "system_config": false}
  }'::jsonb
),
(
  'Accounting Admin',
  'Full financial access including billing, payments, and financial reporting',
  'accounting_admin',
  '{
    "overview": {"view": true, "export": true},
    "accounts": {"view": true, "create": false, "edit": false, "delete": false, "manage_billing": true, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": true, "edit_plans": true, "process_payments": true, "refunds": true, "export": true},
    "usage": {"view": true, "edit_limits": false, "export": true},
    "features": {"view": false, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": true, "manage": false, "view_health": false, "test_connections": false},
    "security": {"view_audit": true, "manage_permissions": false, "view_sessions": false, "force_logout": false},
    "support": {"view": true, "create": false, "edit": false, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": false, "manage_settings": false, "view_logs": false, "deploy": false},
    "settings": {"view": true, "manage_staff": false, "manage_roles": false, "system_config": false}
  }'::jsonb
),
(
  'Accounting User',
  'View-only financial access to billing and reports',
  'accounting_user',
  '{
    "overview": {"view": true, "export": false},
    "accounts": {"view": true, "create": false, "edit": false, "delete": false, "manage_billing": false, "suspend": false},
    "users": {"view": true, "create": false, "edit": false, "delete": false, "manage_roles": false, "impersonate": false},
    "billing": {"view": true, "edit_plans": false, "process_payments": false, "refunds": false, "export": true},
    "usage": {"view": true, "edit_limits": false, "export": false},
    "features": {"view": false, "toggle_flags": false, "manage_overrides": false},
    "integrations": {"view": false, "manage": false, "view_health": false, "test_connections": false},
    "security": {"view_audit": false, "manage_permissions": false, "view_sessions": false, "force_logout": false},
    "support": {"view": false, "create": false, "edit": false, "close": false, "assign": false, "manage_feedback": false},
    "system": {"view_health": false, "manage_settings": false, "view_logs": false, "deploy": false},
    "settings": {"view": false, "manage_staff": false, "manage_roles": false, "system_config": false}
  }'::jsonb
)
ON CONFLICT (role_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_super_admin_roles_template_id ON super_admin_roles(template_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_email ON super_admin_staff(email);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_status ON super_admin_staff(status);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_role_assignments_staff_id ON super_admin_staff_role_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_role_assignments_role_id ON super_admin_staff_role_assignments(role_id);

-- Insert sample staff data
INSERT INTO super_admin_staff (email, first_name, last_name, phone, status, last_login_at) VALUES
  ('john.admin@builderlync.com', 'John', 'Administrator', '555-0101', 'active', now() - interval '2 hours'),
  ('sarah.support@builderlync.com', 'Sarah', 'Johnson', '555-0102', 'active', now() - interval '1 day'),
  ('mike.sales@builderlync.com', 'Mike', 'Williams', '555-0103', 'active', now() - interval '3 hours'),
  ('emma.dev@builderlync.com', 'Emma', 'Davis', '555-0104', 'active', now() - interval '5 hours'),
  ('alex.accounting@builderlync.com', 'Alex', 'Martinez', '555-0105', 'pending', NULL);
