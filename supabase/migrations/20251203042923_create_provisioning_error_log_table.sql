/*
  # Create Provisioning Error Log Table

  This migration creates a table to track all provisioning errors for debugging and monitoring.

  ## New Table
  - `provisioning_errors`
    - `id` (uuid, primary key) - Unique error log ID
    - `account_id` (uuid, nullable) - Links to enterprise_accounts if available
    - `account_name` (text) - Account name for easy identification
    - `error_type` (text) - Type of error (validation, auth, organization, etc.)
    - `error_step` (text) - Which provisioning step failed
    - `error_message` (text) - Human-readable error message
    - `error_details` (jsonb) - Full error details including stack trace
    - `context` (jsonb) - Additional context (email, plan, etc.)
    - `resolved` (boolean) - Whether error has been resolved
    - `resolved_at` (timestamptz) - When error was resolved
    - `resolved_by` (text) - Who resolved the error
    - `created_at` (timestamptz) - When error occurred

  ## Indexes
  - Index on account_id for querying by account
  - Index on error_type for filtering
  - Index on created_at for time-based queries
  - Index on resolved for filtering unresolved errors

  ## Security
  - Enable RLS
  - Super admins can view and manage all errors
*/

-- Create provisioning_errors table
CREATE TABLE IF NOT EXISTS provisioning_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  account_name text,
  error_type text NOT NULL,
  error_step text NOT NULL,
  error_message text NOT NULL,
  error_details jsonb DEFAULT '{}'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provisioning_errors_account_id ON provisioning_errors(account_id);
CREATE INDEX IF NOT EXISTS idx_provisioning_errors_error_type ON provisioning_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_provisioning_errors_created_at ON provisioning_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provisioning_errors_resolved ON provisioning_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_provisioning_errors_error_step ON provisioning_errors(error_step);

-- Enable RLS
ALTER TABLE provisioning_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Super admins can view all errors
CREATE POLICY "Super admins can view all errors"
  ON provisioning_errors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id = auth.uid()
      AND status = 'active'
    )
  );

-- RLS Policy: Super admins can insert errors
CREATE POLICY "Super admins can insert errors"
  ON provisioning_errors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id = auth.uid()
      AND status = 'active'
    )
  );

-- RLS Policy: Super admins can update errors
CREATE POLICY "Super admins can update errors"
  ON provisioning_errors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id = auth.uid()
      AND status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id = auth.uid()
      AND status = 'active'
    )
  );

-- RLS Policy: Super admins can delete errors
CREATE POLICY "Super admins can delete errors"
  ON provisioning_errors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_users
      WHERE id = auth.uid()
      AND status = 'active'
    )
  );