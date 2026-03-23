/*
  # Complete System Health Module Tables

  1. New Tables
    - `api_services` - API and service monitoring
    - `job_queues` - Job queue statistics
    - `system_releases` - Deployment history
    - `system_settings` - System configuration

  2. Security
    - Enable RLS on all new tables
    - Add policies for super admin access only
*/

-- Create api_services table
CREATE TABLE IF NOT EXISTS api_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  service_type text NOT NULL,
  status text NOT NULL DEFAULT 'operational',
  endpoint_url text,
  last_check timestamptz DEFAULT now(),
  response_time integer,
  uptime_percentage numeric DEFAULT 100,
  error_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_queues table
CREATE TABLE IF NOT EXISTS job_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name text NOT NULL UNIQUE,
  pending_count integer DEFAULT 0,
  running_count integer DEFAULT 0,
  completed_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  avg_processing_time integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create system_releases table
CREATE TABLE IF NOT EXISTS system_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  release_type text NOT NULL,
  status text NOT NULL DEFAULT 'deployed',
  deployed_at timestamptz DEFAULT now(),
  deployed_by text,
  description text,
  features jsonb DEFAULT '[]',
  bug_fixes jsonb DEFAULT '[]',
  rollback_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  setting_type text NOT NULL,
  description text,
  is_sensitive boolean DEFAULT false,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for super admin access
CREATE POLICY "Super admins can manage api services"
  ON api_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can view job queues"
  ON job_queues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can view system releases"
  ON system_releases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

CREATE POLICY "Super admins can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE super_admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND super_admin_users.status = 'active'
    )
  );

-- Insert sample data for api_services
INSERT INTO api_services (service_name, service_type, status, endpoint_url, response_time, uptime_percentage, error_count) VALUES
  ('Main API', 'api', 'operational', 'https://api.builderlynk.com', 45, 99.98, 0),
  ('Database Primary', 'database', 'operational', 'postgresql://primary', 12, 99.99, 0),
  ('Database Replica', 'database', 'operational', 'postgresql://replica', 15, 99.95, 2),
  ('Stripe API', 'external', 'operational', 'https://api.stripe.com', 120, 99.90, 1),
  ('Twilio API', 'external', 'operational', 'https://api.twilio.com', 95, 99.85, 3),
  ('Email Service', 'service', 'degraded', 'smtp://mail.builderlynk.com', 450, 98.5, 12),
  ('File Storage', 'service', 'operational', 'https://storage.builderlynk.com', 65, 99.92, 1);

-- Insert sample data for job_queues
INSERT INTO job_queues (queue_name, pending_count, running_count, completed_count, failed_count, avg_processing_time) VALUES
  ('email', 45, 3, 12450, 23, 2500),
  ('notifications', 12, 2, 8920, 8, 1200),
  ('reports', 8, 1, 2340, 5, 15000),
  ('backups', 0, 0, 365, 2, 900000),
  ('imports', 3, 1, 890, 12, 45000);

-- Insert sample data for system_releases
INSERT INTO system_releases (version, release_type, status, deployed_at, deployed_by, description, features, bug_fixes) VALUES
  ('2.5.0', 'minor', 'deployed', now() - interval '3 days', 'admin@builderlynk.com', 'Enhanced system health monitoring', '["System Health Dashboard", "Real-time Metrics", "Service Status Monitoring"]', '["Fixed memory leak in background jobs", "Improved API response times"]'),
  ('2.4.3', 'patch', 'deployed', now() - interval '1 week', 'admin@builderlynk.com', 'Security updates and bug fixes', '[]', '["Fixed authentication edge case", "Updated dependencies"]'),
  ('2.4.2', 'patch', 'deployed', now() - interval '2 weeks', 'admin@builderlynk.com', 'Performance improvements', '[]', '["Optimized database queries", "Fixed caching issues"]');

-- Insert sample data for system_settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_sensitive) VALUES
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
  ('max_upload_size', '52428800', 'number', 'Maximum file upload size in bytes', false),
  ('session_timeout', '3600', 'number', 'Session timeout in seconds', false),
  ('enable_debug_logging', 'false', 'boolean', 'Enable debug logging', false),
  ('backup_retention_days', '30', 'number', 'Number of days to retain backups', false);