/*
  # Add response format tracking to property data cache

  1. Changes
    - Adds `response_format_detected` column to `property_data_cache` table
    - Column stores the detected format of the API response ('json', 'xml', 'unknown')
    - Helps with debugging and analytics for different API response types

  2. Column Details
    - `response_format_detected` (text, nullable): The detected response format
    - Constrained to values: 'json', 'xml', 'unknown'
    - Defaults to NULL for backward compatibility with existing records

  3. Notes
    - Non-destructive migration - only adds new column
    - Existing records will have NULL for this column
    - New records will have the format set when cached
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'property_data_cache'
    AND column_name = 'response_format_detected'
  ) THEN
    ALTER TABLE property_data_cache
    ADD COLUMN response_format_detected text
    CHECK (response_format_detected IS NULL OR response_format_detected IN ('json', 'xml', 'unknown'));

    COMMENT ON COLUMN property_data_cache.response_format_detected IS 'Detected format of the API response (json, xml, unknown)';
  END IF;
END $$;
