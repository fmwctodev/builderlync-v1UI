/*
  # Sync Organization Members to Platform Users

  ## Overview
  Creates a comprehensive sync system to map real organization members to platform users,
  replacing mock data with actual production user data.

  ## Changes

  1. **Helper Functions**
     - `map_organization_role_to_platform_role()` - Maps org roles to platform roles
     - `calculate_user_status()` - Determines user status from activity
     - `get_user_metadata()` - Extracts user profile data from auth.users

  2. **Main Sync Function**
     - `sync_organization_members_to_platform_users()` - Syncs all members
     - Creates platform_user for each organization_member
     - Links to auth.users for real data
     - Maintains relationship with enterprise_accounts

  3. **Data Mapping**
     - Real emails from auth.users
     - Actual login timestamps
     - Organization membership roles
     - User activity and status

  ## Security
  - Functions use SECURITY DEFINER for admin access
  - Maintains data integrity with proper error handling
  - Validates foreign key relationships
*/

-- Function to map organization role to platform role
CREATE OR REPLACE FUNCTION map_organization_role_to_platform_role(org_role text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_id uuid;
BEGIN
  -- Map organization roles to platform roles
  CASE org_role
    WHEN 'owner' THEN
      SELECT id INTO role_id FROM roles 
      WHERE name = 'Account Admin' AND scope = 'global' LIMIT 1;
    WHEN 'admin' THEN
      SELECT id INTO role_id FROM roles 
      WHERE name = 'Account Admin' AND scope = 'global' LIMIT 1;
    WHEN 'manager' THEN
      SELECT id INTO role_id FROM roles 
      WHERE name = 'Manager' AND scope = 'global' LIMIT 1;
    WHEN 'member' THEN
      SELECT id INTO role_id FROM roles 
      WHERE name = 'User' AND scope = 'global' LIMIT 1;
    WHEN 'guest' THEN
      SELECT id INTO role_id FROM roles 
      WHERE name = 'Read Only' AND scope = 'global' LIMIT 1;
    ELSE
      -- Default to User role
      SELECT id INTO role_id FROM roles 
      WHERE name = 'User' AND scope = 'global' LIMIT 1;
  END CASE;

  RETURN role_id;
END;
$$;

-- Function to calculate user status
CREATE OR REPLACE FUNCTION calculate_user_status(
  is_active_member boolean,
  last_sign_in timestamptz
)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- If member is not active, they're disabled
  IF NOT is_active_member THEN
    RETURN 'disabled';
  END IF;

  -- If never logged in, they're invited
  IF last_sign_in IS NULL THEN
    RETURN 'invited';
  END IF;

  -- If logged in within 90 days, they're active
  IF last_sign_in > NOW() - INTERVAL '90 days' THEN
    RETURN 'active';
  END IF;

  -- Otherwise they're inactive
  RETURN 'inactive';
END;
$$;

-- Function to get user metadata from auth.users
CREATE OR REPLACE FUNCTION get_user_full_name(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  full_name text;
  user_email text;
BEGIN
  SELECT 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      email
    ),
    email
  INTO full_name, user_email
  FROM auth.users
  WHERE id = user_id;

  RETURN COALESCE(full_name, user_email, 'Unknown User');
END;
$$;

-- Main sync function
CREATE OR REPLACE FUNCTION sync_organization_members_to_platform_users()
RETURNS TABLE (
  total_processed integer,
  created_count integer,
  updated_count integer,
  skipped_count integer,
  error_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
  auth_user_record RECORD;
  enterprise_account_id uuid;
  platform_role_id uuid;
  user_status text;
  user_full_name text;
  total integer := 0;
  created integer := 0;
  updated integer := 0;
  skipped integer := 0;
  errors integer := 0;
  existing_platform_user_id uuid;
BEGIN
  -- Loop through all active organization members
  FOR member_record IN
    SELECT
      om.id as member_id,
      om.user_id,
      om.organization_id,
      om.role as org_role,
      om.is_active,
      om.created_at as member_created_at,
      o.enterprise_account_id,
      o.name as org_name
    FROM organization_members om
    JOIN organizations o ON om.organization_id = o.id
    WHERE o.enterprise_account_id IS NOT NULL
  LOOP
    BEGIN
      total := total + 1;

      -- Get auth user data
      SELECT
        id,
        email,
        last_sign_in_at,
        created_at,
        raw_user_meta_data
      INTO auth_user_record
      FROM auth.users
      WHERE id = member_record.user_id;

      -- Skip if auth user not found
      IF auth_user_record.id IS NULL THEN
        skipped := skipped + 1;
        RAISE NOTICE 'Skipped member %: auth user not found', member_record.member_id;
        CONTINUE;
      END IF;

      -- Skip if no enterprise account
      IF member_record.enterprise_account_id IS NULL THEN
        skipped := skipped + 1;
        RAISE NOTICE 'Skipped member %: no enterprise account', member_record.member_id;
        CONTINUE;
      END IF;

      -- Map role
      platform_role_id := map_organization_role_to_platform_role(member_record.org_role);

      -- Calculate status
      user_status := calculate_user_status(member_record.is_active, auth_user_record.last_sign_in_at);

      -- Get full name
      user_full_name := get_user_full_name(member_record.user_id);

      -- Check if platform_user already exists for this user and account
      SELECT id INTO existing_platform_user_id
      FROM platform_users
      WHERE user_id = member_record.user_id
        AND account_id = member_record.enterprise_account_id;

      -- Upsert platform_user
      IF existing_platform_user_id IS NULL THEN
        -- Insert new platform user
        INSERT INTO platform_users (
          user_id,
          account_id,
          email,
          full_name,
          status,
          role_id,
          last_login_at,
          created_at,
          updated_at,
          metadata
        ) VALUES (
          member_record.user_id,
          member_record.enterprise_account_id,
          auth_user_record.email,
          user_full_name,
          user_status,
          platform_role_id,
          auth_user_record.last_sign_in_at,
          member_record.member_created_at,
          NOW(),
          jsonb_build_object(
            'organization_id', member_record.organization_id,
            'organization_name', member_record.org_name,
            'organization_role', member_record.org_role,
            'synced_from', 'organization_members',
            'synced_at', NOW()
          )
        );
        created := created + 1;
      ELSE
        -- Update existing platform user
        UPDATE platform_users
        SET
          email = auth_user_record.email,
          full_name = user_full_name,
          status = user_status,
          role_id = platform_role_id,
          last_login_at = auth_user_record.last_sign_in_at,
          updated_at = NOW(),
          metadata = jsonb_build_object(
            'organization_id', member_record.organization_id,
            'organization_name', member_record.org_name,
            'organization_role', member_record.org_role,
            'synced_from', 'organization_members',
            'synced_at', NOW()
          )
        WHERE id = existing_platform_user_id;
        updated := updated + 1;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      RAISE NOTICE 'Error syncing member %: %', member_record.member_id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT total, created, updated, skipped, errors;
END;
$$;

-- Add user_id column to platform_users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'platform_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE platform_users
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_platform_users_user_id ON platform_users(user_id);
  END IF;
END $$;

-- Create composite unique constraint for user_id and account_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'platform_users_user_id_account_id_key'
  ) THEN
    -- First, remove any duplicate entries
    DELETE FROM platform_users a USING platform_users b
    WHERE a.id < b.id
      AND a.user_id = b.user_id
      AND a.account_id = b.account_id
      AND a.user_id IS NOT NULL
      AND b.user_id IS NOT NULL;

    -- Now add the unique constraint
    ALTER TABLE platform_users
    ADD CONSTRAINT platform_users_user_id_account_id_key
    UNIQUE (user_id, account_id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_users_status ON platform_users(status);
CREATE INDEX IF NOT EXISTS idx_platform_users_role_id ON platform_users(role_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_last_login ON platform_users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
