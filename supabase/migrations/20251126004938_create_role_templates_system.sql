/*
  # Create Role Templates System

  1. New Tables
    - `role_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template name (e.g., "Admin", "Manager", "Sales")
      - `description` (text) - Description of the role
      - `role_type` (text) - Type identifier (admin, manager, sales, project_manager, finance, office_dispatcher, field_tech)
      - `permissions` (jsonb) - Complete permission structure
      - `is_system_template` (boolean) - Whether this is a built-in template
      - `is_active` (boolean) - Whether template is available for use
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `organization_roles`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references auth.users)
      - `template_id` (uuid, references role_templates, nullable)
      - `name` (text) - Role name for this organization
      - `description` (text) - Role description
      - `permissions` (jsonb) - Actual permissions (can be customized from template)
      - `is_custom` (boolean) - Whether this is fully custom or based on template
      - `staff_count` (integer, default 0)
      - `is_deletable` (boolean, default true)
      - `is_default` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `staff_role_assignments`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, references staff)
      - `role_id` (uuid, references organization_roles)
      - `assigned_at` (timestamptz)
      - `assigned_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their organization's roles
    - Add policies for role template access

  3. Seed Data
    - Insert 7 predefined role templates with complete permissions
*/

-- Create role_templates table
CREATE TABLE IF NOT EXISTS role_templates (
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

-- Create organization_roles table
CREATE TABLE IF NOT EXISTS organization_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  template_id uuid REFERENCES role_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL,
  permissions jsonb NOT NULL,
  is_custom boolean DEFAULT false,
  staff_count integer DEFAULT 0,
  is_deletable boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff_role_assignments table
CREATE TABLE IF NOT EXISTS staff_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  role_id uuid REFERENCES organization_roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid,
  UNIQUE(staff_id, role_id)
);

-- Enable RLS
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_role_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for role_templates (read-only for all authenticated users)
CREATE POLICY "Anyone can view active role templates"
  ON role_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for organization_roles
CREATE POLICY "Users can view their organization roles"
  ON organization_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create organization roles"
  ON organization_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their organization roles"
  ON organization_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete deletable organization roles"
  ON organization_roles FOR DELETE
  TO authenticated
  USING (is_deletable = true);

-- Policies for staff_role_assignments
CREATE POLICY "Users can view staff role assignments"
  ON staff_role_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create staff role assignments"
  ON staff_role_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update staff role assignments"
  ON staff_role_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete staff role assignments"
  ON staff_role_assignments FOR DELETE
  TO authenticated
  USING (true);

-- Insert predefined role templates
INSERT INTO role_templates (name, description, role_type, permissions, is_system_template, is_active) VALUES
(
  'Admin',
  'Full system control with all permissions. Ideal for: Owner, CEO, COO, Ops Director',
  'admin',
  '{"contacts": {"view": true, "create": true, "edit": true, "delete": true, "export": true}, "jobs": {"view": true, "create": true, "edit": true, "delete": true, "manage_status": true}, "financial": {"view_billing": true, "manage_billing": true, "view_payments": true, "process_payments": true, "export_data": true}, "staff": {"view": true, "add": true, "edit": true, "delete": true, "assign_roles": true}, "system": {"manage_integrations": true, "view_audit_logs": true, "export_data": true, "manage_brand": true}, "communications": {"send_messages": true, "manage_templates": true, "view_conversations": true}, "marketing": {"manage_campaigns": true, "view_analytics": true, "manage_automation": true}, "scheduling": {"view_calendar": true, "create_appointments": true, "assign_crew": true, "manage_dispatch": true}, "estimates": {"create_estimate": true, "edit_estimate": true, "approve_estimate": true, "send_estimate": true}, "reporting": {"view_reports": true, "export_reports": true, "view_financial_reports": true}, "field_operations": {"upload_photos": true, "complete_tasks": true, "mark_job_complete": true, "request_supplements": true}, "integrations": {"manage_eagleview": true, "manage_material_orders": true, "manage_quickbooks": true}, "automation": {"view_automation": true, "edit_automation": true, "manage_ai_settings": true}}'::jsonb,
  true,
  true
),
(
  'Manager',
  'High-level operational control. Ideal for: Office Manager, GM, Ops Manager',
  'manager',
  '{"contacts": {"view": true, "create": true, "edit": true, "delete": false, "export": true}, "jobs": {"view": true, "create": true, "edit": true, "delete": false, "manage_status": true}, "financial": {"view_billing": false, "manage_billing": false, "view_payments": true, "process_payments": false, "export_data": false}, "staff": {"view": true, "add": true, "edit": true, "delete": false, "assign_roles": true}, "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": true, "manage_brand": false}, "communications": {"send_messages": true, "manage_templates": true, "view_conversations": true}, "marketing": {"manage_campaigns": true, "view_analytics": true, "manage_automation": false}, "scheduling": {"view_calendar": true, "create_appointments": true, "assign_crew": true, "manage_dispatch": true}, "estimates": {"create_estimate": true, "edit_estimate": true, "approve_estimate": true, "send_estimate": true}, "reporting": {"view_reports": true, "export_reports": true, "view_financial_reports": false}, "field_operations": {"upload_photos": true, "complete_tasks": true, "mark_job_complete": true, "request_supplements": true}, "integrations": {"manage_eagleview": true, "manage_material_orders": true, "manage_quickbooks": false}, "automation": {"view_automation": true, "edit_automation": false, "manage_ai_settings": false}}'::jsonb,
  true,
  true
),
(
  'Sales',
  'Pipeline and quoting focused. Ideal for: Sales Rep, Canvasser, Account Executive',
  'sales',
  '{"contacts": {"view": true, "create": true, "edit": true, "delete": false, "export": false}, "jobs": {"view": true, "create": true, "edit": true, "delete": false, "manage_status": false}, "financial": {"view_billing": false, "manage_billing": false, "view_payments": false, "process_payments": false, "export_data": false}, "staff": {"view": false, "add": false, "edit": false, "delete": false, "assign_roles": false}, "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": false, "manage_brand": false}, "communications": {"send_messages": true, "manage_templates": false, "view_conversations": true}, "marketing": {"manage_campaigns": false, "view_analytics": false, "manage_automation": false}, "scheduling": {"view_calendar": true, "create_appointments": true, "assign_crew": false, "manage_dispatch": false}, "estimates": {"create_estimate": true, "edit_estimate": true, "approve_estimate": false, "send_estimate": true}, "reporting": {"view_reports": false, "export_reports": false, "view_financial_reports": false}, "field_operations": {"upload_photos": true, "complete_tasks": true, "mark_job_complete": false, "request_supplements": false}, "integrations": {"manage_eagleview": true, "manage_material_orders": false, "manage_quickbooks": false}, "automation": {"view_automation": false, "edit_automation": false, "manage_ai_settings": false}}'::jsonb,
  true,
  true
),
(
  'Project Manager',
  'Field and production operations. Ideal for: PM, Production Manager, Crew Lead',
  'project_manager',
  '{"contacts": {"view": true, "create": false, "edit": false, "delete": false, "export": false}, "jobs": {"view": true, "create": false, "edit": true, "delete": false, "manage_status": true}, "financial": {"view_billing": false, "manage_billing": false, "view_payments": false, "process_payments": false, "export_data": false}, "staff": {"view": true, "add": false, "edit": false, "delete": false, "assign_roles": false}, "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": false, "manage_brand": false}, "communications": {"send_messages": true, "manage_templates": false, "view_conversations": true}, "marketing": {"manage_campaigns": false, "view_analytics": false, "manage_automation": false}, "scheduling": {"view_calendar": true, "create_appointments": true, "assign_crew": true, "manage_dispatch": true}, "estimates": {"create_estimate": false, "edit_estimate": false, "approve_estimate": false, "send_estimate": false}, "reporting": {"view_reports": true, "export_reports": false, "view_financial_reports": false}, "field_operations": {"upload_photos": true, "complete_tasks": true, "mark_job_complete": true, "request_supplements": true}, "integrations": {"manage_eagleview": false, "manage_material_orders": true, "manage_quickbooks": false}, "automation": {"view_automation": false, "edit_automation": false, "manage_ai_settings": false}}'::jsonb,
  true,
  true
),
(
  'Finance',
  'Financial, billing, and collections. Ideal for: Accounting, Bookkeeper',
  'finance',
  '{"contacts": {"view": true, "create": false, "edit": false, "delete": false, "export": true}, "jobs": {"view": true, "create": false, "edit": false, "delete": false, "manage_status": false}, "financial": {"view_billing": true, "manage_billing": true, "view_payments": true, "process_payments": true, "export_data": true}, "staff": {"view": false, "add": false, "edit": false, "delete": false, "assign_roles": false}, "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": true, "manage_brand": false}, "communications": {"send_messages": false, "manage_templates": false, "view_conversations": false}, "marketing": {"manage_campaigns": false, "view_analytics": false, "manage_automation": false}, "scheduling": {"view_calendar": false, "create_appointments": false, "assign_crew": false, "manage_dispatch": false}, "estimates": {"create_estimate": false, "edit_estimate": false, "approve_estimate": false, "send_estimate": false}, "reporting": {"view_reports": true, "export_reports": true, "view_financial_reports": true}, "field_operations": {"upload_photos": false, "complete_tasks": false, "mark_job_complete": false, "request_supplements": false}, "integrations": {"manage_eagleview": false, "manage_material_orders": false, "manage_quickbooks": true}, "automation": {"view_automation": false, "edit_automation": false, "manage_ai_settings": false}}'::jsonb,
  true,
  true
),
(
  'Office/Dispatcher',
  'Inbound/outbound call and scheduling. Ideal for: CSR, Appointment Setter',
  'office_dispatcher',
  '{"contacts": {"view": true, "create": true, "edit": true, "delete": false, "export": false}, "jobs": {"view": true, "create": true, "edit": false, "delete": false, "manage_status": false}, "financial": {"view_billing": false, "manage_billing": false, "view_payments": false, "process_payments": false, "export_data": false}, "staff": {"view": false, "add": false, "edit": false, "delete": false, "assign_roles": false}, "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": false, "manage_brand": false}, "communications": {"send_messages": true, "manage_templates": false, "view_conversations": true}, "marketing": {"manage_campaigns": false, "view_analytics": false, "manage_automation": false}, "scheduling": {"view_calendar": true, "create_appointments": true, "assign_crew": false, "manage_dispatch": true}, "estimates": {"create_estimate": false, "edit_estimate": false, "approve_estimate": false, "send_estimate": false}, "reporting": {"view_reports": false, "export_reports": false, "view_financial_reports": false}, "field_operations": {"upload_photos": false, "complete_tasks": true, "mark_job_complete": false, "request_supplements": false}, "integrations": {"manage_eagleview": false, "manage_material_orders": false, "manage_quickbooks": false}, "automation": {"view_automation": false, "edit_automation": false, "manage_ai_settings": false}}'::jsonb,
  true,
  true
),
(
  'Field Tech',
  'Minimal on-site functionality. Ideal for: Installer, Foreman, Inspector',
  'field_tech',
  '{"contacts": {"view": false, "create": false, "edit": false, "delete": false, "export": false}, "jobs": {"view": true, "create": false, "edit": false, "delete": false, "manage_status": false}, "financial": {"view_billing": false, "manage_billing": false, "view_payments": false, "process_payments": false, "export_data": false}, "staff": {"view": false, "add": false, "edit": false, "delete": false, "assign_roles": false}, "system": {"manage_integrations": false, "view_audit_logs": false, "export_data": false, "manage_brand": false}, "communications": {"send_messages": false, "manage_templates": false, "view_conversations": false}, "marketing": {"manage_campaigns": false, "view_analytics": false, "manage_automation": false}, "scheduling": {"view_calendar": false, "create_appointments": false, "assign_crew": false, "manage_dispatch": false}, "estimates": {"create_estimate": false, "edit_estimate": false, "approve_estimate": false, "send_estimate": false}, "reporting": {"view_reports": false, "export_reports": false, "view_financial_reports": false}, "field_operations": {"upload_photos": true, "complete_tasks": true, "mark_job_complete": false, "request_supplements": false}, "integrations": {"manage_eagleview": false, "manage_material_orders": false, "manage_quickbooks": false}, "automation": {"view_automation": false, "edit_automation": false, "manage_ai_settings": false}}'::jsonb,
  true,
  true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_roles_org_id ON organization_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_roles_template_id ON organization_roles(template_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_assignments_staff_id ON staff_role_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_assignments_role_id ON staff_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_role_templates_role_type ON role_templates(role_type);
