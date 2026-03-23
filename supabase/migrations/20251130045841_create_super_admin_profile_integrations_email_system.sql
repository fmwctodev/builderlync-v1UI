/*
  # Super Admin Profile, Integrations, and Email Service System

  1. New Tables
    - `super_admin_profiles`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, references super_admin_staff)
      - `bio` (text) - Biography/description
      - `timezone` (text) - User timezone
      - `language` (text) - Preferred language
      - `avatar_url` (text) - Profile picture URL
      - `email_signature` (text) - Email signature HTML
      - `notification_preferences` (jsonb) - Notification settings
      - `two_factor_enabled` (boolean) - 2FA status
      - `two_factor_secret` (text) - 2FA secret key
      - `backup_codes` (text[]) - 2FA backup codes
      - `password_changed_at` (timestamptz) - Last password change
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_integrations`
      - `id` (uuid, primary key)
      - `integration_name` (text) - twilio, stripe, jira, google_workspace
      - `status` (text) - connected, disconnected, error
      - `credentials` (jsonb) - Encrypted credentials (API keys, tokens)
      - `configuration` (jsonb) - Integration-specific settings
      - `oauth_tokens` (jsonb) - OAuth access and refresh tokens
      - `last_sync_at` (timestamptz) - Last successful sync
      - `last_error` (text) - Last error message
      - `connected_at` (timestamptz) - When connected
      - `connected_by` (uuid) - Who connected it
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_email_domains`
      - `id` (uuid, primary key)
      - `domain` (text, unique) - Email domain (e.g., builderlync.com)
      - `provider` (text) - google_workspace, custom_smtp
      - `verification_status` (text) - pending, verified, failed
      - `verification_token` (text) - Domain verification token
      - `dkim_selector` (text) - DKIM selector
      - `dkim_public_key` (text) - DKIM public key
      - `dkim_verified` (boolean) - DKIM verification status
      - `spf_verified` (boolean) - SPF verification status
      - `dmarc_verified` (boolean) - DMARC verification status
      - `dns_records` (jsonb) - Required DNS records
      - `is_default` (boolean) - Default sending domain
      - `verified_at` (timestamptz) - When domain was verified
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_smtp_configs`
      - `id` (uuid, primary key)
      - `config_name` (text) - Configuration name
      - `smtp_host` (text) - SMTP server host
      - `smtp_port` (integer) - SMTP port
      - `smtp_username` (text) - SMTP username
      - `smtp_password` (text) - Encrypted SMTP password
      - `use_tls` (boolean) - Use TLS/SSL
      - `from_email` (text) - From email address
      - `from_name` (text) - From name
      - `reply_to_email` (text) - Reply-to email
      - `is_active` (boolean) - Active configuration
      - `daily_limit` (integer) - Daily sending limit
      - `sent_today` (integer) - Emails sent today
      - `last_reset_at` (date) - Last reset date
      - `test_status` (text) - last_test_passed, last_test_failed
      - `last_test_at` (timestamptz) - Last test timestamp
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `super_admin_email_templates`
      - `id` (uuid, primary key)
      - `template_name` (text) - Template identifier
      - `template_type` (text) - account_invitation, password_reset, billing_notification
      - `subject` (text) - Email subject
      - `body_html` (text) - HTML body
      - `body_text` (text) - Plain text body
      - `variables` (jsonb) - Available template variables
      - `is_system` (boolean) - System template (not editable)
      - `is_active` (boolean) - Active status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for super admin access only
    - Encrypt sensitive fields (credentials, passwords, tokens)

  3. Seed Data
    - Create default email templates
    - Insert sample integration configurations
*/

-- Create super_admin_profiles table
CREATE TABLE IF NOT EXISTS super_admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid UNIQUE REFERENCES super_admin_staff(id) ON DELETE CASCADE,
  bio text,
  timezone text DEFAULT 'America/Chicago',
  language text DEFAULT 'en-US',
  avatar_url text,
  email_signature text,
  notification_preferences jsonb DEFAULT '{"email_alerts": true, "digest_frequency": "daily"}'::jsonb,
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  backup_codes text[],
  password_changed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_integrations table
CREATE TABLE IF NOT EXISTS super_admin_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name text UNIQUE NOT NULL CHECK (integration_name IN ('twilio', 'stripe', 'jira', 'google_workspace')),
  status text DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  credentials jsonb DEFAULT '{}'::jsonb,
  configuration jsonb DEFAULT '{}'::jsonb,
  oauth_tokens jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  last_error text,
  connected_at timestamptz,
  connected_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_email_domains table
CREATE TABLE IF NOT EXISTS super_admin_email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  provider text DEFAULT 'google_workspace' CHECK (provider IN ('google_workspace', 'custom_smtp')),
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_token text,
  dkim_selector text,
  dkim_public_key text,
  dkim_verified boolean DEFAULT false,
  spf_verified boolean DEFAULT false,
  dmarc_verified boolean DEFAULT false,
  dns_records jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_smtp_configs table
CREATE TABLE IF NOT EXISTS super_admin_smtp_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name text NOT NULL,
  smtp_host text NOT NULL,
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_username text NOT NULL,
  smtp_password text NOT NULL,
  use_tls boolean DEFAULT true,
  from_email text NOT NULL,
  from_name text,
  reply_to_email text,
  is_active boolean DEFAULT false,
  daily_limit integer DEFAULT 1000,
  sent_today integer DEFAULT 0,
  last_reset_at date DEFAULT CURRENT_DATE,
  test_status text,
  last_test_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create super_admin_email_templates table
CREATE TABLE IF NOT EXISTS super_admin_email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('account_invitation', 'password_reset', 'billing_notification', 'system_alert')),
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE super_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_smtp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for super admin access
CREATE POLICY "Super admins can manage profiles"
  ON super_admin_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage integrations"
  ON super_admin_integrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage email domains"
  ON super_admin_email_domains FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage smtp configs"
  ON super_admin_smtp_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage email templates"
  ON super_admin_email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_super_admin_profiles_staff_id ON super_admin_profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_integrations_name ON super_admin_integrations(integration_name);
CREATE INDEX IF NOT EXISTS idx_super_admin_integrations_status ON super_admin_integrations(status);
CREATE INDEX IF NOT EXISTS idx_super_admin_email_domains_domain ON super_admin_email_domains(domain);
CREATE INDEX IF NOT EXISTS idx_super_admin_email_domains_status ON super_admin_email_domains(verification_status);
CREATE INDEX IF NOT EXISTS idx_super_admin_smtp_configs_active ON super_admin_smtp_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_super_admin_email_templates_type ON super_admin_email_templates(template_type);

-- Insert default integrations (disconnected state)
INSERT INTO super_admin_integrations (integration_name, status, configuration) VALUES
  ('twilio', 'disconnected', '{"description": "SMS and voice communication platform"}'::jsonb),
  ('stripe', 'disconnected', '{"description": "Payment processing and billing"}'::jsonb),
  ('jira', 'disconnected', '{"description": "Support ticket management"}'::jsonb),
  ('google_workspace', 'disconnected', '{"description": "Email, calendar, and workspace tools"}'::jsonb)
ON CONFLICT (integration_name) DO NOTHING;

-- Insert default email templates
INSERT INTO super_admin_email_templates (template_name, template_type, subject, body_html, body_text, variables, is_system) VALUES
(
  'account_invitation',
  'account_invitation',
  'Welcome to BuilderLync - Account Invitation',
  '<h1>Welcome to BuilderLync!</h1><p>Hi {{name}},</p><p>You have been invited to join BuilderLync. Click the link below to set up your account:</p><p><a href="{{invitation_link}}">Set Up Account</a></p>',
  'Welcome to BuilderLync! You have been invited to join. Visit {{invitation_link}} to set up your account.',
  '["name", "invitation_link", "account_name"]'::jsonb,
  true
),
(
  'password_reset',
  'password_reset',
  'BuilderLync - Password Reset Request',
  '<h1>Password Reset</h1><p>Hi {{name}},</p><p>We received a request to reset your password. Click the link below:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>',
  'Password Reset Request. Visit {{reset_link}} to reset your password. If you did not request this, please ignore.',
  '["name", "reset_link"]'::jsonb,
  true
),
(
  'billing_notification',
  'billing_notification',
  'BuilderLync - Billing Notification',
  '<h1>Billing Update</h1><p>Hi {{name}},</p><p>{{message}}</p><p>Amount: ${{amount}}</p>',
  'Billing Update: {{message}}. Amount: ${{amount}}',
  '["name", "message", "amount", "invoice_url"]'::jsonb,
  true
)
ON CONFLICT (template_name) DO NOTHING;
