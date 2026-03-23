/*
  # Create Facebook Ads Tracking System

  Creates tables to store Facebook/Meta Ads campaign performance data.

  ## New Tables
  - `facebook_ads_accounts` - Connected Facebook Ads accounts with OAuth tokens
  - `facebook_ads_campaigns` - Facebook Ads campaigns per account
  - `facebook_ads_metrics` - Daily performance metrics per campaign

  ## Security
  - RLS enabled on all tables
  - Organization-scoped access policies
*/

CREATE TABLE IF NOT EXISTS facebook_ads_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  account_id text NOT NULL,
  account_name text,
  currency text DEFAULT 'USD',
  timezone_name text DEFAULT 'UTC',
  is_active boolean DEFAULT true,
  access_token_encrypted text,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  sync_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, account_id)
);

CREATE TABLE IF NOT EXISTS facebook_ads_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  account_id uuid REFERENCES facebook_ads_accounts(id) ON DELETE CASCADE,
  campaign_id text NOT NULL,
  campaign_name text NOT NULL,
  campaign_status text DEFAULT 'active' CHECK (campaign_status IN ('active', 'paused', 'archived', 'deleted')),
  objective text,
  daily_budget numeric,
  lifetime_budget numeric,
  start_time timestamptz,
  stop_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS facebook_ads_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  account_id uuid REFERENCES facebook_ads_accounts(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES facebook_ads_campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  spend numeric DEFAULT 0,
  reach bigint DEFAULT 0,
  frequency numeric DEFAULT 0,
  conversions numeric DEFAULT 0,
  conversion_value numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  cpm numeric DEFAULT 0,
  cpp numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_facebook_ads_accounts_organization ON facebook_ads_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_accounts_active ON facebook_ads_accounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_facebook_ads_campaigns_organization ON facebook_ads_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_campaigns_account ON facebook_ads_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_campaigns_status ON facebook_ads_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_metrics_organization ON facebook_ads_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_metrics_account ON facebook_ads_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_metrics_campaign ON facebook_ads_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_metrics_date ON facebook_ads_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_metrics_org_date ON facebook_ads_metrics(organization_id, date DESC);

ALTER TABLE facebook_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_ads_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view Facebook Ads accounts in org" ON facebook_ads_accounts FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users insert Facebook Ads accounts in org" ON facebook_ads_accounts FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users update Facebook Ads accounts in org" ON facebook_ads_accounts FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users delete Facebook Ads accounts in org" ON facebook_ads_accounts FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users view Facebook Ads campaigns in org" ON facebook_ads_campaigns FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users insert Facebook Ads campaigns in org" ON facebook_ads_campaigns FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users update Facebook Ads campaigns in org" ON facebook_ads_campaigns FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users delete Facebook Ads campaigns in org" ON facebook_ads_campaigns FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users view Facebook Ads metrics in org" ON facebook_ads_metrics FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users insert Facebook Ads metrics in org" ON facebook_ads_metrics FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users update Facebook Ads metrics in org" ON facebook_ads_metrics FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users delete Facebook Ads metrics in org" ON facebook_ads_metrics FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));
