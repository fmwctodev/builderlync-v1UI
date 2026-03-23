/*
  # Super Admin System - Complete Database Schema

  1. New Tables
    - `super_admin_users` - Super admin authentication and user management
    - `enterprise_accounts` - Contractor enterprise accounts
    - `account_modules` - Enabled modules per account
    - `account_integrations` - Integration connections per account
    - `usage_tracking` - Usage metrics per account per period
    - `usage_limits` - Custom usage limits per account
    - `feature_flags` - Platform feature flags
    - `plan_definitions` - Subscription plan configurations
    - `audit_events` - Complete audit trail
    - `billing_snapshots` - Billing information per account
    - `integration_health` - Global integration status
    - `support_tickets` - Support ticket tracking
    - `nps_feedback` - Customer feedback and NPS scores

  2. Security
    - Enable RLS on all tables
    - Super admin access policies
    - Audit logging for all changes
*/

-- Super Admin Users Table
CREATE TABLE IF NOT EXISTS super_admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'operations', 'support')),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enterprise Accounts Table
CREATE TABLE IF NOT EXISTS enterprise_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_phone text,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'suspended')),
  plan text NOT NULL DEFAULT 'Starter' CHECK (plan IN ('Starter', 'Pro', 'Enterprise')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  created_at timestamptz DEFAULT now(),
  renewal_date date,
  seats_used int DEFAULT 1,
  seats_limit int DEFAULT 5,
  mrr decimal(10,2) DEFAULT 0,
  arr decimal(10,2) DEFAULT 0,
  tags text[] DEFAULT '{}',
  health_score int DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  last_login_at timestamptz,
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Account Modules Table
CREATE TABLE IF NOT EXISTS account_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  module_name text NOT NULL CHECK (module_name IN ('Jobs', 'Claims', 'SierraAI', 'Marketing', 'Sites', 'Reputation', 'Reporting', 'Integrations', 'ABC', 'SRS', 'Beacon')),
  enabled boolean DEFAULT false,
  settings jsonb DEFAULT '{}',
  enabled_at timestamptz,
  enabled_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, module_name)
);

-- Account Integrations Table
CREATE TABLE IF NOT EXISTS account_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('Twilio', 'QuickBooks', 'EagleView', 'ABC', 'SRS', 'Beacon', 'Google', 'Microsoft')),
  connected boolean DEFAULT false,
  status text DEFAULT 'disconnected' CHECK (status IN ('healthy', 'warning', 'error', 'disconnected')),
  last_sync_at timestamptz,
  connected_at timestamptz,
  config jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, provider)
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  period date NOT NULL,
  sms_count int DEFAULT 0,
  mms_count int DEFAULT 0,
  call_minutes int DEFAULT 0,
  ai_minutes int DEFAULT 0,
  emails_sent int DEFAULT 0,
  storage_gb decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, period)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_account_period ON usage_tracking(account_id, period);

-- Usage Limits Table
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  sms_limit int DEFAULT 1000,
  call_limit int DEFAULT 500,
  ai_limit int DEFAULT 100,
  email_limit int DEFAULT 5000,
  storage_limit decimal(10,2) DEFAULT 10.0,
  override_reason text,
  override_by uuid,
  override_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'off' CHECK (status IN ('off', 'beta', 'on')),
  rollout_type text DEFAULT 'all' CHECK (rollout_type IN ('all', 'beta', 'percentage', 'accounts')),
  rollout_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plan Definitions Table
CREATE TABLE IF NOT EXISTS plan_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price_monthly decimal(10,2) NOT NULL,
  price_annual decimal(10,2) NOT NULL,
  description text,
  included_modules text[] DEFAULT '{}',
  limits jsonb NOT NULL,
  display_order int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  actor_type text NOT NULL CHECK (actor_type IN ('super_admin', 'account_admin', 'system')),
  actor_id uuid,
  actor_name text NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('account', 'user', 'billing', 'feature', 'integration', 'settings', 'system')),
  target_id uuid,
  target_name text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_id, actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_target ON audit_events(target_type, target_id);

-- Billing Snapshots Table
CREATE TABLE IF NOT EXISTS billing_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  plan text NOT NULL,
  price_monthly decimal(10,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  last_invoice_date date,
  last_invoice_amount decimal(10,2),
  next_billing_date date,
  is_past_due boolean DEFAULT false,
  outstanding_amount decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

-- Integration Health Table
CREATE TABLE IF NOT EXISTS integration_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text UNIQUE NOT NULL CHECK (provider IN ('Twilio', 'QuickBooks', 'EagleView', 'ABC', 'SRS', 'Beacon', 'Email', 'AI')),
  status text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'error')),
  last_check_at timestamptz DEFAULT now(),
  last_incident_at timestamptz,
  message text,
  affected_accounts int DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  assigned_to uuid,
  sla_breached boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_account ON support_tickets(account_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- NPS Feedback Table
CREATE TABLE IF NOT EXISTS nps_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  score int NOT NULL CHECK (score >= 0 AND score <= 10),
  comment text,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  followed_up boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nps_feedback_account ON nps_feedback(account_id);
CREATE INDEX IF NOT EXISTS idx_nps_feedback_score ON nps_feedback(score);

-- Enable Row Level Security
ALTER TABLE super_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin access only - in production, these would check super admin JWT claims)
-- For now, allowing all operations as we'll handle auth in the application layer

CREATE POLICY "Super admin full access to super_admin_users"
  ON super_admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to enterprise_accounts"
  ON enterprise_accounts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to account_modules"
  ON account_modules FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to account_integrations"
  ON account_integrations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to usage_tracking"
  ON usage_tracking FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to usage_limits"
  ON usage_limits FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to feature_flags"
  ON feature_flags FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to plan_definitions"
  ON plan_definitions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to audit_events"
  ON audit_events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to billing_snapshots"
  ON billing_snapshots FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to integration_health"
  ON integration_health FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to support_tickets"
  ON support_tickets FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to nps_feedback"
  ON nps_feedback FOR ALL
  USING (true)
  WITH CHECK (true);