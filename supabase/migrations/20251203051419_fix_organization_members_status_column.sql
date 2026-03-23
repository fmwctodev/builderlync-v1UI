/*
  # Fix organization_members status column reference

  1. Changes
    - Fix `get_organization_owner()` to use `status = 'active'` instead of `is_active = true`
    - Fix `get_organization_metrics()` to use `status = 'active'` instead of `is_active = true`
  
  2. Reason
    - organization_members table has `status` column, not `is_active`
    - This was causing "structure of query does not match function result type" error
    - When functions tried to query non-existent column, PostgreSQL threw an error
*/

-- Fix get_organization_owner function
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
    AND om.status = 'active'
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

-- Fix get_organization_metrics function
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
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id AND status = 'active')::bigint as active_users,
    GREATEST(
      (SELECT MAX(last_sign_in_at) FROM auth.users WHERE id IN (SELECT user_id FROM organization_members WHERE organization_id = org_id)),
      (SELECT MAX(created_at) FROM contacts WHERE organization_id = org_id),
      (SELECT MAX(created_at) FROM jobs WHERE organization_id = org_id)
    ) as last_activity_at;
END;
$$;