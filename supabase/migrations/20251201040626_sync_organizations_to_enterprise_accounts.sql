/*
  # Sync Organizations to Enterprise Accounts

  ## Overview
  Creates a comprehensive sync system to map real organizations to enterprise accounts,
  replacing mock data with actual production data.

  ## Changes

  1. **Sync Function**
     - `sync_organizations_to_enterprise_accounts()` - Main sync function
     - Maps real organizations to enterprise accounts
     - Calculates real metrics from actual usage data
     - Links organization_id, owner_user_id, and owner_platform_user_id

  2. **Health Score Calculation**
     - `calculate_account_health_score()` - Calculates health based on multiple factors
     - Engagement: Last login, active users (40%)
     - Data Health: Contacts, jobs created (30%)
     - Onboarding: Setup completion (20%)
     - Billing: Payment status (10%)

  3. **Helper Functions**
     - `get_organization_owner()` - Gets primary owner of organization
     - `get_organization_metrics()` - Aggregates real usage metrics
     - `get_onboarding_completion()` - Calculates onboarding percentage

  ## Security
  - Functions use SECURITY DEFINER for admin access
  - Maintains existing RLS policies on enterprise_accounts
*/

-- Function to get organization owner (first admin member)
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

-- Function to get organization metrics
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
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id AND is_active = true)::bigint as active_users,
    GREATEST(
      (SELECT MAX(last_sign_in_at) FROM auth.users WHERE id IN (SELECT user_id FROM organization_members WHERE organization_id = org_id)),
      (SELECT MAX(created_at) FROM contacts WHERE organization_id = org_id),
      (SELECT MAX(created_at) FROM jobs WHERE organization_id = org_id)
    ) as last_activity_at;
END;
$$;

-- Function to get onboarding completion percentage
CREATE OR REPLACE FUNCTION get_onboarding_completion(org_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completion_pct integer := 0;
  step_count integer := 0;
  completed_count integer := 0;
BEGIN
  -- Check if organization_onboarding table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_onboarding') THEN
    SELECT
      COUNT(*),
      SUM(CASE WHEN completed = true THEN 1 ELSE 0 END)
    INTO step_count, completed_count
    FROM organization_onboarding
    WHERE organization_id = org_id;

    IF step_count > 0 THEN
      completion_pct := (completed_count * 100 / step_count)::integer;
    END IF;
  END IF;

  -- If no onboarding data, calculate based on presence of data
  IF step_count = 0 THEN
    completed_count := 0;
    step_count := 5;

    -- Has organization settings
    IF EXISTS (SELECT 1 FROM organization_settings WHERE organization_id = org_id) THEN
      completed_count := completed_count + 1;
    END IF;

    -- Has contacts
    IF EXISTS (SELECT 1 FROM contacts WHERE organization_id = org_id LIMIT 1) THEN
      completed_count := completed_count + 1;
    END IF;

    -- Has jobs
    IF EXISTS (SELECT 1 FROM jobs WHERE organization_id = org_id LIMIT 1) THEN
      completed_count := completed_count + 1;
    END IF;

    -- Has multiple users
    IF (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id) > 1 THEN
      completed_count := completed_count + 1;
    END IF;

    -- Has integrations
    IF EXISTS (SELECT 1 FROM integrations WHERE organization_id = org_id LIMIT 1) THEN
      completed_count := completed_count + 1;
    END IF;

    completion_pct := (completed_count * 100 / step_count)::integer;
  END IF;

  RETURN completion_pct;
END;
$$;

-- Function to calculate account health score
CREATE OR REPLACE FUNCTION calculate_account_health_score(org_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  engagement_score integer := 0;
  data_health_score integer := 0;
  onboarding_score integer := 0;
  billing_score integer := 0;
  total_score integer := 0;
  days_since_login integer;
  has_recent_activity boolean;
  contact_count bigint;
  job_count bigint;
  active_user_count bigint;
  org_subscription_status text;
BEGIN
  -- Get organization data
  SELECT subscription_status INTO org_subscription_status
  FROM organizations WHERE id = org_id;

  -- Get metrics
  SELECT total_contacts, total_jobs, active_users
  INTO contact_count, job_count, active_user_count
  FROM get_organization_metrics(org_id);

  -- Calculate days since last login
  SELECT EXTRACT(DAY FROM NOW() - MAX(last_sign_in_at))::integer
  INTO days_since_login
  FROM auth.users
  WHERE id IN (SELECT user_id FROM organization_members WHERE organization_id = org_id);

  -- ENGAGEMENT SCORE (40 points max)
  -- Last login activity (20 points)
  IF days_since_login IS NULL OR days_since_login > 30 THEN
    engagement_score := engagement_score + 0;
  ELSIF days_since_login <= 1 THEN
    engagement_score := engagement_score + 20;
  ELSIF days_since_login <= 7 THEN
    engagement_score := engagement_score + 15;
  ELSIF days_since_login <= 14 THEN
    engagement_score := engagement_score + 10;
  ELSE
    engagement_score := engagement_score + 5;
  END IF;

  -- Active users (20 points)
  IF active_user_count >= 5 THEN
    engagement_score := engagement_score + 20;
  ELSIF active_user_count >= 3 THEN
    engagement_score := engagement_score + 15;
  ELSIF active_user_count >= 2 THEN
    engagement_score := engagement_score + 10;
  ELSIF active_user_count >= 1 THEN
    engagement_score := engagement_score + 5;
  END IF;

  -- DATA HEALTH SCORE (30 points max)
  -- Contacts (15 points)
  IF contact_count >= 100 THEN
    data_health_score := data_health_score + 15;
  ELSIF contact_count >= 50 THEN
    data_health_score := data_health_score + 12;
  ELSIF contact_count >= 20 THEN
    data_health_score := data_health_score + 9;
  ELSIF contact_count >= 5 THEN
    data_health_score := data_health_score + 6;
  ELSIF contact_count >= 1 THEN
    data_health_score := data_health_score + 3;
  END IF;

  -- Jobs (15 points)
  IF job_count >= 50 THEN
    data_health_score := data_health_score + 15;
  ELSIF job_count >= 20 THEN
    data_health_score := data_health_score + 12;
  ELSIF job_count >= 10 THEN
    data_health_score := data_health_score + 9;
  ELSIF job_count >= 3 THEN
    data_health_score := data_health_score + 6;
  ELSIF job_count >= 1 THEN
    data_health_score := data_health_score + 3;
  END IF;

  -- ONBOARDING SCORE (20 points max)
  onboarding_score := (get_onboarding_completion(org_id) * 20 / 100)::integer;

  -- BILLING SCORE (10 points max)
  IF org_subscription_status = 'active' THEN
    billing_score := 10;
  ELSIF org_subscription_status = 'trialing' THEN
    billing_score := 8;
  ELSIF org_subscription_status = 'past_due' THEN
    billing_score := 3;
  ELSIF org_subscription_status = 'canceled' OR org_subscription_status = 'suspended' THEN
    billing_score := 0;
  ELSE
    billing_score := 5;
  END IF;

  -- TOTAL SCORE
  total_score := engagement_score + data_health_score + onboarding_score + billing_score;

  -- Cap at 100
  IF total_score > 100 THEN
    total_score := 100;
  END IF;

  RETURN total_score;
END;
$$;

-- Main sync function
CREATE OR REPLACE FUNCTION sync_organizations_to_enterprise_accounts()
RETURNS TABLE (
  synced_count integer,
  created_count integer,
  updated_count integer,
  error_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_record RECORD;
  owner_record RECORD;
  metrics_record RECORD;
  account_id uuid;
  created integer := 0;
  updated integer := 0;
  errors integer := 0;
  total integer := 0;
  plan_name text;
  mrr_value numeric;
  arr_value numeric;
  seats_limit integer;
  health_score integer;
  onboarding_pct integer;
BEGIN
  -- Loop through all organizations
  FOR org_record IN
    SELECT
      o.id,
      o.name,
      o.slug,
      o.subscription_tier,
      o.subscription_status,
      o.created_at,
      o.updated_at
    FROM organizations o
    WHERE o.is_active = true
  LOOP
    BEGIN
      total := total + 1;

      -- Get owner information
      SELECT * INTO owner_record FROM get_organization_owner(org_record.id);

      -- Skip if no owner found
      IF owner_record.user_id IS NULL THEN
        errors := errors + 1;
        RAISE NOTICE 'No owner found for organization %', org_record.name;
        CONTINUE;
      END IF;

      -- Get metrics
      SELECT * INTO metrics_record FROM get_organization_metrics(org_record.id);

      -- Map subscription tier to plan
      plan_name := COALESCE(org_record.subscription_tier, 'Starter');

      -- Set pricing based on plan
      CASE plan_name
        WHEN 'Starter' THEN
          mrr_value := 497.00;
          arr_value := 4970.00;
          seats_limit := -1;
        WHEN 'Pro' THEN
          mrr_value := 997.00;
          arr_value := 9970.00;
          seats_limit := -1;
        WHEN 'Enterprise' THEN
          mrr_value := 0.00;
          arr_value := 0.00;
          seats_limit := -1;
        ELSE
          mrr_value := 497.00;
          arr_value := 4970.00;
          seats_limit := -1;
      END CASE;

      -- If trial or not active, set MRR/ARR to 0
      IF org_record.subscription_status IN ('trialing', 'inactive', 'canceled') THEN
        mrr_value := 0.00;
        arr_value := 0.00;
      END IF;

      -- Calculate health score
      health_score := calculate_account_health_score(org_record.id);

      -- Upsert enterprise account
      INSERT INTO enterprise_accounts (
        name,
        owner_name,
        owner_email,
        owner_phone,
        status,
        plan,
        billing_cycle,
        renewal_date,
        seats_used,
        seats_limit,
        mrr,
        arr,
        tags,
        health_score,
        last_login_at,
        organization_id,
        owner_user_id,
        provisioning_status,
        provisioned_at,
        created_at,
        updated_at
      ) VALUES (
        org_record.name,
        owner_record.full_name,
        owner_record.email,
        NULL,
        CASE org_record.subscription_status
          WHEN 'active' THEN 'active'
          WHEN 'trialing' THEN 'trial'
          WHEN 'past_due' THEN 'past_due'
          WHEN 'canceled' THEN 'suspended'
          ELSE 'active'
        END,
        plan_name,
        'monthly',
        CURRENT_DATE + INTERVAL '30 days',
        COALESCE(metrics_record.active_users, 0)::integer,
        seats_limit,
        mrr_value,
        arr_value,
        ARRAY[]::text[],
        health_score,
        metrics_record.last_activity_at,
        org_record.id,
        owner_record.user_id,
        'active',
        NOW(),
        org_record.created_at,
        NOW()
      )
      ON CONFLICT (organization_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        owner_name = EXCLUDED.owner_name,
        owner_email = EXCLUDED.owner_email,
        status = EXCLUDED.status,
        plan = EXCLUDED.plan,
        seats_used = EXCLUDED.seats_used,
        mrr = EXCLUDED.mrr,
        arr = EXCLUDED.arr,
        health_score = EXCLUDED.health_score,
        last_login_at = EXCLUDED.last_login_at,
        owner_user_id = EXCLUDED.owner_user_id,
        provisioning_status = EXCLUDED.provisioning_status,
        updated_at = NOW()
      RETURNING id INTO account_id;

      IF FOUND THEN
        IF TG_OP = 'INSERT' THEN
          created := created + 1;
        ELSE
          updated := updated + 1;
        END IF;
      END IF;

      -- Update organization with enterprise_account_id
      UPDATE organizations
      SET enterprise_account_id = account_id
      WHERE id = org_record.id;

    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      RAISE NOTICE 'Error syncing organization %: %', org_record.name, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT total, created, updated, errors;
END;
$$;

-- Add unique constraint on organization_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'enterprise_accounts_organization_id_key'
  ) THEN
    ALTER TABLE enterprise_accounts
    ADD CONSTRAINT enterprise_accounts_organization_id_key
    UNIQUE (organization_id);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_owner_email ON enterprise_accounts(owner_email);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_status ON enterprise_accounts(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_plan ON enterprise_accounts(plan);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_health_score ON enterprise_accounts(health_score);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_last_login ON enterprise_accounts(last_login_at);
