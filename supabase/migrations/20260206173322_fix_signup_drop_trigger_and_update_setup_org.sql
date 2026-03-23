/*
  # Fix Signup Flow - Drop Duplicate Trigger and Update Organization Setup

  1. Changes
    - Drop the `handle_new_user_trigger` on `auth.users` to prevent duplicate organization creation
    - The trigger was inserting into `organization_members` without setting required `slug` column on organizations
    - Update `setup_new_organization` to also insert into `organization_members` for backward compatibility
    - The saga now handles organization creation explicitly via the RPC function

  2. Security
    - No RLS changes
    - `setup_new_organization` remains SECURITY DEFINER to allow org creation during signup

  3. Important Notes
    - Organization creation is now handled exclusively by the `setup_new_organization` RPC
    - Both `user_organizations` and `organization_members` tables are populated for compatibility
*/

DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

CREATE OR REPLACE FUNCTION public.setup_new_organization(p_user_id uuid, p_org_name text, p_org_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  INSERT INTO organizations (name, slug, created_by)
  VALUES (p_org_name, p_org_slug, p_user_id)
  RETURNING id INTO v_org_id;

  INSERT INTO user_organizations (user_id, organization_id, role)
  VALUES (p_user_id, v_org_id, 'owner');

  INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at)
  VALUES (v_org_id, p_user_id, 'owner', true, now())
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  INSERT INTO pipelines (organization_id, name, is_default, stages)
  VALUES (
    v_org_id,
    'Sales Pipeline',
    true,
    '[
      {"name": "Lead", "order": 1},
      {"name": "Qualified", "order": 2},
      {"name": "Proposal", "order": 3},
      {"name": "Negotiation", "order": 4},
      {"name": "Closed Won", "order": 5}
    ]'::jsonb
  );

  RETURN v_org_id;
END;
$function$;