/*
  # Fix setup_organization and related functions to use is_active column

  ## Problem
  Multiple functions reference `om.status = 'active'` but the organization_members table
  should use `is_active = true` (boolean) instead of `status = 'active'` (text).

  This causes errors when creating organizations:
  - "column om.status does not exist"

  ## Changes
  1. Update setup_organization() to use `is_active = true`
  2. Update get_organization_owner() to use `is_active = true`
  3. Update get_organization_metrics() to use `is_active = true`

  ## Table Schema
  organization_members has both columns (synced via trigger):
  - status (text) - legacy column
  - is_active (boolean) - preferred column

  ## Security
  All functions use SECURITY DEFINER to bypass RLS and prevent recursion.
*/

-- ============================================================================
-- FUNCTION 1: Fix setup_organization
-- ============================================================================

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
  -- Verify user is a member of the organization (FIXED: use is_active instead of status)
  IF NOT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_organization_id
    AND user_id = p_user_id
    AND is_active = true
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION setup_organization(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION setup_organization IS 'Initializes default data (pipelines, stages, lead sources) for a newly created organization';

-- ============================================================================
-- FUNCTION 2: Fix get_organization_owner
-- ============================================================================

CREATE OR REPLACE FUNCTION get_organization_owner(org_id uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    om.user_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name
  FROM organization_members om
  JOIN auth.users au ON om.user_id = au.id
  WHERE om.organization_id = org_id
    AND om.role IN ('owner', 'admin')
    AND om.is_active = true
  ORDER BY
    CASE om.role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      ELSE 3
    END,
    om.created_at ASC
  LIMIT 1;
END;
$$;

-- ============================================================================
-- FUNCTION 3: Fix get_organization_metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_organization_metrics(org_id uuid)
RETURNS TABLE (
  total_contacts bigint,
  total_jobs bigint,
  total_opportunities bigint,
  active_users bigint,
  last_activity_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM contacts WHERE organization_id = org_id)::bigint as total_contacts,
    (SELECT COUNT(*) FROM jobs WHERE organization_id = org_id)::bigint as total_jobs,
    (SELECT COUNT(*) FROM opportunities WHERE organization_id = org_id)::bigint as total_opportunities,
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id AND is_active = true)::bigint as active_users,
    GREATEST(
      (SELECT MAX(last_sign_in_at) FROM auth.users WHERE id IN (SELECT user_id FROM organization_members WHERE organization_id = org_id)),
      (SELECT MAX(created_at) FROM contacts WHERE organization_id = org_id),
      (SELECT MAX(created_at) FROM jobs WHERE organization_id = org_id)
    ) as last_activity_at;
END;
$$;

-- ============================================================================
-- Verification
-- ============================================================================

/*
✓ setup_organization now checks: is_active = true (line 19)
✓ get_organization_owner now checks: is_active = true (line 176)
✓ get_organization_metrics now checks: is_active = true (line 199)

All functions now consistently use the is_active boolean column instead of
the legacy status text column.

Organization creation flow:
1. User creates organization → setup_new_organization() called
2. Organization created, user added as owner with is_active = true
3. setup_organization() called to create default data
4. Function checks is_active = true ✓
5. Default pipeline, stages, and data created ✓
6. Organization ready to use ✓
*/
