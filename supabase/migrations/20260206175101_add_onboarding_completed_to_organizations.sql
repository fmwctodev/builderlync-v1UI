/*
  # Add onboarding_completed column to organizations

  1. Modified Tables
    - `organizations`
      - Added `onboarding_completed` (boolean, default false)

  2. Notes
    - This column is required by the organization creation flow, protected route checks, and onboarding completion logic
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE organizations ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;
