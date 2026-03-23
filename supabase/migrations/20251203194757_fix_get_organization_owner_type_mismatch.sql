/*
  # Fix get_organization_owner Function Type Mismatch

  ## Problem
  The get_organization_owner function has a type mismatch where it returns
  varchar(255) but the function signature expects text for the email field.

  ## Changes
  - Update function to explicitly cast email to text type
  - Ensures compatibility with sync triggers

  ## Security
  - SECURITY DEFINER maintained
  - No permission changes
*/

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
    au.email::text,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text as full_name
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