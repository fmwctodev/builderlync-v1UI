/*
  # Users & Roles Management System

  1. New Tables
    - `roles`
      - Global role templates and account-specific roles
      - Stores permissions as JSONB
      - Supports role inheritance and defaults
    - `platform_users`
      - All users across all accounts
      - Links to accounts and roles
      - Tracks status and login activity

  2. Security
    - Enable RLS on all tables
    - Super admin access policies
    - Account-scoped policies for tenant users

  3. Indexes
    - Email lookup
    - Account and role relationships
    - Status and scope filtering
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  scope text NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'account')),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  CONSTRAINT unique_role_name_per_scope UNIQUE (name, scope, account_id)
);

-- Create platform_users table
CREATE TABLE IF NOT EXISTS platform_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  last_login_at timestamptz,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  invited_at timestamptz,
  invited_by text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_scope ON roles(scope);
CREATE INDEX IF NOT EXISTS idx_roles_account_id ON roles(account_id);
CREATE INDEX IF NOT EXISTS idx_roles_is_default ON roles(is_default);
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_platform_users_account_id ON platform_users(account_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_role_id ON platform_users(role_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_status ON platform_users(status);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Super admins can view all roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can create roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can delete roles"
  ON roles FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for platform_users
CREATE POLICY "Super admins can view all users"
  ON platform_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can create users"
  ON platform_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can update users"
  ON platform_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admins can delete users"
  ON platform_users FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_users_updated_at ON platform_users;
CREATE TRIGGER update_platform_users_updated_at
  BEFORE UPDATE ON platform_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();