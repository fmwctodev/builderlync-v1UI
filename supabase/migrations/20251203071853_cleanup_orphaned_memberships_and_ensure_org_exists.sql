/*
  # Cleanup Orphaned Memberships and Ensure Organization Consistency

  ## Problem
  Users may have organization_members records pointing to organizations that don't exist.
  This causes white screen issues when the app tries to load these organizations.

  ## Solution
  1. Identify orphaned memberships (memberships without corresponding organizations)
  2. For each orphaned membership, create the missing organization
  3. Add a helper function to ensure user has at least one valid organization

  ## Safety
  - Uses SECURITY DEFINER to bypass RLS
  - Creates organizations for orphaned memberships
  - Does not delete any data
*/

-- ============================================================================
-- PART 1: Create function to fix orphaned memberships
-- ============================================================================

CREATE OR REPLACE FUNCTION fix_orphaned_memberships()
RETURNS TABLE (
  user_id uuid,
  old_org_id uuid,
  new_org_id uuid,
  org_slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership RECORD;
  v_user RECORD;
  v_new_org_id uuid;
  v_org_name text;
  v_org_slug text;
BEGIN
  -- Find all orphaned memberships
  FOR v_membership IN
    SELECT DISTINCT om.user_id, om.organization_id, om.role
    FROM organization_members om
    LEFT JOIN organizations o ON om.organization_id = o.id
    WHERE o.id IS NULL
      AND om.is_active = true
  LOOP
    -- Get user details
    SELECT
      au.id,
      au.email,
      COALESCE(
        au.raw_user_meta_data->>'company_name',
        au.raw_user_meta_data->>'full_name',
        SPLIT_PART(au.email, '@', 1)
      ) as default_name
    INTO v_user
    FROM auth.users au
    WHERE au.id = v_membership.user_id;

    IF v_user.id IS NOT NULL THEN
      -- Generate organization name and slug
      v_org_name := COALESCE(v_user.default_name, 'My Organization');
      v_org_slug := LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(v_org_name, '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        )
      );

      -- Ensure slug is unique
      IF EXISTS (SELECT 1 FROM organizations WHERE slug = v_org_slug) THEN
        v_org_slug := v_org_slug || '-' || EXTRACT(EPOCH FROM NOW())::bigint;
      END IF;

      -- Create the missing organization
      INSERT INTO organizations (
        name,
        slug,
        created_by,
        subscription_status,
        subscription_tier,
        onboarding_completed
      )
      VALUES (
        v_org_name,
        v_org_slug,
        v_user.id,
        'trial',
        'starter',
        false
      )
      RETURNING id INTO v_new_org_id;

      -- Update the orphaned membership to point to the new organization
      UPDATE organization_members
      SET organization_id = v_new_org_id
      WHERE user_id = v_membership.user_id
        AND organization_id = v_membership.organization_id;

      -- Return info about the fix
      RETURN QUERY SELECT
        v_membership.user_id,
        v_membership.organization_id,
        v_new_org_id,
        v_org_slug;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION fix_orphaned_memberships IS 'Fixes orphaned organization_members by creating missing organizations';

-- ============================================================================
-- PART 2: Run the cleanup immediately
-- ============================================================================

DO $$
DECLARE
  v_result RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_result IN SELECT * FROM fix_orphaned_memberships()
  LOOP
    v_count := v_count + 1;
    RAISE NOTICE 'Fixed orphaned membership for user % - created org % with slug %',
      v_result.user_id,
      v_result.new_org_id,
      v_result.org_slug;
  END LOOP;

  IF v_count = 0 THEN
    RAISE NOTICE 'No orphaned memberships found - database is clean';
  ELSE
    RAISE NOTICE 'Fixed % orphaned membership(s)', v_count;
  END IF;
END;
$$;

-- ============================================================================
-- PART 3: Create function to ensure user has organization
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_user_has_organization(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_org_name text;
  v_org_slug text;
  v_user_email text;
  v_user_name text;
BEGIN
  -- Check if user already has an organization
  SELECT organization_id INTO v_org_id
  FROM organization_members
  WHERE user_id = p_user_id
    AND is_active = true
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    -- Verify the organization actually exists
    IF EXISTS (SELECT 1 FROM organizations WHERE id = v_org_id) THEN
      RETURN v_org_id;
    END IF;
  END IF;

  -- User has no valid organization - create one
  SELECT email, COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1))
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = p_user_id;

  v_org_name := COALESCE(v_user_name, 'My Organization');
  v_org_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(v_org_name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );

  -- Ensure slug is unique
  IF EXISTS (SELECT 1 FROM organizations WHERE slug = v_org_slug) THEN
    v_org_slug := v_org_slug || '-' || EXTRACT(EPOCH FROM NOW())::bigint;
  END IF;

  -- Call setup_new_organization to create everything properly
  SELECT * INTO v_org_id FROM setup_new_organization(
    p_user_id,
    v_org_name,
    v_org_slug
  );

  RETURN v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION ensure_user_has_organization(uuid) TO authenticated;

COMMENT ON FUNCTION ensure_user_has_organization IS 'Ensures a user has at least one valid organization, creating one if needed';