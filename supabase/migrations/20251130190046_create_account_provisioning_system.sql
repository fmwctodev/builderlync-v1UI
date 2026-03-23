/*
  # Account Provisioning System for Multi-Tenant Architecture

  ## Overview
  This migration adds the infrastructure needed for automated account provisioning
  when a super admin creates a new enterprise account. It links enterprise accounts
  to organizations, tracks provisioning status, and creates helper functions.

  ## Changes

  1. **Schema Updates to enterprise_accounts**
     - `organization_id` - Links to the tenant organization
     - `owner_user_id` - Links to auth.users (the primary admin)
     - `owner_platform_user_id` - Links to platform_users table
     - `provisioning_status` - Tracks provisioning state
     - `provisioned_at` - When provisioning completed
     - `provisioning_error` - Error details if provisioning failed

  2. **Helper Functions**
     - `generate_organization_slug()` - Creates unique slug from account name
     - `get_user_organization_id()` - Gets organization ID for current user

  3. **Updated Plan Pricing**
     - Starter: $497/month
     - Pro: $997/month
     - Enterprise: Custom pricing

  ## Security
  - All new fields maintain existing RLS policies
  - Helper functions are security definer where appropriate
*/

-- Add new columns to enterprise_accounts
DO $$
BEGIN
  -- Add organization_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE enterprise_accounts ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_organization_id ON enterprise_accounts(organization_id);
  END IF;

  -- Add owner_user_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'owner_user_id'
  ) THEN
    ALTER TABLE enterprise_accounts ADD COLUMN owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_owner_user_id ON enterprise_accounts(owner_user_id);
  END IF;

  -- Add owner_platform_user_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'owner_platform_user_id'
  ) THEN
    ALTER TABLE enterprise_accounts ADD COLUMN owner_platform_user_id uuid REFERENCES platform_users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_owner_platform_user_id ON enterprise_accounts(owner_platform_user_id);
  END IF;

  -- Add provisioning_status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'provisioning_status'
  ) THEN
    ALTER TABLE enterprise_accounts ADD COLUMN provisioning_status text DEFAULT 'pending' CHECK (provisioning_status IN ('pending', 'provisioning', 'active', 'failed'));
    CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_provisioning_status ON enterprise_accounts(provisioning_status);
  END IF;

  -- Add provisioned_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'provisioned_at'
  ) THEN
    ALTER TABLE enterprise_accounts ADD COLUMN provisioned_at timestamptz;
  END IF;

  -- Add provisioning_error if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enterprise_accounts' AND column_name = 'provisioning_error'
  ) THEN
    ALTER TABLE enterprise_accounts ADD COLUMN provisioning_error text;
  END IF;
END $$;

-- Add enterprise_account_id to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'enterprise_account_id'
  ) THEN
    ALTER TABLE organizations ADD COLUMN enterprise_account_id uuid REFERENCES enterprise_accounts(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_organizations_enterprise_account_id ON organizations(enterprise_account_id);
  END IF;
END $$;

-- Function to generate a unique organization slug from name
CREATE OR REPLACE FUNCTION generate_organization_slug(org_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  IF base_slug = '' THEN
    base_slug := 'organization';
  END IF;

  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id(user_uuid uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = user_uuid
  LIMIT 1;
$$;

-- Update plan_definitions with correct pricing
UPDATE plan_definitions
SET
  price_monthly = 497.00,
  price_annual = 4970.00,
  description = 'For contractors who want full control — they''ll build their own automations, templates, and workflows at their own pace.',
  limits = '{"sms_messages": 5000, "mms_messages": 1000, "call_minutes": 2000, "ai_minutes": 500, "emails_sent": 10000, "storage_gb": 50, "seats": -1, "api_calls_per_month": 50000}'::jsonb
WHERE name = 'Starter';

UPDATE plan_definitions
SET
  price_monthly = 997.00,
  price_annual = 9970.00,
  description = 'For contractors ready to scale — they want automation, pre-built workflows, and AI tools fully configured for their business from day one.',
  limits = '{"sms_messages": 15000, "mms_messages": 3000, "call_minutes": 6000, "ai_minutes": 2000, "emails_sent": 50000, "storage_gb": 200, "seats": -1, "api_calls_per_month": 200000}'::jsonb
WHERE name = 'Pro';

UPDATE plan_definitions
SET
  price_monthly = 0.00,
  price_annual = 0.00,
  description = 'For multi-location, franchise, or enterprise contractors. Custom pricing based on needs.',
  limits = '{"sms_messages": 50000, "mms_messages": 10000, "call_minutes": 20000, "ai_minutes": 10000, "emails_sent": 200000, "storage_gb": 500, "seats": -1, "api_calls_per_month": -1, "white_label_domains": 5}'::jsonb
WHERE name = 'Enterprise';

-- Update existing accounts to active status
UPDATE enterprise_accounts
SET provisioning_status = 'active', provisioned_at = created_at
WHERE provisioning_status IS NULL OR provisioning_status = 'pending';