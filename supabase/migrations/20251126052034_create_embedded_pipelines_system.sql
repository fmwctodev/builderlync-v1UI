/*
  # Create Embedded Pipelines System

  1. Changes
    - Add `pipeline_type` column to pipelines table ('system' or 'custom')
    - Create three embedded system pipelines with fixed UUIDs
    - Create 9 default stages for each pipeline
    - Update RLS policies to allow all users to read system pipelines
    - Add indexes for efficient filtering

  2. System Pipelines
    - Residential Pipeline (fixed UUID)
    - Commercial Pipeline (fixed UUID)
    - Insurance Pipeline (fixed UUID)

  3. Security
    - Allow all authenticated users to read system pipelines
    - Prevent deletion of system pipelines via RLS
    - Users can only delete their own custom pipelines
*/

-- Add pipeline_type column to pipelines table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'pipeline_type'
  ) THEN
    ALTER TABLE pipelines
    ADD COLUMN pipeline_type text DEFAULT 'custom'
    CHECK (pipeline_type IN ('system', 'custom'));

    RAISE NOTICE 'Added pipeline_type column to pipelines table';
  END IF;
END $$;

-- Create index for pipeline_type
CREATE INDEX IF NOT EXISTS idx_pipelines_pipeline_type ON pipelines(pipeline_type);

-- Create index for combined pipeline_type and job_type
CREATE INDEX IF NOT EXISTS idx_pipelines_type_job_type ON pipelines(pipeline_type, job_type);

-- Fixed UUIDs for system pipelines (these will be the same across all environments)
DO $$
DECLARE
  v_residential_pipeline_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_commercial_pipeline_id uuid := '00000000-0000-0000-0000-000000000002'::uuid;
  v_insurance_pipeline_id uuid := '00000000-0000-0000-0000-000000000003'::uuid;
  v_system_user_id uuid;
  v_stage_id uuid;
BEGIN
  -- Get first user or create a system user placeholder
  SELECT id INTO v_system_user_id FROM auth.users LIMIT 1;
  
  IF v_system_user_id IS NULL THEN
    RAISE NOTICE 'No users found. System pipelines will be created when first user signs up.';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating system pipelines for user: %', v_system_user_id;

  -- ============================================
  -- CREATE RESIDENTIAL PIPELINE
  -- ============================================
  
  INSERT INTO pipelines (id, user_id, name, description, is_default, job_type, pipeline_type, created_at, updated_at)
  VALUES (
    v_residential_pipeline_id,
    v_system_user_id,
    'Residential',
    'System pipeline for residential opportunities',
    false,
    'Residential',
    'system',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create stages for Residential pipeline
  INSERT INTO pipeline_stages (pipeline_id, name, order_position, color, include_in_funnel, include_in_distribution)
  VALUES
    (v_residential_pipeline_id, 'New Lead', 0, '#dc2626', true, true),
    (v_residential_pipeline_id, 'Follow-Up 1', 1, '#2563eb', true, true),
    (v_residential_pipeline_id, 'Follow-Up 2', 2, '#eab308', true, true),
    (v_residential_pipeline_id, 'Follow-Up 3', 3, '#16a34a', true, true),
    (v_residential_pipeline_id, 'Long Term Follow Up', 4, '#9333ea', true, true),
    (v_residential_pipeline_id, 'In Convo', 5, '#10b981', true, true),
    (v_residential_pipeline_id, 'Inspection/Estimate Booked (Creates Job)', 6, '#059669', true, true),
    (v_residential_pipeline_id, 'Job Qualified', 7, '#6366f1', true, true),
    (v_residential_pipeline_id, 'Job Unqualified', 8, '#ef4444', true, true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created Residential system pipeline';

  -- ============================================
  -- CREATE COMMERCIAL PIPELINE
  -- ============================================
  
  INSERT INTO pipelines (id, user_id, name, description, is_default, job_type, pipeline_type, created_at, updated_at)
  VALUES (
    v_commercial_pipeline_id,
    v_system_user_id,
    'Commercial',
    'System pipeline for commercial opportunities',
    true,
    'Commercial',
    'system',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create stages for Commercial pipeline
  INSERT INTO pipeline_stages (pipeline_id, name, order_position, color, include_in_funnel, include_in_distribution)
  VALUES
    (v_commercial_pipeline_id, 'New Lead', 0, '#dc2626', true, true),
    (v_commercial_pipeline_id, 'Follow-Up 1', 1, '#2563eb', true, true),
    (v_commercial_pipeline_id, 'Follow-Up 2', 2, '#eab308', true, true),
    (v_commercial_pipeline_id, 'Follow-Up 3', 3, '#16a34a', true, true),
    (v_commercial_pipeline_id, 'Long Term Follow Up', 4, '#9333ea', true, true),
    (v_commercial_pipeline_id, 'In Convo', 5, '#10b981', true, true),
    (v_commercial_pipeline_id, 'Inspection/Estimate Booked (Creates Job)', 6, '#059669', true, true),
    (v_commercial_pipeline_id, 'Job Qualified', 7, '#6366f1', true, true),
    (v_commercial_pipeline_id, 'Job Unqualified', 8, '#ef4444', true, true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created Commercial system pipeline';

  -- ============================================
  -- CREATE INSURANCE PIPELINE
  -- ============================================
  
  INSERT INTO pipelines (id, user_id, name, description, is_default, job_type, pipeline_type, created_at, updated_at)
  VALUES (
    v_insurance_pipeline_id,
    v_system_user_id,
    'Insurance',
    'System pipeline for insurance claim opportunities',
    false,
    'Insurance',
    'system',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create stages for Insurance pipeline
  INSERT INTO pipeline_stages (pipeline_id, name, order_position, color, include_in_funnel, include_in_distribution)
  VALUES
    (v_insurance_pipeline_id, 'New Lead', 0, '#dc2626', true, true),
    (v_insurance_pipeline_id, 'Follow-Up 1', 1, '#2563eb', true, true),
    (v_insurance_pipeline_id, 'Follow-Up 2', 2, '#eab308', true, true),
    (v_insurance_pipeline_id, 'Follow-Up 3', 3, '#16a34a', true, true),
    (v_insurance_pipeline_id, 'Long Term Follow Up', 4, '#9333ea', true, true),
    (v_insurance_pipeline_id, 'In Convo', 5, '#10b981', true, true),
    (v_insurance_pipeline_id, 'Inspection/Estimate Booked (Creates Job)', 6, '#059669', true, true),
    (v_insurance_pipeline_id, 'Job Qualified', 7, '#6366f1', true, true),
    (v_insurance_pipeline_id, 'Job Unqualified', 8, '#ef4444', true, true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created Insurance system pipeline';

  RAISE NOTICE '================================================';
  RAISE NOTICE 'SUCCESS! Created embedded pipeline system:';
  RAISE NOTICE '- 3 System Pipelines (Residential, Commercial, Insurance)';
  RAISE NOTICE '- 27 Stages total (9 per pipeline)';
  RAISE NOTICE '- Fixed UUIDs for consistent references';
  RAISE NOTICE '================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating embedded pipelines: %', SQLERRM;
END $$;

-- Update RLS policies to allow reading system pipelines
DROP POLICY IF EXISTS "Users can view system pipelines" ON pipelines;
CREATE POLICY "Users can view system pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (pipeline_type = 'system' OR user_id = auth.uid());

-- Prevent deletion of system pipelines
DROP POLICY IF EXISTS "Users can delete own custom pipelines" ON pipelines;
CREATE POLICY "Users can delete own custom pipelines"
  ON pipelines FOR DELETE
  TO authenticated
  USING (pipeline_type = 'custom' AND user_id = auth.uid());

-- Update existing delete policy to prevent system pipeline deletion
DROP POLICY IF EXISTS "Users can delete own pipelines" ON pipelines;
CREATE POLICY "Users can delete own pipelines"
  ON pipelines FOR DELETE
  TO authenticated
  USING (pipeline_type = 'custom' AND user_id = auth.uid());
