/*
  # Fix Sync Trigger to Handle Missing Owner Gracefully

  ## Problem
  When creating an organization, the `sync_organization_to_enterprise_account()` trigger
  fires AFTER INSERT on the organizations table, but BEFORE the organization_member is created.
  
  The function calls `get_organization_owner(NEW.id)` which returns NO ROWS because the 
  owner hasn't been added yet. This causes:
  
  "structure of query does not match function result type"
  
  Because `SELECT * INTO owner_record FROM get_organization_owner(NEW.id)` fails when
  the function returns zero rows.

  ## Solution
  Change the trigger timing from AFTER to BEFORE would cause other issues.
  Instead, we need to handle the case where get_organization_owner returns no rows.
  
  The best approach: Skip enterprise account sync if no owner exists yet.
  The sync will happen when:
  1. The organization_member INSERT trigger fires
  2. Any subsequent UPDATE to the organization

  ## Changes
  - Remove explicit SELECT INTO for owner and metrics
  - Use EXISTS check first to see if owner exists
  - Only proceed with sync if owner exists
  - This allows organization creation to succeed
  - Enterprise account sync happens on next trigger (member insert or org update)
*/

CREATE OR REPLACE FUNCTION sync_organization_to_enterprise_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_record RECORD;
  metrics_record RECORD;
  account_id uuid;
  plan_name text;
  mrr_value numeric;
  arr_value numeric;
  health_score integer;
BEGIN
  -- On DELETE, mark enterprise account as suspended
  IF TG_OP = 'DELETE' THEN
    UPDATE enterprise_accounts
    SET status = 'suspended', updated_at = NOW()
    WHERE organization_id = OLD.id;
    RETURN OLD;
  END IF;

  -- Check if organization has an owner yet
  -- This is important because during creation, org is inserted before org_member
  IF NOT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = NEW.id
      AND role IN ('owner', 'admin')
      AND is_active = true
  ) THEN
    -- No owner yet, skip sync for now
    -- Sync will happen when member is added or org is updated
    RETURN NEW;
  END IF;

  -- Get owner information (we know owner exists now)
  SELECT * INTO owner_record FROM get_organization_owner(NEW.id);

  -- Double-check owner exists (defensive programming)
  IF owner_record.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get metrics
  SELECT * INTO metrics_record FROM get_organization_metrics(NEW.id);

  -- Use subscription_tier, fall back to selected_plan, default to Starter
  plan_name := COALESCE(NEW.subscription_tier, NEW.selected_plan, 'Starter');

  -- Set pricing based on plan
  CASE plan_name
    WHEN 'Starter' THEN
      mrr_value := 497.00;
      arr_value := 4970.00;
    WHEN 'Pro' THEN
      mrr_value := 997.00;
      arr_value := 9970.00;
    WHEN 'Enterprise' THEN
      mrr_value := 0.00;
      arr_value := 0.00;
    ELSE
      mrr_value := 497.00;
      arr_value := 4970.00;
  END CASE;

  -- If trial or not active, set MRR/ARR to 0
  IF NEW.subscription_status IN ('trialing', 'trial', 'inactive', 'canceled', 'pending_payment') THEN
    mrr_value := 0.00;
    arr_value := 0.00;
  END IF;

  -- Calculate health score
  health_score := calculate_account_health_score(NEW.id);

  -- Upsert enterprise account
  INSERT INTO enterprise_accounts (
    name,
    owner_name,
    owner_email,
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
    NEW.name,
    owner_record.full_name,
    owner_record.email,
    CASE NEW.subscription_status
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
    -1,
    mrr_value,
    arr_value,
    ARRAY[]::text[],
    health_score,
    metrics_record.last_activity_at,
    NEW.id,
    owner_record.user_id,
    'active',
    NOW(),
    NEW.created_at,
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
    updated_at = NOW()
  RETURNING id INTO account_id;

  -- Update organization with enterprise_account_id if not set
  IF NEW.enterprise_account_id IS NULL OR NEW.enterprise_account_id != account_id THEN
    UPDATE organizations
    SET enterprise_account_id = account_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trg_sync_organization_to_enterprise_account ON organizations;
CREATE TRIGGER trg_sync_organization_to_enterprise_account
  AFTER INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_to_enterprise_account();

/*
✓ Trigger now checks if owner exists BEFORE calling get_organization_owner()
✓ Uses EXISTS check which doesn't fail on zero rows
✓ Returns early if no owner, allowing organization creation to proceed
✓ Enterprise account sync will happen when:
  - organization_member is inserted (triggers update on org)
  - organization is updated manually
✓ No "structure of query does not match" error
*/
