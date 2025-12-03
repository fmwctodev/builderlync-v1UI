/*
  # Add metric_id column to dashboard_widgets

  1. Changes
    - Add `metric_id` column to dashboard_widgets table to reference shared metrics data
    - Update existing widgets to map to new metric IDs where applicable
*/

-- Add metric_id column
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS metric_id text;

-- Update existing widgets with metric IDs
UPDATE dashboard_widgets SET metric_id = widget_key WHERE metric_id IS NULL;