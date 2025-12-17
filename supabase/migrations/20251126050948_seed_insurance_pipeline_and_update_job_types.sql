/*
  # Seed Insurance Pipeline and Update Job Types

  1. Changes
    - Update existing Commercial and Residential pipelines with appropriate job_type
    - Create new Insurance Leads pipeline with 9 stages
    - Create 10 sample insurance opportunities across various stages

  2. Details
    - Assigns 'Commercial' job_type to Commercial Leads pipelines
    - Assigns 'Residential' job_type to Residential Leads pipelines
    - Creates Insurance Leads pipeline with same 9-stage structure
    - Adds diverse insurance opportunities with contacts
*/

DO $$
DECLARE
  v_user_id uuid;
  v_insurance_pipeline_id uuid;
  v_stage_ids uuid[];
  v_opp_id uuid;
  v_stage_index int;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();

  -- If no authenticated user, try to get first user from auth.users
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found. Skipping insurance pipeline seed data.';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating Insurance pipeline for user: %', v_user_id;

  -- Update existing pipelines with job_type
  UPDATE pipelines
  SET job_type = 'Commercial'
  WHERE LOWER(name) LIKE '%commercial%' AND user_id = v_user_id;

  UPDATE pipelines
  SET job_type = 'Residential'
  WHERE LOWER(name) LIKE '%residential%' AND user_id = v_user_id;

  RAISE NOTICE 'Updated existing pipelines with job types';

  -- Check if Insurance pipeline already exists for this user
  SELECT id INTO v_insurance_pipeline_id
  FROM pipelines
  WHERE user_id = v_user_id AND LOWER(name) LIKE '%insurance%'
  LIMIT 1;

  IF v_insurance_pipeline_id IS NOT NULL THEN
    RAISE NOTICE 'Insurance pipeline already exists. Skipping creation.';
    RETURN;
  END IF;

  -- ============================================
  -- CREATE INSURANCE LEADS PIPELINE
  -- ============================================

  INSERT INTO pipelines (user_id, name, description, is_default, job_type)
  VALUES (v_user_id, 'Insurance Leads', 'Pipeline for insurance claim roofing opportunities', false, 'Insurance')
  RETURNING id INTO v_insurance_pipeline_id;

  RAISE NOTICE 'Created Insurance Leads pipeline: %', v_insurance_pipeline_id;

  -- Create 9 stages for Insurance Leads
  v_stage_ids := ARRAY[]::uuid[];

  FOR v_stage_index IN 0..8 LOOP
    INSERT INTO pipeline_stages (pipeline_id, name, order_position, color, include_in_funnel, include_in_distribution)
    VALUES (
      v_insurance_pipeline_id,
      CASE v_stage_index
        WHEN 0 THEN 'New Lead'
        WHEN 1 THEN 'Follow-Up 1'
        WHEN 2 THEN 'Follow-Up 2'
        WHEN 3 THEN 'Follow-Up 3'
        WHEN 4 THEN 'Long Term Follow Up'
        WHEN 5 THEN 'In Convo'
        WHEN 6 THEN 'Inspection/Estimate Booked (Creates Job)'
        WHEN 7 THEN 'Job Qualified'
        WHEN 8 THEN 'Job Unqualified'
      END,
      v_stage_index,
      CASE v_stage_index
        WHEN 0 THEN '#dc2626'
        WHEN 1 THEN '#2563eb'
        WHEN 2 THEN '#eab308'
        WHEN 3 THEN '#16a34a'
        WHEN 4 THEN '#9333ea'
        WHEN 5 THEN '#10b981'
        WHEN 6 THEN '#059669'
        WHEN 7 THEN '#6366f1'
        WHEN 8 THEN '#ef4444'
      END,
      true,
      true
    )
    RETURNING id INTO v_opp_id;

    v_stage_ids := array_append(v_stage_ids, v_opp_id);
  END LOOP;

  -- Create Insurance Opportunities

  -- New Lead stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[1], 'Storm Damage Claim - Oak Street', 'open', 22000, 'State Farm Insurance', 'Insurance Referral', ARRAY['Insurance', 'Storm Damage'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Jennifer Adams', 'jadams@statefarm.com', '555-0301', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[1], 'Hail Damage Assessment', 'open', 18500, 'Allstate Insurance', 'Insurance Referral', ARRAY['Insurance', 'Hail Damage'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Robert Chen', 'rchen@allstate.com', '555-0302', true);

  -- Follow-Up 1 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[2], 'Wind Damage Repair - Maple Drive', 'open', 15000, 'Progressive Insurance', 'Insurance Referral', ARRAY['Insurance', 'Wind Damage'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Michelle Rodriguez', 'mrodriguez@progressive.com', '555-0303', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[2], 'Fire Damage Restoration', 'open', 45000, 'Liberty Mutual', 'Insurance Referral', ARRAY['Insurance', 'Fire Damage'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'David Martinez', 'dmartinez@libertymutual.com', '555-0304', true);

  -- Follow-Up 2 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[3], 'Ice Dam Damage Claim', 'open', 12000, 'Farmers Insurance', 'Insurance Referral', ARRAY['Insurance', 'Ice Dam'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Amanda Lee', 'alee@farmersinsurance.com', '555-0305', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[3], 'Tornado Damage Assessment', 'open', 38000, 'USAA Insurance', 'Insurance Referral', ARRAY['Insurance', 'Tornado'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'James Wilson', 'jwilson@usaa.com', '555-0306', true);

  -- Follow-Up 3 stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[4], 'Hurricane Damage Claim', 'open', 55000, 'Nationwide Insurance', 'Insurance Referral', ARRAY['Insurance', 'Hurricane'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Patricia Garcia', 'pgarcia@nationwide.com', '555-0307', true);

  -- In Convo stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[6], 'Lightning Strike Damage', 'open', 19000, 'Geico Insurance', 'Insurance Referral', ARRAY['Insurance', 'Lightning'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Christopher Taylor', 'ctaylor@geico.com', '555-0308', true);

  -- Inspection/Estimate Booked stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags, appointment_time)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[7], 'Tree Fall Damage Repair', 'open', 26000, 'Travelers Insurance', 'Insurance Referral', ARRAY['Insurance', 'Tree Damage'], now() + interval '2 days')
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Lisa Anderson', 'landerson@travelers.com', '555-0309', true);

  -- Job Qualified stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_insurance_pipeline_id, v_stage_ids[8], 'Storm Damage Complete Replacement', 'won', 42000, 'American Family Insurance', 'Insurance Referral', ARRAY['Insurance', 'Complete Replacement'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Michael Brown', 'mbrown@amfam.com', '555-0310', true);

  RAISE NOTICE 'Created 10 opportunities for Insurance Leads pipeline';

  RAISE NOTICE '================================================';
  RAISE NOTICE 'SUCCESS! Insurance pipeline created with:';
  RAISE NOTICE '- 1 Insurance Leads Pipeline';
  RAISE NOTICE '- 9 Stages';
  RAISE NOTICE '- 10 Insurance Opportunities';
  RAISE NOTICE '- 10 Contacts';
  RAISE NOTICE '================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating insurance pipeline: %', SQLERRM;
END $$;
