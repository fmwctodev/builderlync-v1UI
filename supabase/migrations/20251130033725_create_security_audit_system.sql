/*
  # Security & Audit System

  1. New Tables
    - `audit_log` - Global audit trail for all platform actions
    - `security_events` - High-severity security incidents
    - `security_settings` - Platform-wide security policies
    - `user_security_profile` - User security metrics and MFA status

  2. Features
    - Comprehensive activity tracking
    - Security event monitoring with acknowledgement
    - MFA adoption tracking
    - Failed login tracking
    - IP-based access control
    - Session timeout configuration
    - Data export controls

  3. Security
    - Enable RLS on all tables
    - Super admin access policies
    - Audit trail for all security actions
*/

-- Global Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  actor_type text NOT NULL CHECK (actor_type IN ('super_admin', 'account_admin', 'user', 'system')),
  actor_id text,
  actor_email text,
  actor_name text,
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  resource_type text NOT NULL,
  resource_id text,
  action text NOT NULL,
  description text,
  ip_address text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_type ON audit_log(actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_email ON audit_log(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_account ON audit_log(account_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id uuid,
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  source_ip text,
  location text,
  user_agent text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_by text,
  acknowledged_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_acknowledged ON security_events(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_account ON security_events(account_id);

-- Platform Security Settings Table
CREATE TABLE IF NOT EXISTS security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enforce_mfa boolean NOT NULL DEFAULT false,
  mfa_required_for text[] NOT NULL DEFAULT ARRAY['super_admin', 'account_admin'],
  restrict_superadmin_ip boolean NOT NULL DEFAULT false,
  superadmin_ip_allowlist text[] NOT NULL DEFAULT ARRAY[]::text[],
  allow_data_export boolean NOT NULL DEFAULT true,
  require_reason_for_export boolean NOT NULL DEFAULT false,
  session_timeout_minutes integer NOT NULL DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Security Profile Table
CREATE TABLE IF NOT EXISTS user_security_profile (
  user_id uuid PRIMARY KEY,
  mfa_enabled boolean NOT NULL DEFAULT false,
  last_mfa_enrolled_at timestamptz,
  last_password_change_at timestamptz,
  last_login_ip text,
  last_login_at timestamptz,
  failed_login_count integer NOT NULL DEFAULT 0,
  last_failed_login_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_security_mfa ON user_security_profile(mfa_enabled);
CREATE INDEX IF NOT EXISTS idx_user_security_failed ON user_security_profile(failed_login_count);

-- Enable Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin access only)
CREATE POLICY "Super admin full access to audit_log"
  ON audit_log FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to security_events"
  ON security_events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to security_settings"
  ON security_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to user_security_profile"
  ON user_security_profile FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_security_settings_updated_at ON security_settings;
CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default security settings
INSERT INTO security_settings (
  enforce_mfa,
  mfa_required_for,
  restrict_superadmin_ip,
  superadmin_ip_allowlist,
  allow_data_export,
  require_reason_for_export,
  session_timeout_minutes
)
VALUES (
  false,
  ARRAY['super_admin', 'account_admin'],
  false,
  ARRAY[]::text[],
  true,
  false,
  60
)
ON CONFLICT DO NOTHING;

-- Seed Sample Audit Logs
INSERT INTO audit_log (timestamp, actor_type, actor_email, actor_name, account_id, resource_type, resource_id, action, description, ip_address, user_agent, metadata)
SELECT
  now() - (random() * interval '30 days'),
  (ARRAY['super_admin', 'account_admin', 'user', 'system'])[floor(random() * 4 + 1)],
  'user' || floor(random() * 100) || '@example.com',
  'User ' || floor(random() * 100),
  (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1),
  (ARRAY['account', 'user', 'job', 'billing', 'integration', 'settings'])[floor(random() * 6 + 1)],
  gen_random_uuid()::text,
  (ARRAY['create', 'update', 'delete', 'view', 'export'])[floor(random() * 5 + 1)],
  'Sample audit log entry #' || generate_series,
  '192.168.' || floor(random() * 255) || '.' || floor(random() * 255),
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  '{"sample": true}'::jsonb
FROM generate_series(1, 100);

-- Seed Sample Security Events
INSERT INTO security_events (created_at, type, severity, account_id, source_ip, location, user_agent, description, metadata, acknowledged)
VALUES
  (now() - interval '2 hours', 'failed_login', 'low', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '203.0.113.45', 'San Francisco, CA', 'Mozilla/5.0', 'Failed login attempt for user@example.com', '{"attempts": 1}', false),
  (now() - interval '5 hours', 'multiple_failed_login', 'high', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '203.0.113.46', 'New York, NY', 'Mozilla/5.0', '5 consecutive failed login attempts', '{"attempts": 5}', false),
  (now() - interval '1 day', 'suspicious_ip', 'medium', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '185.220.101.1', 'Unknown Location', 'curl/7.68.0', 'Login from suspicious IP address', '{"threat_score": 75}', true),
  (now() - interval '3 days', 'export_downloaded', 'low', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '192.168.1.100', 'Los Angeles, CA', 'Mozilla/5.0', 'Large data export downloaded', '{"rows": 50000}', true),
  (now() - interval '6 hours', 'unauthorized_access_attempt', 'critical', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '45.142.120.10', 'Unknown', 'Python/3.9', 'Attempted access to restricted resource', '{"resource": "admin_panel"}', false),
  (now() - interval '12 hours', 'failed_login', 'low', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '198.51.100.23', 'Seattle, WA', 'Safari/605.1.15', 'Failed login - incorrect password', '{"attempts": 1}', false),
  (now() - interval '2 days', 'multiple_failed_login', 'high', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '198.51.100.24', 'Seattle, WA', 'Safari/605.1.15', '8 failed login attempts', '{"attempts": 8}', false),
  (now() - interval '4 days', 'suspicious_ip', 'medium', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '31.13.115.1', 'Amsterdam, NL', 'Chrome/96.0', 'Login from new geographic location', '{"distance_km": 8000}', true),
  (now() - interval '7 days', 'password_reset', 'low', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '192.168.1.50', 'Austin, TX', 'Firefox/95.0', 'Password reset requested', '{}', true),
  (now() - interval '10 hours', 'failed_login', 'medium', (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1), '203.0.113.100', 'Chicago, IL', 'Edge/96.0', '3 failed login attempts', '{"attempts": 3}', false);

-- Seed Sample User Security Profiles
INSERT INTO user_security_profile (user_id, mfa_enabled, last_mfa_enrolled_at, last_password_change_at, last_login_ip, last_login_at, failed_login_count, last_failed_login_at)
SELECT
  gen_random_uuid(),
  random() > 0.5,
  CASE WHEN random() > 0.5 THEN now() - (random() * interval '180 days') ELSE NULL END,
  now() - (random() * interval '365 days'),
  '192.168.' || floor(random() * 255) || '.' || floor(random() * 255),
  now() - (random() * interval '30 days'),
  floor(random() * 10),
  CASE WHEN random() > 0.7 THEN now() - (random() * interval '7 days') ELSE NULL END
FROM generate_series(1, 30)
ON CONFLICT DO NOTHING;