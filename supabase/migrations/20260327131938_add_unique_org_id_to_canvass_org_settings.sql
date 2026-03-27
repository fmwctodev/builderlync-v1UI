/*
  # Add unique constraint on organization_id for canvass_org_settings

  1. Changes
    - Add unique index on organization_id to ensure one settings row per org
    - Add index on organization_id for query performance

  2. Important Notes
    - The table was previously keyed by user_id only
    - Now that settings are org-scoped, we need uniqueness on organization_id
*/

CREATE UNIQUE INDEX IF NOT EXISTS canvass_org_settings_organization_id_key
  ON canvass_org_settings (organization_id);
