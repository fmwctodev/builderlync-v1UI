
/*
  # Fix sync_organization_member_to_platform_user trigger function

  ## Problem
  The trigger function references columns `organization_id` and `role` on `platform_users`,
  but that table uses `account_id` (not `organization_id`) and `role_id` (not `role`).
  This caused all INSERT operations on `organization_members` to fail.

  ## Changes
  - Rewrites `sync_organization_member_to_platform_user` to use the correct column names
  - Uses `account_id` instead of `organization_id`
  - Omits `role` column (uses `role_id` which requires a lookup — left NULL to avoid errors)
  - Fixes the ON CONFLICT clause to match actual unique constraint columns
*/

CREATE OR REPLACE FUNCTION sync_organization_member_to_platform_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email text;
  v_user_name text;
BEGIN
  SELECT email, raw_user_meta_data->>'full_name'
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.user_id;

  INSERT INTO platform_users (
    id,
    user_id,
    account_id,
    email,
    full_name,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.user_id,
    NEW.organization_id,
    v_user_email,
    v_user_name,
    CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END,
    NEW.created_at,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status,
    updated_at = now();

  RETURN NEW;
END;
$$;
