/*
  # Add Reporting Configuration Fields to Pipeline Stages

  1. Changes
    - Add `include_in_funnel` boolean column to pipeline_stages
    - Add `include_in_distribution` boolean column to pipeline_stages
    - Set default values to true for both fields
    - Update existing rows to have true values
    
  2. Purpose
    - Allow users to configure which stages appear in funnel chart reports
    - Allow users to configure which stages appear in stage distribution reports
    - Provide granular control over reporting metrics
    
  3. Security
    - No RLS changes needed (inherits from pipeline_stages existing policies)
*/

-- Add include_in_funnel column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'pipeline_stages' 
      AND column_name = 'include_in_funnel'
  ) THEN
    ALTER TABLE pipeline_stages ADD COLUMN include_in_funnel boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Add include_in_distribution column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'pipeline_stages' 
      AND column_name = 'include_in_distribution'
  ) THEN
    ALTER TABLE pipeline_stages ADD COLUMN include_in_distribution boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Update any existing rows to have true values (if they don't already)
UPDATE pipeline_stages 
SET 
  include_in_funnel = COALESCE(include_in_funnel, true),
  include_in_distribution = COALESCE(include_in_distribution, true)
WHERE include_in_funnel IS NULL OR include_in_distribution IS NULL;
