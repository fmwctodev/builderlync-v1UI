/*
  # Add Unique Constraint on enterprise_accounts.organization_id

  1. Problem
    - The sync trigger uses ON CONFLICT (organization_id) but no unique constraint exists
    - This causes upsert operations to fail

  2. Solution
    - Add unique index on organization_id column

  3. Notes
    - Each organization should map to exactly one enterprise account
*/

CREATE UNIQUE INDEX IF NOT EXISTS enterprise_accounts_organization_id_key 
  ON enterprise_accounts (organization_id);
