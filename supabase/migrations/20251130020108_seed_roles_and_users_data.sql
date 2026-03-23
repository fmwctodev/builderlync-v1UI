/*
  # Seed Roles and Users Data

  1. Global Role Templates
    - Super Admin (full access)
    - Account Admin (account management)
    - Manager (operations management)
    - User (standard user)
    - Read Only (view-only access)

  2. Sample Users
    - Create sample users for each account
    - Assign appropriate roles
*/

-- Insert global role templates
INSERT INTO roles (name, description, scope, is_default, permissions) VALUES
  (
    'Super Admin',
    'Full platform access with all permissions',
    'global',
    false,
    '{"dashboard":"admin","contacts":"admin","opportunities":"admin","jobs":"admin","claims":"admin","ai":"admin","marketing":"admin","sites":"admin","billing":"admin","reports":"admin","admin":"admin"}'::jsonb
  ),
  (
    'Account Admin',
    'Full account management with all module access',
    'global',
    true,
    '{"dashboard":"admin","contacts":"admin","opportunities":"admin","jobs":"admin","claims":"admin","ai":"write","marketing":"admin","sites":"admin","billing":"admin","reports":"admin","admin":"admin"}'::jsonb
  ),
  (
    'Manager',
    'Operations management with write access to core modules',
    'global',
    false,
    '{"dashboard":"read","contacts":"write","opportunities":"write","jobs":"write","claims":"write","ai":"write","marketing":"write","sites":"read","billing":"read","reports":"read","admin":"none"}'::jsonb
  ),
  (
    'User',
    'Standard user with basic access',
    'global',
    false,
    '{"dashboard":"read","contacts":"write","opportunities":"write","jobs":"read","claims":"read","ai":"read","marketing":"read","sites":"none","billing":"none","reports":"read","admin":"none"}'::jsonb
  ),
  (
    'Read Only',
    'View-only access to most modules',
    'global',
    false,
    '{"dashboard":"read","contacts":"read","opportunities":"read","jobs":"read","claims":"read","ai":"none","marketing":"read","sites":"none","billing":"none","reports":"read","admin":"none"}'::jsonb
  )
ON CONFLICT (name, scope, account_id) DO NOTHING;

-- Get role IDs for reference
DO $$
DECLARE
  admin_role_id uuid;
  manager_role_id uuid;
  user_role_id uuid;
  account_ids uuid[];
  account_id uuid;
  counter int := 0;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Account Admin' AND scope = 'global';
  SELECT id INTO manager_role_id FROM roles WHERE name = 'Manager' AND scope = 'global';
  SELECT id INTO user_role_id FROM roles WHERE name = 'User' AND scope = 'global';

  -- Get first 10 account IDs
  SELECT ARRAY(SELECT id FROM enterprise_accounts LIMIT 10) INTO account_ids;

  -- Create sample users for each account
  FOREACH account_id IN ARRAY account_ids
  LOOP
    counter := counter + 1;
    
    -- Account admin
    INSERT INTO platform_users (account_id, email, full_name, status, role_id, last_login_at)
    VALUES (
      account_id,
      'admin' || counter || '@account.com',
      'Account Admin ' || counter,
      'active',
      admin_role_id,
      now() - (random() * interval '30 days')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Manager
    INSERT INTO platform_users (account_id, email, full_name, status, role_id, last_login_at)
    VALUES (
      account_id,
      'manager' || counter || '@account.com',
      'Manager ' || counter,
      'active',
      manager_role_id,
      now() - (random() * interval '60 days')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Regular users
    INSERT INTO platform_users (account_id, email, full_name, status, role_id, last_login_at)
    VALUES (
      account_id,
      'user' || counter || 'a@account.com',
      'User ' || counter || 'A',
      'active',
      user_role_id,
      now() - (random() * interval '90 days')
    )
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO platform_users (account_id, email, full_name, status, role_id, last_login_at)
    VALUES (
      account_id,
      'user' || counter || 'b@account.com',
      'User ' || counter || 'B',
      'active',
      user_role_id,
      now() - (random() * interval '45 days')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Invited user
    INSERT INTO platform_users (account_id, email, full_name, status, role_id, invited_at)
    VALUES (
      account_id,
      'invited' || counter || '@account.com',
      'Invited User ' || counter,
      'invited',
      user_role_id,
      now() - (random() * interval '7 days')
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
END $$;