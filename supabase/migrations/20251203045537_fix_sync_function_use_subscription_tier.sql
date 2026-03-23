/*
  # Fix Sync Function to Use subscription_tier Column

  ## Problem
  - The sync function was updated to use selected_plan
  - But we just added subscription_tier column which should be the source of truth
  - This causes "structure of query does not match function result type" error
  - The function needs to sync subscription_tier to enterprise_accounts

  ## Solution
  - Update sync function to SELECT subscription_tier instead of selected_plan
  - Update INSERT to include subscription_tier in enterprise_accounts
  - Keep backward compatibility with selected_plan as fallback

  ## Changes
  - Update sync_organizations_to_enterprise_accounts() to use subscription_tier
  - Sync subscription_tier from organizations to enterprise_accounts.subscription_tier
  - Use COALESCE to fall back to selected_plan if subscription_tier is NULL
*/

-- Update sync function to use subscription_tier
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
      o.selected_plan,
      o.subscription_status,
      o.created_at,
      o.updated_at
    FROM organizations o
    WHERE o.is_active = true OR o.is_active IS NULL
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

      -- Use subscription_tier, fall back to selected_plan, default to Starter
      plan_name := COALESCE(org_record.subscription_tier, org_record.selected_plan, 'Starter');

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
      IF org_record.subscription_status IN ('trialing', 'trial', 'inactive', 'canceled', 'pending_payment') THEN
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
        subscription_tier,
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
          WHEN 'trial' THEN 'trial'
          WHEN 'past_due' THEN 'past_due'
          WHEN 'canceled' THEN 'suspended'
          WHEN 'pending_payment' THEN 'trial'
          ELSE 'active'
        END,
        plan_name,
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
        subscription_tier = EXCLUDED.subscription_tier,
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
        created := created + 1;
      ELSE
        updated := updated + 1;
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