/*
  # Add Job Type to Pipelines

  1. Changes
    - Add `job_type` column to pipelines table
    - Set valid job types as: Residential, Commercial, Insurance
    - Add CHECK constraint to enforce valid job types
    - Create index on job_type column for efficient filtering
    - Update existing pipelines based on their names

  2. Security
    - No RLS changes needed (existing policies remain)
*/

-- Add job_type column to pipelines table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'job_type'
  ) THEN
    ALTER TABLE pipelines
    ADD COLUMN job_type text DEFAULT 'Commercial'
    CHECK (job_type IN ('Residential', 'Commercial', 'Insurance'));

    RAISE NOTICE 'Added job_type column to pipelines table';
  END IF;
END $$;

-- Update existing pipelines to assign appropriate job types based on names
UPDATE pipelines
SET job_type = CASE
  WHEN LOWER(name) LIKE '%residential%' THEN 'Residential'
  WHEN LOWER(name) LIKE '%commercial%' THEN 'Commercial'
  WHEN LOWER(name) LIKE '%insurance%' THEN 'Insurance'
  ELSE 'Commercial'
END
WHERE job_type IS NULL OR job_type = 'Commercial';

-- Create index for efficient filtering by job_type
CREATE INDEX IF NOT EXISTS idx_pipelines_job_type ON pipelines(job_type);

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Job type column added successfully to pipelines table';
  RAISE NOTICE 'Existing pipelines updated with appropriate job types';
  RAISE NOTICE 'Index created for job_type filtering';
END $$;
