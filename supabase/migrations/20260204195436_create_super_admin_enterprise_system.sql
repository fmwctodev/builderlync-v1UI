/*
  # Create Super Admin & Enterprise System Tables
  
  1. New Tables
    - enterprise_accounts: Enterprise account management
    - account_modules: Module access control
    - account_integrations: Account integrations
    - usage_tracking: Usage metrics
    - usage_limits: Usage limits
    - account_limit_overrides: Limit overrides
    - feature_flags: Feature flag management
    - plan_definitions: Plan definitions
    - billing_snapshots: Billing snapshots
    - integration_health: Integration health
    - support_tickets: Support tickets
    - support_ticket_comments: Ticket comments
    - product_feedback: Product feedback
    - account_health: Account health metrics
    - nps_feedback: NPS feedback
    
  2. Security
    - Enable RLS on all tables
    - Super admin access patterns
*/

-- Enterprise Accounts Table
CREATE TABLE IF NOT EXISTS enterprise_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE,
  plan text DEFAULT 'starter',
  status text DEFAULT 'active',
  mrr numeric DEFAULT 0,
  arr numeric DEFAULT 0,
  health_score integer DEFAULT 100,
  owner_email text,
  owner_name text,
  primary_contact_email text,
  primary_contact_name text,
  industry text,
  company_size text,
  contract_start_date date,
  contract_end_date date,
  seats_purchased integer DEFAULT 1,
  seats_used integer DEFAULT 0,
  billing_email text,
  billing_address jsonb DEFAULT '{}'::jsonb,
  is_trial boolean DEFAULT false,
  trial_ends_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE enterprise_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage enterprise accounts"
    ON enterprise_accounts FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Account Modules Table
CREATE TABLE IF NOT EXISTS account_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  enabled_at timestamptz DEFAULT now(),
  disabled_at timestamptz,
  settings jsonb DEFAULT '{}'::jsonb,
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  UNIQUE(account_id, module_name)
);

ALTER TABLE account_modules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage account modules"
    ON account_modules FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Account Integrations Table
CREATE TABLE IF NOT EXISTS account_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  is_connected boolean DEFAULT false,
  connected_at timestamptz,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'idle',
  error_count integer DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(account_id, integration_name)
);

ALTER TABLE account_integrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage account integrations"
    ON account_integrations FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  contacts_count integer DEFAULT 0,
  jobs_count integer DEFAULT 0,
  proposals_count integer DEFAULT 0,
  invoices_count integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  sms_sent integer DEFAULT 0,
  calls_made integer DEFAULT 0,
  storage_bytes_used bigint DEFAULT 0,
  api_calls integer DEFAULT 0,
  ai_tokens_used integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, period_start, period_end)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage usage tracking"
    ON usage_tracking FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Usage Limits Table
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  limit_type text NOT NULL,
  limit_value integer NOT NULL,
  current_usage integer DEFAULT 0,
  reset_frequency text DEFAULT 'monthly',
  last_reset_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, limit_type)
);

ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage usage limits"
    ON usage_limits FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Account Limit Overrides Table
CREATE TABLE IF NOT EXISTS account_limit_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE UNIQUE,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  approved_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE account_limit_overrides ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage account limit overrides"
    ON account_limit_overrides FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'disabled',
  rollout_type text DEFAULT 'all_or_nothing',
  rollout_percentage integer DEFAULT 0,
  target_accounts jsonb DEFAULT '[]'::jsonb,
  target_users jsonb DEFAULT '[]'::jsonb,
  conditions jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view feature flags"
    ON feature_flags FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage feature flags"
    ON feature_flags FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Plan Definitions Table
CREATE TABLE IF NOT EXISTS plan_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  price_monthly numeric DEFAULT 0,
  price_yearly numeric DEFAULT 0,
  stripe_monthly_price_id text,
  stripe_yearly_price_id text,
  features jsonb DEFAULT '{}'::jsonb,
  limits jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  trial_days integer DEFAULT 14,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plan_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active plan definitions"
    ON plan_definitions FOR SELECT
    TO authenticated
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Billing Snapshots Table
CREATE TABLE IF NOT EXISTS billing_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  mrr numeric DEFAULT 0,
  arr numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  seats_count integer DEFAULT 0,
  plan text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, snapshot_date)
);

ALTER TABLE billing_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage billing snapshots"
    ON billing_snapshots FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Integration Health Table
CREATE TABLE IF NOT EXISTS integration_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  status text DEFAULT 'healthy',
  last_check_at timestamptz DEFAULT now(),
  response_time_ms integer,
  error_rate numeric DEFAULT 0,
  consecutive_failures integer DEFAULT 0,
  last_error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(account_id, integration_name)
);

ALTER TABLE integration_health ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage integration health"
    ON integration_health FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text,
  category text,
  priority text DEFAULT 'normal',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id),
  external_ticket_id text,
  resolution text,
  resolved_at timestamptz,
  first_response_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own support tickets"
    ON support_tickets FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage all support tickets"
    ON support_tickets FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Support Ticket Comments Table
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view comments on their tickets"
    ON support_ticket_comments FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = support_ticket_comments.ticket_id
        AND (support_tickets.user_id = auth.uid() OR support_ticket_comments.is_internal = false)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Product Feedback Table
CREATE TABLE IF NOT EXISTS product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  feedback_type text NOT NULL,
  category text,
  title text,
  content text NOT NULL,
  rating integer,
  url text,
  screenshot_url text,
  status text DEFAULT 'new',
  votes integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can create product feedback"
    ON product_feedback FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own product feedback"
    ON product_feedback FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Account Health Table
CREATE TABLE IF NOT EXISTS account_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE UNIQUE,
  health_score integer DEFAULT 100,
  engagement_score integer DEFAULT 100,
  adoption_score integer DEFAULT 100,
  satisfaction_score integer DEFAULT 100,
  risk_level text DEFAULT 'low',
  churn_risk_score integer DEFAULT 0,
  last_activity_at timestamptz,
  days_since_login integer DEFAULT 0,
  feature_adoption jsonb DEFAULT '{}'::jsonb,
  health_factors jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  calculated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE account_health ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can manage account health"
    ON account_health FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM super_admin_users WHERE super_admin_users.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NPS Feedback Table
CREATE TABLE IF NOT EXISTS nps_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  comment text,
  category text,
  follow_up_requested boolean DEFAULT false,
  follow_up_completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nps_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can create nps feedback"
    ON nps_feedback FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_org ON enterprise_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_status ON enterprise_accounts(status);
CREATE INDEX IF NOT EXISTS idx_account_modules_account ON account_modules(account_id);
CREATE INDEX IF NOT EXISTS idx_account_integrations_account ON account_integrations(account_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_account ON usage_tracking(account_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_account ON usage_limits(account_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_billing_snapshots_account ON billing_snapshots(account_id);
CREATE INDEX IF NOT EXISTS idx_integration_health_account ON integration_health(account_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_account ON support_tickets(account_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket ON support_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_user ON product_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_account_health_account ON account_health(account_id);
CREATE INDEX IF NOT EXISTS idx_nps_feedback_user ON nps_feedback(user_id);
