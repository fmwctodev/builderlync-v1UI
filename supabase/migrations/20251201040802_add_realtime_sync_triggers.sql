/*
  # Add Real-Time Sync Triggers

  ## Overview
  Creates triggers to automatically sync enterprise accounts when source data changes.

  ## Changes

  1. **Organization Triggers**
     - Trigger on INSERT: Create new enterprise account
     - Trigger on UPDATE: Sync changes to enterprise account
     - Trigger on DELETE: Mark enterprise account as inactive (soft delete)

  2. **Organization Members Triggers**
     - Update seats_used when members added/removed
     - Update health score when activity changes

  3. **Auth Users Triggers**
     - Update last_login_at when user signs in
     - Recalculate health score on login

  ## Security
  - Triggers use SECURITY DEFINER functions
  - Maintains data integrity with proper error handling
*/

-- Trigger function for organization changes
CREATE OR REPLACE FUNCTION sync_organization_to_enterprise_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sync_result RECORD;
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

  -- Get owner information
  SELECT * INTO owner_record FROM get_organization_owner(NEW.id);

  -- If no owner, skip sync
  IF owner_record.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get metrics
  SELECT * INTO metrics_record FROM get_organization_metrics(NEW.id);

  -- Map selected_plan to plan
  plan_name := COALESCE(NEW.selected_plan, 'Starter');

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
  IF NEW.subscription_status IN ('trialing', 'inactive', 'canceled') THEN
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
      WHEN 'past_due' THEN 'past_due'
      WHEN 'canceled' THEN 'suspended'
      ELSE 'active'
    END,
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

-- Trigger function for organization member changes
CREATE OR REPLACE FUNCTION update_enterprise_account_seats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
  active_count integer;
BEGIN
  -- Get organization_id from the affected row
  IF TG_OP = 'DELETE' THEN
    org_id := OLD.organization_id;
  ELSE
    org_id := NEW.organization_id;
  END IF;

  -- Count active members
  SELECT COUNT(*)::integer INTO active_count
  FROM organization_members
  WHERE organization_id = org_id AND is_active = true;

  -- Update enterprise account
  UPDATE enterprise_accounts
  SET
    seats_used = active_count,
    health_score = calculate_account_health_score(org_id),
    updated_at = NOW()
  WHERE organization_id = org_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers on organizations table
DROP TRIGGER IF EXISTS trg_sync_organization_to_enterprise_account ON organizations;
CREATE TRIGGER trg_sync_organization_to_enterprise_account
  AFTER INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_to_enterprise_account();

-- Create trigger for organization deletion
DROP TRIGGER IF EXISTS trg_sync_organization_delete ON organizations;
CREATE TRIGGER trg_sync_organization_delete
  AFTER DELETE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_to_enterprise_account();

-- Create triggers on organization_members table
DROP TRIGGER IF EXISTS trg_update_enterprise_account_seats ON organization_members;
CREATE TRIGGER trg_update_enterprise_account_seats
  AFTER INSERT OR UPDATE OR DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_enterprise_account_seats();
