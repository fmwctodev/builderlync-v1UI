/*
  # Add Missing Columns to Dashboard Widgets Table

  This migration adds the missing columns that are referenced by the frontend code
  but were not included in the original table creation.

  ## Changes
  - Add `category` column for widget categorization
  - Add `name` column for widget display name
  - Add `description` column for widget descriptions
  - Add `icon` column for widget icons
  - Add `default_config` column for default widget configuration
*/

-- Add missing columns to dashboard_widgets
ALTER TABLE dashboard_widgets 
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS default_config jsonb DEFAULT '{}'::jsonb;