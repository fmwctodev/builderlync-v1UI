-- ============================================
-- Seed Dummy Pipelines and Opportunities
-- ============================================
--
-- This script creates two demo pipelines with sample opportunities:
-- 1. Commercial Leads (15 opportunities)
-- 2. Residential Leads (15 opportunities)
--
-- Instructions:
-- 1. Log into your application first to authenticate
-- 2. Run this script in Supabase SQL Editor
-- 3. The data will be created for the currently authenticated user
--
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_commercial_pipeline_id uuid;
  v_residential_pipeline_id uuid;
  v_stage_ids uuid[];
  v_opp_id uuid;
  v_stage_index int;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();

  -- If no authenticated user, exit with message
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found. Please log into the application first, then run this script.';
  END IF;

  RAISE NOTICE 'Creating pipelines for user: %', v_user_id;

  -- ============================================
  -- CREATE COMMERCIAL LEADS PIPELINE
  -- ============================================

  INSERT INTO pipelines (user_id, name, description, is_default)
  VALUES (v_user_id, 'Commercial Leads', 'Pipeline for commercial roofing opportunities', false)
  RETURNING id INTO v_commercial_pipeline_id;

  RAISE NOTICE 'Created Commercial Leads pipeline: %', v_commercial_pipeline_id;

  -- Create 9 stages for Commercial Leads
  v_stage_ids := ARRAY[]::uuid[];

  FOR v_stage_index IN 0..8 LOOP
    INSERT INTO pipeline_stages (pipeline_id, name, order_position, color)
    VALUES (
      v_commercial_pipeline_id,
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
      END
    )
    RETURNING id INTO v_opp_id;

    v_stage_ids := array_append(v_stage_ids, v_opp_id);
  END LOOP;

  -- Create Commercial Opportunities

  -- New Lead stage (3 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[1], 'Warehouse Roof Replacement', 'open', 85000, 'Acme Distribution Center', 'Website Lead', ARRAY['Commercial', 'Warehouse'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'John Smith', 'john.smith@acmedist.com', '555-0101', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[1], 'Office Building Repair', 'open', 45000, 'Tech Solutions Inc', 'Referral', ARRAY['Commercial', 'Office'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Sarah Johnson', 'sarah.j@techsolutions.com', '555-0102', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[1], 'Retail Plaza Maintenance', 'open', 32000, 'Riverside Shopping Plaza', 'Cold Call', ARRAY['Commercial', 'Retail'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Mike Wilson', 'mwilson@riversideplaza.com', '555-0103', true);

  -- Follow-Up 1 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[2], 'Manufacturing Plant Roof', 'open', 125000, 'Precision Manufacturing', 'Social Media', ARRAY['Commercial', 'Industrial'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'David Chen', 'dchen@precisionmfg.com', '555-0104', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[2], 'Hotel Roof Inspection', 'open', 67000, 'Grand Hotel Downtown', 'Partner', ARRAY['Commercial', 'Hospitality'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Lisa Martinez', 'lmartinez@grandhotel.com', '555-0105', true);

  -- Follow-Up 2 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[3], 'Medical Center Roof', 'open', 95000, 'Central Medical Center', 'Website Lead', ARRAY['Commercial', 'Healthcare'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Dr. Robert Brown', 'rbrown@centralmed.com', '555-0106', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[3], 'School Building Repair', 'open', 52000, 'Lincoln Elementary School', 'Referral', ARRAY['Commercial', 'Education'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Principal Anderson', 'anderson@lincoln.edu', '555-0107', true);

  -- Follow-Up 3 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[4], 'Apartment Complex Roof', 'open', 78000, 'Parkside Apartments', 'Email Campaign', ARRAY['Commercial', 'Multi-Family'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Jennifer Lee', 'jlee@parksideapts.com', '555-0108', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[4], 'Restaurant Chain Maintenance', 'open', 42000, 'Burger Palace Franchises', 'Trade Show', ARRAY['Commercial', 'Restaurant'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Tom Harris', 'tharris@burgerpalace.com', '555-0109', true);

  -- Long Term Follow Up stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[5], 'Fitness Center Roof', 'open', 38000, 'PowerGym Fitness', 'Website Lead', ARRAY['Commercial', 'Fitness'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Mark Thompson', 'mthompson@powergym.com', '555-0110', true);

  -- In Convo stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[6], 'Bank Branch Roof', 'open', 55000, 'First National Bank', 'Referral', ARRAY['Commercial', 'Financial'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Patricia Davis', 'pdavis@firstnational.com', '555-0111', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[6], 'Auto Dealership Roof', 'open', 48000, 'Premium Auto Sales', 'Cold Call', ARRAY['Commercial', 'Automotive'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Steve Garcia', 'sgarcia@premiumauto.com', '555-0112', true);

  -- Inspection/Estimate Booked stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags, appointment_time)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[7], 'Church Building Roof', 'open', 72000, 'First Community Church', 'Partner', ARRAY['Commercial', 'Religious'], now() + interval '3 days')
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Pastor Williams', 'pastor@firstcommunity.org', '555-0113', true);

  -- Job Qualified stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[8], 'Corporate HQ Replacement', 'won', 185000, 'Global Corp Headquarters', 'Website Lead', ARRAY['Commercial', 'Corporate'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Emily White', 'ewhite@globalcorp.com', '555-0114', true);

  -- Job Unqualified stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (v_user_id, v_commercial_pipeline_id, v_stage_ids[9], 'Strip Mall Inspection', 'lost', 28000, 'Valley Strip Center', 'Cold Call', ARRAY['Commercial', 'Retail'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Frank Miller', 'fmiller@valleystrip.com', '555-0115', true);

  RAISE NOTICE 'Created 15 opportunities for Commercial Leads pipeline';

  -- ============================================
  -- CREATE RESIDENTIAL LEADS PIPELINE
  -- ============================================

  INSERT INTO pipelines (user_id, name, description, is_default)
  VALUES (v_user_id, 'Residential Leads', 'Pipeline for residential roofing opportunities', true)
  RETURNING id INTO v_residential_pipeline_id;

  RAISE NOTICE 'Created Residential Leads pipeline: %', v_residential_pipeline_id;

  -- Create 9 stages for Residential Leads
  v_stage_ids := ARRAY[]::uuid[];

  FOR v_stage_index IN 0..8 LOOP
    INSERT INTO pipeline_stages (pipeline_id, name, order_position, color)
    VALUES (
      v_residential_pipeline_id,
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
      END
    )
    RETURNING id INTO v_opp_id;

    v_stage_ids := array_append(v_stage_ids, v_opp_id);
  END LOOP;

  -- Create Residential Opportunities

  -- New Lead stage (3 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[1], '123 Oak Street Roof', 'open', 12500, 'Website Lead', ARRAY['Residential', 'Shingle'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'James Taylor', 'james.taylor@email.com', '555-0201', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[1], '456 Maple Drive Repair', 'open', 8500, 'Referral', ARRAY['Residential', 'Repair'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Mary Clark', 'mary.clark@email.com', '555-0202', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[1], '789 Pine Avenue Replacement', 'open', 15000, 'Social Media', ARRAY['Residential', 'Metal Roof'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Robert King', 'robert.king@email.com', '555-0203', true);

  -- Follow-Up 1 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[2], '321 Elm Street Roof', 'open', 11000, 'Email Campaign', ARRAY['Residential', 'Shingle'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Susan Wright', 'susan.wright@email.com', '555-0204', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[2], '654 Birch Lane Inspection', 'open', 9500, 'Partner', ARRAY['Residential', 'Inspection'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Michael Scott', 'michael.scott@email.com', '555-0205', true);

  -- Follow-Up 2 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[3], '987 Cedar Court Replacement', 'open', 13500, 'Website Lead', ARRAY['Residential', 'Tile Roof'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Linda Green', 'linda.green@email.com', '555-0206', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[3], '147 Walnut Street Repair', 'open', 7500, 'Referral', ARRAY['Residential', 'Leak Repair'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Christopher Hall', 'chris.hall@email.com', '555-0207', true);

  -- Follow-Up 3 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[4], '258 Willow Way Roof', 'open', 14000, 'Cold Call', ARRAY['Residential', 'Shingle'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Barbara Lewis', 'barbara.lewis@email.com', '555-0208', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[4], '369 Spruce Road Maintenance', 'open', 6500, 'Trade Show', ARRAY['Residential', 'Maintenance'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Daniel Adams', 'daniel.adams@email.com', '555-0209', true);

  -- Long Term Follow Up stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[5], '741 Ash Boulevard Roof', 'open', 10500, 'Website Lead', ARRAY['Residential', 'Shingle'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Nancy Young', 'nancy.young@email.com', '555-0210', true);

  -- In Convo stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[6], '852 Hickory Place Replacement', 'open', 16000, 'Referral', ARRAY['Residential', 'Premium Shingle'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Kevin Moore', 'kevin.moore@email.com', '555-0211', true);

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[6], '963 Poplar Drive Roof', 'open', 12000, 'Social Media', ARRAY['Residential', 'Flat Roof'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Carol Martin', 'carol.martin@email.com', '555-0212', true);

  -- Inspection/Estimate Booked stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags, appointment_time)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[7], '159 Magnolia Circle Roof', 'open', 13000, 'Partner', ARRAY['Residential', 'Shingle'], now() + interval '5 days')
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Thomas Jackson', 'thomas.jackson@email.com', '555-0213', true);

  -- Job Qualified stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[8], '357 Sycamore Lane Replacement', 'won', 17500, 'Website Lead', ARRAY['Residential', 'Metal Roof'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Elizabeth Turner', 'elizabeth.turner@email.com', '555-0214', true);

  -- Job Unqualified stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, source, tags)
  VALUES (v_user_id, v_residential_pipeline_id, v_stage_ids[9], '486 Dogwood Street Repair', 'lost', 5000, 'Cold Call', ARRAY['Residential', 'Budget'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Paul Phillips', 'paul.phillips@email.com', '555-0215', true);

  RAISE NOTICE 'Created 15 opportunities for Residential Leads pipeline';

  RAISE NOTICE '================================================';
  RAISE NOTICE 'SUCCESS! Created dummy data:';
  RAISE NOTICE '- 2 Pipelines (Commercial Leads, Residential Leads)';
  RAISE NOTICE '- 18 Stages total (9 per pipeline)';
  RAISE NOTICE '- 30 Opportunities (15 per pipeline)';
  RAISE NOTICE '- 30 Contacts';
  RAISE NOTICE '================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating dummy data: %', SQLERRM;
END $$;
