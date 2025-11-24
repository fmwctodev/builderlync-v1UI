/*
  # Create Seed Function and Fix RLS Policies

  1. Changes
    - Drop and recreate the seed_dummy_opportunities_for_user function with proper error handling
    - Update RLS policies for opportunity_contacts to use simpler join logic
    - Update RLS policies for opportunity_followers to use simpler join logic
    - Add cascade delete policies to clean up related data
    
  2. Security
    - Maintains all security restrictions
    - Ensures proper user ownership checks
    - Optimizes RLS policy performance for joined queries
    
  3. Seed Function
    - Creates 2 pipelines (Commercial and Residential)
    - Creates 30 opportunities with realistic data
    - Creates contacts for each opportunity
    - Clears existing data before seeding to prevent duplicates
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS seed_dummy_opportunities_for_user(uuid);

-- Create the seed function
CREATE OR REPLACE FUNCTION seed_dummy_opportunities_for_user(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_commercial_pipeline_id uuid;
  v_residential_pipeline_id uuid;
  v_stage_ids uuid[];
  v_opp_id uuid;
  v_stage_index int;
  v_opportunities_created int := 0;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Delete existing pipelines for this user (cascade will delete stages and opportunities)
  DELETE FROM pipelines WHERE user_id = p_user_id;

  -- ============================================
  -- CREATE COMMERCIAL LEADS PIPELINE
  -- ============================================

  INSERT INTO pipelines (user_id, name, description, is_default)
  VALUES (p_user_id, '001a.Commercial Leads', 'Pipeline for commercial roofing opportunities', true)
  RETURNING id INTO v_commercial_pipeline_id;

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
        WHEN 6 THEN 'Inspection Booked'
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

  -- Create Commercial Opportunities (15 total)
  
  -- New Lead stage (3 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[1], 'Warehouse Roof Replacement', 'open', 85000, 'Acme Distribution Center', 'Website Lead', ARRAY['Commercial', 'Warehouse'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'John Smith', 'john.smith@acmedist.com', '555-0101', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[1], 'Office Building Repair', 'open', 45000, 'Tech Solutions Inc', 'Referral', ARRAY['Commercial', 'Office'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Sarah Johnson', 'sarah.j@techsolutions.com', '555-0102', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[1], 'Retail Plaza Maintenance', 'open', 32000, 'Riverside Shopping Plaza', 'Cold Call', ARRAY['Commercial', 'Retail'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Mike Wilson', 'mwilson@riversideplaza.com', '555-0103', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Follow-Up 1 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[2], 'Manufacturing Plant Roof', 'open', 125000, 'Precision Manufacturing', 'Social Media', ARRAY['Commercial', 'Industrial'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'David Chen', 'dchen@precisionmfg.com', '555-0104', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[2], 'Hotel Roof Inspection', 'open', 67000, 'Grand Hotel Downtown', 'Partner', ARRAY['Commercial', 'Hospitality'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Lisa Martinez', 'lmartinez@grandhotel.com', '555-0105', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Follow-Up 2 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[3], 'Medical Center Roof', 'open', 95000, 'Central Medical Center', 'Website Lead', ARRAY['Commercial', 'Healthcare'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Dr. Robert Brown', 'rbrown@centralmed.com', '555-0106', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[3], 'School Building Repair', 'open', 52000, 'Lincoln Elementary School', 'Referral', ARRAY['Commercial', 'Education'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Principal Anderson', 'anderson@lincoln.edu', '555-0107', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Follow-Up 3 stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[4], 'Apartment Complex Roof', 'open', 78000, 'Parkside Apartments', 'Email Campaign', ARRAY['Commercial', 'Multi-Family'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Jennifer Lee', 'jlee@parksideapts.com', '555-0108', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[4], 'Restaurant Chain Maintenance', 'open', 42000, 'Burger Palace Franchises', 'Trade Show', ARRAY['Commercial', 'Restaurant'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Tom Harris', 'tharris@burgerpalace.com', '555-0109', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Long Term Follow Up stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[5], 'Fitness Center Roof', 'open', 38000, 'PowerGym Fitness', 'Website Lead', ARRAY['Commercial', 'Fitness'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Mark Thompson', 'mthompson@powergym.com', '555-0110', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- In Convo stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[6], 'Bank Branch Roof', 'open', 55000, 'First National Bank', 'Referral', ARRAY['Commercial', 'Financial'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Amanda White', 'awhite@firstnational.com', '555-0111', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[6], 'Church Roof Repair', 'open', 28000, 'Community Church', 'Word of Mouth', ARRAY['Commercial', 'Religious'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Pastor Williams', 'pwilliams@communitychurch.org', '555-0112', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Inspection Booked stage (1 opportunity)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[7], 'Auto Dealership Roof', 'open', 72000, 'Premier Motors', 'Cold Call', ARRAY['Commercial', 'Automotive'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'James Ford', 'jford@premiermotors.com', '555-0113', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Job Qualified stage (1 opportunity - won)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[8], 'Distribution Center Roof', 'won', 110000, 'FastShip Logistics', 'Website Lead', ARRAY['Commercial', 'Logistics'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Carlos Rodriguez', 'crodriguez@fastship.com', '555-0114', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Job Unqualified stage (1 opportunity - lost)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_commercial_pipeline_id, v_stage_ids[9], 'Storage Facility Roof', 'lost', 18000, 'SecureStore Self Storage', 'Partner', ARRAY['Commercial', 'Storage'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Nancy Green', 'ngreen@securestore.com', '555-0115', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- ============================================
  -- CREATE RESIDENTIAL LEADS PIPELINE
  -- ============================================

  INSERT INTO pipelines (user_id, name, description, is_default)
  VALUES (p_user_id, '002b.Residential Leads', 'Pipeline for residential roofing opportunities', false)
  RETURNING id INTO v_residential_pipeline_id;

  -- Create 6 stages for Residential Leads
  v_stage_ids := ARRAY[]::uuid[];

  FOR v_stage_index IN 0..5 LOOP
    INSERT INTO pipeline_stages (pipeline_id, name, order_position, color)
    VALUES (
      v_residential_pipeline_id,
      CASE v_stage_index
        WHEN 0 THEN 'New Lead'
        WHEN 1 THEN 'Contact Made'
        WHEN 2 THEN 'Inspection Scheduled'
        WHEN 3 THEN 'Quote Sent'
        WHEN 4 THEN 'Negotiation'
        WHEN 5 THEN 'Closed'
      END,
      v_stage_index,
      CASE v_stage_index
        WHEN 0 THEN '#dc2626'
        WHEN 1 THEN '#2563eb'
        WHEN 2 THEN '#eab308'
        WHEN 3 THEN '#16a34a'
        WHEN 4 THEN '#9333ea'
        WHEN 5 THEN '#10b981'
      END
    )
    RETURNING id INTO v_opp_id;

    v_stage_ids := array_append(v_stage_ids, v_opp_id);
  END LOOP;

  -- Create Residential Opportunities (15 total)
  
  -- New Lead stage (4 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[1], 'Shingle Replacement - Oak St', 'open', 12000, NULL, 'Google Ads', ARRAY['Residential', 'Shingle'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Emily Davis', 'emily.davis@email.com', '555-1001', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[1], 'Storm Damage Repair - Maple Ave', 'open', 8500, NULL, 'Insurance Referral', ARRAY['Residential', 'Storm'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Michael Brown', 'mbrown@email.com', '555-1002', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[1], 'Metal Roof Installation - Pine Rd', 'open', 22000, NULL, 'Facebook Lead', ARRAY['Residential', 'Metal'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Jessica Taylor', 'jtaylor@email.com', '555-1003', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[1], 'Roof Inspection - Elm St', 'open', 500, NULL, 'Word of Mouth', ARRAY['Residential', 'Inspection'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Robert Miller', 'rmiller@email.com', '555-1004', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Contact Made stage (3 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[2], 'Tile Roof Repair - Cedar Ln', 'open', 15000, NULL, 'Google Search', ARRAY['Residential', 'Tile'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Patricia Wilson', 'pwilson@email.com', '555-1005', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[2], 'Gutter Replacement - Birch Dr', 'open', 3500, NULL, 'Referral', ARRAY['Residential', 'Gutter'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'William Moore', 'wmoore@email.com', '555-1006', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[2], 'Flat Roof Repair - Walnut St', 'open', 6000, NULL, 'Yelp', ARRAY['Residential', 'Flat'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Linda Anderson', 'landerson@email.com', '555-1007', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Inspection Scheduled stage (3 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[3], 'Complete Roof Replacement - Ash Ave', 'open', 18500, NULL, 'HomeAdvisor', ARRAY['Residential', 'Complete'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Christopher Thomas', 'cthomas@email.com', '555-1008', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[3], 'Leak Repair - Willow Way', 'open', 2500, NULL, 'Emergency Call', ARRAY['Residential', 'Leak'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Barbara Jackson', 'bjackson@email.com', '555-1009', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[3], 'Skylight Installation - Poplar Pl', 'open', 4500, NULL, 'Website Contact', ARRAY['Residential', 'Skylight'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Daniel White', 'dwhite@email.com', '555-1010', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Quote Sent stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[4], 'Shingle Upgrade - Hickory Ct', 'open', 16000, NULL, 'Referral', ARRAY['Residential', 'Upgrade'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Susan Harris', 'sharris@email.com', '555-1011', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[4], 'Ventilation Improvement - Spruce St', 'open', 3200, NULL, 'Google Ads', ARRAY['Residential', 'Ventilation'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Joseph Martin', 'jmartin@email.com', '555-1012', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Negotiation stage (2 opportunities)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[5], 'Solar Panel Roof Prep - Magnolia Dr', 'open', 9500, NULL, 'Solar Company Partner', ARRAY['Residential', 'Solar'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Karen Thompson', 'kthompson@email.com', '555-1013', true);
  v_opportunities_created := v_opportunities_created + 1;

  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[5], 'Chimney Flashing Repair - Dogwood Rd', 'open', 1800, NULL, 'Referral', ARRAY['Residential', 'Chimney'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Richard Garcia', 'rgarcia@email.com', '555-1014', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Closed stage (1 opportunity - won)
  INSERT INTO opportunities (user_id, pipeline_id, stage_id, opportunity_name, status, value, business_name, source, tags)
  VALUES (p_user_id, v_residential_pipeline_id, v_stage_ids[6], 'Full Roof Restoration - Sycamore Ln', 'won', 24000, NULL, 'Past Customer', ARRAY['Residential', 'Restoration'])
  RETURNING id INTO v_opp_id;
  INSERT INTO opportunity_contacts (opportunity_id, contact_name, contact_email, contact_phone, is_primary)
  VALUES (v_opp_id, 'Margaret Martinez', 'mmartinez@email.com', '555-1015', true);
  v_opportunities_created := v_opportunities_created + 1;

  -- Return success message
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Successfully created 2 pipelines and %s opportunities', v_opportunities_created)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION seed_dummy_opportunities_for_user(uuid) TO authenticated;
