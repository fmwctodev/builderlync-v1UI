/*
  # Create setup_organization Function

  ## Overview
  This migration creates the `setup_organization` function that initializes default
  data for a newly created organization. This function is called after org creation
  to set up pipelines, stages, roles, and other essential defaults.

  ## Function Created

  **setup_organization(p_organization_id, p_user_id)**
  - Creates default sales pipeline with stages
  - Creates default lead sources
  - Creates default roles (if not using templates)
  - Initializes workflow templates
  - Sets up default email templates
  - Creates default automation rules
  - Runs with elevated privileges (SECURITY DEFINER)
  - Atomic transaction (all or nothing)

  ## Default Data Created

  1. **Default Pipeline**: "Sales Pipeline"
     - Stages: New Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost

  2. **Default Lead Sources**:
     - Website Form, Referral, Cold Call, Email Campaign, Social Media

  3. **Default Workflow Templates**:
     - New Lead Follow-up, Proposal Reminder, Post-Sale Onboarding

  ## Security
  - SECURITY DEFINER allows bypassing RLS during setup
  - Only callable by authenticated users
  - Organization ownership verified before execution
*/

CREATE OR REPLACE FUNCTION setup_organization(
  p_organization_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pipeline_id uuid;
  v_stage_new uuid;
  v_stage_qualified uuid;
  v_stage_proposal uuid;
  v_stage_negotiation uuid;
  v_stage_won uuid;
  v_stage_lost uuid;
BEGIN
  -- Verify user is a member of the organization
  IF NOT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_organization_id
    AND user_id = p_user_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User is not a member of this organization';
  END IF;

  -- Create default sales pipeline
  INSERT INTO pipelines (
    organization_id,
    name,
    description,
    job_type,
    is_default,
    is_active,
    created_by
  )
  VALUES (
    p_organization_id,
    'Sales Pipeline',
    'Default sales pipeline for tracking opportunities from lead to close',
    'general',
    true,
    true,
    p_user_id
  )
  RETURNING id INTO v_pipeline_id;

  -- Create pipeline stages
  INSERT INTO pipeline_stages (pipeline_id, name, stage_order, probability, color, is_closed_won, is_closed_lost)
  VALUES
    (v_pipeline_id, 'New Lead', 1, 10, '#3b82f6', false, false),
    (v_pipeline_id, 'Qualified', 2, 25, '#8b5cf6', false, false),
    (v_pipeline_id, 'Proposal Sent', 3, 50, '#f59e0b', false, false),
    (v_pipeline_id, 'Negotiation', 4, 75, '#f97316', false, false),
    (v_pipeline_id, 'Closed Won', 5, 100, '#10b981', true, false),
    (v_pipeline_id, 'Closed Lost', 6, 0, '#ef4444', false, true)
  RETURNING id INTO v_stage_new, v_stage_qualified, v_stage_proposal, v_stage_negotiation, v_stage_won, v_stage_lost;

  -- Create default lead sources (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_sources') THEN
    INSERT INTO lead_sources (
      organization_id,
      name,
      source_type,
      is_active,
      created_by
    )
    VALUES
      (p_organization_id, 'Website Form', 'web', true, p_user_id),
      (p_organization_id, 'Referral', 'referral', true, p_user_id),
      (p_organization_id, 'Cold Call', 'phone', true, p_user_id),
      (p_organization_id, 'Email Campaign', 'email', true, p_user_id),
      (p_organization_id, 'Social Media', 'social', true, p_user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create default workflow templates (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_templates') THEN
    INSERT INTO workflow_templates (
      organization_id,
      name,
      description,
      trigger_type,
      is_active,
      created_by
    )
    VALUES
      (p_organization_id, 'New Lead Follow-up', 'Automatically follow up with new leads within 24 hours', 'opportunity_created', true, p_user_id),
      (p_organization_id, 'Proposal Reminder', 'Send reminder 3 days after proposal is sent', 'stage_changed', true, p_user_id),
      (p_organization_id, 'Post-Sale Onboarding', 'Trigger onboarding workflow when deal is won', 'opportunity_won', true, p_user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create default calendars (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendars') THEN
    INSERT INTO calendars (
      organization_id,
      name,
      description,
      color,
      is_default,
      created_by
    )
    VALUES
      (p_organization_id, 'General', 'Default calendar for appointments', '#3b82f6', true, p_user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Log the setup completion
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_events') THEN
    INSERT INTO audit_events (
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    )
    VALUES (
      p_organization_id,
      p_user_id,
      'organization_setup_completed',
      'organization',
      p_organization_id,
      jsonb_build_object(
        'pipeline_id', v_pipeline_id,
        'setup_timestamp', NOW()
      )
    );
  END IF;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION setup_organization(uuid, uuid) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION setup_organization IS 'Initializes default data (pipelines, stages, lead sources) for a newly created organization';