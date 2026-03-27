/*
  # Add Storm Intelligence Settings Columns to canvass_org_settings

  ## Summary
  Extends the `canvass_org_settings` table with four new columns to support
  the Storm Intelligence Settings tab:

  ## New Columns

  1. `tracked_event_types` (text[], default all types)
     - The storm event categories the org wants to monitor.
     - Defaults include: hail, tornado, severe_thunderstorm, high_wind, flood, winter_storm, hurricane

  2. `default_historical_days_back` (integer, default 90)
     - The default lookback window (in days) for the Historical Storm Paths tab.
     - Range: 7–365 days.

  3. `alert_recipient_user_ids` (uuid[], default empty)
     - IDs of org staff members who should receive storm alert notifications.

  4. `alert_recipient_external_emails` (text[], default empty)
     - External email addresses (contacts not in the system) for storm alerts.

  ## Notes
  - All columns use safe defaults so existing rows are unaffected.
  - No destructive operations are performed.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'tracked_event_types'
  ) THEN
    ALTER TABLE canvass_org_settings
      ADD COLUMN tracked_event_types text[] DEFAULT ARRAY[
        'hail', 'tornado', 'severe_thunderstorm', 'high_wind', 'flood', 'winter_storm', 'hurricane'
      ];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'default_historical_days_back'
  ) THEN
    ALTER TABLE canvass_org_settings
      ADD COLUMN default_historical_days_back integer DEFAULT 90;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'alert_recipient_user_ids'
  ) THEN
    ALTER TABLE canvass_org_settings
      ADD COLUMN alert_recipient_user_ids uuid[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'alert_recipient_external_emails'
  ) THEN
    ALTER TABLE canvass_org_settings
      ADD COLUMN alert_recipient_external_emails text[] DEFAULT '{}';
  END IF;
END $$;
