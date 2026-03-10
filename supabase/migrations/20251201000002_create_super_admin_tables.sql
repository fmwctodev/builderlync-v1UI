-- Create super_admin_role_templates table
CREATE TABLE IF NOT EXISTS super_admin_role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  role_type VARCHAR(50),
  permissions JSONB DEFAULT '{}',
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create super_admin_roles table
CREATE TABLE IF NOT EXISTS super_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES super_admin_role_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_custom BOOLEAN DEFAULT false,
  is_deletable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create super_admin_staff table
CREATE TABLE IF NOT EXISTS super_admin_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  invited_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create super_admin_staff_role_assignments table
CREATE TABLE IF NOT EXISTS super_admin_staff_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES super_admin_staff(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES super_admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, role_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_super_admin_roles_template_id ON super_admin_roles(template_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_email ON super_admin_staff(email);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_status ON super_admin_staff(status);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_role_assignments_staff_id ON super_admin_staff_role_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_role_assignments_role_id ON super_admin_staff_role_assignments(role_id);

-- Enable RLS
ALTER TABLE super_admin_role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_staff_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow authenticated users)
CREATE POLICY "Allow authenticated users to read role templates" ON super_admin_role_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read roles" ON super_admin_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read staff" ON super_admin_staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read staff role assignments" ON super_admin_staff_role_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default role templates
INSERT INTO super_admin_role_templates (name, description, role_type, permissions, is_system_template, is_active)
VALUES 
  ('Company Admin', 'Full administrative access to company settings', 'admin', '{"settings": {"manage_staff": true, "manage_roles": true, "manage_integrations": true, "manage_billing": true}, "features": {"all": true}}', true, true),
  ('Manager', 'Can manage staff and view reports', 'manager', '{"settings": {"manage_staff": true, "view_reports": true}, "features": {"staff_management": true, "reporting": true}}', true, true),
  ('Staff', 'Basic staff access', 'staff', '{"settings": {}, "features": {"basic_access": true}}', true, true)
ON CONFLICT DO NOTHING;
