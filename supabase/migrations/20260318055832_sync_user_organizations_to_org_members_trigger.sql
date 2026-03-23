
/*
  # Sync user_organizations inserts to organization_members

  ## Problem
  Two separate tables track org membership: `user_organizations` and `organization_members`.
  The permissions system (useReputationPermissions and others) reads from `organization_members`,
  but some code paths (like organizationsApi.createOrganization) only wrote to `user_organizations`.
  This caused users to appear to have no role, blocking access to modules like Reputation.

  ## Changes
  - Adds a trigger function `sync_user_org_to_org_member` that mirrors every INSERT on
    `user_organizations` into `organization_members` (with is_active = true, role preserved).
  - Skips if a row already exists (ON CONFLICT DO NOTHING).
  - Attaches as AFTER INSERT trigger on `user_organizations`.
*/

CREATE OR REPLACE FUNCTION sync_user_org_to_org_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    is_active,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.organization_id,
    NEW.user_id,
    NEW.role,
    true,
    now(),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_org_to_org_member ON user_organizations;

CREATE TRIGGER trg_sync_user_org_to_org_member
  AFTER INSERT ON user_organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_org_to_org_member();
