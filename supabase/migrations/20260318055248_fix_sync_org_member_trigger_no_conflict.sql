
/*
  # Fix sync_organization_member_to_platform_user — remove invalid ON CONFLICT

  ## Problem
  platform_users has no unique constraint on user_id, so ON CONFLICT (user_id) fails.

  ## Fix
  Check for an existing row by user_id before inserting to avoid duplicates safely.
*/

CREATE OR REPLACE FUNCTION sync_organization_member_to_platform_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email text;
  v_user_name text;
  v_exists boolean;
BEGIN
  SELECT email, raw_user_meta_data->>'full_name'
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.user_id;

  SELECT EXISTS (
    SELECT 1 FROM platform_users WHERE user_id = NEW.user_id
  ) INTO v_exists;

  IF NOT v_exists THEN
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
    );
  ELSE
    UPDATE platform_users SET
      email = v_user_email,
      full_name = v_user_name,
      status = CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;
