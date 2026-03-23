/*
  # Remove Mock Super Admin Data and Prepare for Production

  1. Changes
    - Remove mock super admin users (owner@builderlync.io, ops@builderlync.io, admin@builderlync.io)
    - Clear mock integration data
    - Keep plan definitions and enterprise accounts for demo purposes

  2. Notes
    - Real super admin users will be created via Supabase Auth signup
    - Integration credentials will be added via the Settings UI
    - This prepares the system for production use
*/

-- Remove mock super admin users
-- Note: Only remove if they still have the default 'password123' hash
DELETE FROM super_admin_users
WHERE email IN ('owner@builderlync.io', 'ops@builderlync.io', 'admin@builderlync.io')
  AND password_hash = 'password123';

-- Clear any mock profiles associated with deleted users
DELETE FROM super_admin_profiles
WHERE staff_id NOT IN (SELECT id FROM super_admin_staff);

-- Reset integrations to disconnected state (remove any mock credentials)
UPDATE super_admin_integrations
SET
  status = 'disconnected',
  credentials = '{}'::jsonb,
  oauth_tokens = '{}'::jsonb,
  connected_at = NULL,
  connected_by = NULL,
  last_sync_at = NULL,
  last_error = NULL
WHERE integration_name IN ('twilio', 'stripe', 'jira', 'google_workspace');

-- Ensure integrations table has the correct default entries
INSERT INTO super_admin_integrations (integration_name, status, configuration) VALUES
  ('twilio', 'disconnected', '{"description": "SMS and voice communication platform"}'::jsonb),
  ('stripe', 'disconnected', '{"description": "Payment processing and billing"}'::jsonb),
  ('jira', 'disconnected', '{"description": "Support ticket management"}'::jsonb),
  ('google_workspace', 'disconnected', '{"description": "Email, calendar, and workspace tools"}'::jsonb)
ON CONFLICT (integration_name) DO UPDATE
SET
  status = 'disconnected',
  credentials = '{}'::jsonb,
  oauth_tokens = '{}'::jsonb,
  configuration = EXCLUDED.configuration,
  connected_at = NULL,
  connected_by = NULL,
  last_sync_at = NULL,
  last_error = NULL;