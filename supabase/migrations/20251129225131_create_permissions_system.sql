/*
  # Create Permissions System

  1. Tables: permission_templates, user_permissions
  2. Features: Granular permissions, role overrides
*/

CREATE TABLE IF NOT EXISTS permission_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system_template boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  permission_value boolean DEFAULT true,
  resource_type text,
  resource_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id, permission_key, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_permission_templates_org ON permission_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_org ON user_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);

ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage permission templates" ON permission_templates FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Admins manage user permissions" ON user_permissions FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Users view own permissions" ON user_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
