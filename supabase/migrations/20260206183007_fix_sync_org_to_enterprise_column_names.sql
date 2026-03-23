/*
  # Fix sync_organization_to_enterprise_account Function Column Names

  1. Problem
    - The trigger function references `company_name` column but enterprise_accounts has `name`
    - The trigger function references `plan_tier` column but enterprise_accounts has `plan`
    - This causes INSERT to fail with "column company_name does not exist"

  2. Solution
    - Recreate the function using the correct column names: `name` and `plan`

  3. Security
    - No RLS changes
    - Function runs as SECURITY DEFINER to access auth.users
*/

CREATE OR REPLACE FUNCTION sync_organization_to_enterprise_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id uuid;
  v_owner_email text;
  v_owner_name text;
BEGIN
  SELECT om.user_id INTO v_owner_id
  FROM organization_members om
  WHERE om.organization_id = NEW.id
    AND om.role = 'owner'
    AND om.is_active = true
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    SELECT uo.user_id INTO v_owner_id
    FROM user_organizations uo
    WHERE uo.organization_id = NEW.id
      AND uo.role = 'owner'
    LIMIT 1;
  END IF;

  IF v_owner_id IS NOT NULL THEN
    SELECT email, raw_user_meta_data->>'full_name'
    INTO v_owner_email, v_owner_name
    FROM auth.users
    WHERE id = v_owner_id;
  END IF;

  INSERT INTO enterprise_accounts (
    id,
    organization_id,
    name,
    slug,
    plan,
    status,
    owner_name,
    owner_email,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.name,
    NEW.slug,
    COALESCE(NEW.subscription_tier, 'free'),
    CASE
      WHEN NEW.subscription_status = 'active' THEN 'active'
      WHEN NEW.subscription_status = 'trialing' THEN 'trial'
      ELSE 'inactive'
    END,
    v_owner_name,
    v_owner_email,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    owner_name = EXCLUDED.owner_name,
    owner_email = EXCLUDED.owner_email,
    updated_at = now();

  RETURN NEW;
END;
$$;
