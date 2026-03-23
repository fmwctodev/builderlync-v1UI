/*
  # Enhance Usage Tracking Tables

  1. Changes to usage_tracking
    - Add contacts and jobs_created columns
    - Add last_updated_at column

  2. New table: account_limit_overrides
    - JSONB-based limit overrides per account
    - Replaces fixed columns in usage_limits with flexible structure
*/

-- Add missing columns to usage_tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_tracking' AND column_name = 'contacts') THEN
    ALTER TABLE usage_tracking ADD COLUMN contacts int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_tracking' AND column_name = 'jobs_created') THEN
    ALTER TABLE usage_tracking ADD COLUMN jobs_created int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usage_tracking' AND column_name = 'last_updated_at') THEN
    ALTER TABLE usage_tracking ADD COLUMN last_updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create account_limit_overrides table
CREATE TABLE IF NOT EXISTS account_limit_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

CREATE INDEX IF NOT EXISTS idx_limit_overrides_account ON account_limit_overrides(account_id);

ALTER TABLE account_limit_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access to limit overrides"
  ON account_limit_overrides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_limit_overrides_updated_at ON account_limit_overrides;
CREATE TRIGGER update_limit_overrides_updated_at
  BEFORE UPDATE ON account_limit_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
