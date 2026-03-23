/*
  # Add subscription_status to organizations table

  This migration adds the missing subscription_status column to the organizations table.
  This column is critical for the onboarding flow to determine if a user has paid.

  ## Changes
  - Add subscription_status column with default 'pending_payment'
  - Add index for faster queries
*/

-- Add subscription_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_status text DEFAULT 'pending_payment';
    CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);
  END IF;
END $$;