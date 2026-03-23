/*
  # Create Error Logs System

  ## Overview
  This migration creates infrastructure for tracking application errors and database issues
  to improve monitoring, debugging, and reliability.

  ## Changes

  1. **Error Logs Table**
     - `id` (uuid, primary key)
     - `organization_id` (uuid, nullable) - organization context
     - `user_id` (uuid, nullable) - user who experienced the error
     - `severity` (text) - info, warning, error, critical
     - `error_type` (text) - category of error (database, api, ui, etc.)
     - `error_code` (text) - specific error identifier
     - `message` (text) - human-readable error message
     - `stack_trace` (text) - full stack trace for debugging
     - `context` (jsonb) - additional context (query params, state, etc.)
     - `resolved` (boolean) - whether error has been addressed
     - `resolved_at` (timestamptz) - when error was resolved
     - `resolved_by` (uuid) - who resolved the error
     - `created_at` (timestamptz)

  2. **Security**
     - Enable RLS on error_logs table
     - Policies for organization-scoped access

  3. **Indexes**
     - Performance indexes for common queries

  4. **Helper Functions**
     - Cleanup function for old logs
     - Statistics function for error monitoring
*/

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  severity text NOT NULL DEFAULT 'error',
  error_type text NOT NULL,
  error_code text,
  message text NOT NULL,
  stack_trace text,
  context jsonb DEFAULT '{}'::jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT error_logs_severity_check CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_organization_id ON error_logs(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved) WHERE resolved = false;

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_logs

-- Allow users to view errors in their organization
CREATE POLICY "Users can view errors in their organization"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow users to insert errors
CREATE POLICY "Users can insert errors"
  ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to resolve errors in their organization
CREATE POLICY "Users can resolve errors in their organization"
  ON error_logs
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to cleanup old error logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < now() - interval '90 days'
  AND resolved = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
  p_organization_id uuid DEFAULT NULL,
  p_hours_back integer DEFAULT 24
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_errors', COUNT(*),
    'critical_errors', COUNT(*) FILTER (WHERE severity = 'critical'),
    'error_errors', COUNT(*) FILTER (WHERE severity = 'error'),
    'warning_errors', COUNT(*) FILTER (WHERE severity = 'warning'),
    'unresolved_errors', COUNT(*) FILTER (WHERE resolved = false),
    'errors_by_type', (
      SELECT jsonb_object_agg(error_type, count)
      FROM (
        SELECT error_type, COUNT(*) as count
        FROM error_logs
        WHERE created_at > now() - (p_hours_back || ' hours')::interval
        AND (p_organization_id IS NULL OR organization_id = p_organization_id)
        GROUP BY error_type
        ORDER BY count DESC
        LIMIT 10
      ) t
    )
  ) INTO v_result
  FROM error_logs
  WHERE created_at > now() - (p_hours_back || ' hours')::interval
  AND (p_organization_id IS NULL OR organization_id = p_organization_id);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;