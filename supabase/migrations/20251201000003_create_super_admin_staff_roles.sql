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

-- Create super_admin_roles table
CREATE TABLE IF NOT EXISTS super_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_deletable BOOLEAN DEFAULT true,
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
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_email ON super_admin_staff(email);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_status ON super_admin_staff(status);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_role_assignments_staff_id ON super_admin_staff_role_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_staff_role_assignments_role_id ON super_admin_staff_role_assignments(role_id);

-- Enable RLS
ALTER TABLE super_admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_staff_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read staff" ON super_admin_staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read roles" ON super_admin_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read staff role assignments" ON super_admin_staff_role_assignments
  FOR SELECT USING (auth.role() = 'authenticated');
