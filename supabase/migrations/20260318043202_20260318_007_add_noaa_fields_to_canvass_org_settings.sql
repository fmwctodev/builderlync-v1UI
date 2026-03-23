/*
  # Add NOAA Storm Data Engine fields to canvass_org_settings

  ## Summary
  Adds three new columns to the `canvass_org_settings` table to support the NOAA Storm
  Data Engine feature:

  ## New Columns (canvass_org_settings)
  - `noaa_mode_enabled` (boolean) - Whether NOAA MRMS mode is active for this org
  - `mrms_base_url` (text) - NOAA MRMS GRIB2 data endpoint URL
  - `hail_min_threshold_inches` (double precision) - Minimum hail size in inches to trigger event import

  ## Notes
  - All columns are optional with safe defaults
  - Uses IF NOT EXISTS pattern to be idempotent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'noaa_mode_enabled'
  ) THEN
    ALTER TABLE canvass_org_settings ADD COLUMN noaa_mode_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'mrms_base_url'
  ) THEN
    ALTER TABLE canvass_org_settings ADD COLUMN mrms_base_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'hail_min_threshold_inches'
  ) THEN
    ALTER TABLE canvass_org_settings ADD COLUMN hail_min_threshold_inches double precision DEFAULT 0.75;
  END IF;
END $$;
