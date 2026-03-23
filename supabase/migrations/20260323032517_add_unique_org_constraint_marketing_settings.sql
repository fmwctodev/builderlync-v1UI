/*
  # Add unique constraint for marketing_approval_settings.organization_id

  Enables upsert operations keyed on organization_id.
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'marketing_approval_settings_organization_id_key'
  ) THEN
    ALTER TABLE marketing_approval_settings
      ADD CONSTRAINT marketing_approval_settings_organization_id_key
      UNIQUE (organization_id);
  END IF;
END $$;
