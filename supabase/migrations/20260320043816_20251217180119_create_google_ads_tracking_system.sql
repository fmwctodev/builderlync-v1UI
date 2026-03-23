/*
  # Create Google Ads Tracking System

  Creates tables to store Google Ads campaign performance data.

  ## New Tables
  - `google_ads_accounts` - Connected Google Ads accounts with OAuth tokens
  - `google_ads_campaigns` - Google Ads campaigns per account
  - `google_ads_metrics` - Daily performance metrics per campaign

  ## Security
  - RLS enabled on all tables
  - Organization-scoped access policies
*/

CREATE TABLE IF NOT EXISTS google_ads_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  account_id text NOT NULL,
  account_name text,
  currency_code text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  is_active boolean DEFAULT true,
  access_token_encrypted text,
  refresh_token_encrypted text,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  sync_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, account_id)
);

CREATE TABLE IF NOT EXISTS google_ads_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  account_id uuid REFERENCES google_ads_accounts(id) ON DELETE CASCADE,
  campaign_id text NOT NULL,
  campaign_name text NOT NULL,
  campaign_status text DEFAULT 'enabled' CHECK (campaign_status IN ('enabled', 'paused', 'removed')),
  campaign_type text CHECK (campaign_type IN ('search', 'display', 'shopping', 'video', 'discovery', 'app', 'smart', 'performance_max')),
  budget_amount numeric DEFAULT 0,
  budget_type text CHECK (budget_type IN ('daily', 'lifetime')),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS google_ads_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  account_id uuid REFERENCES google_ads_accounts(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES google_ads_campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  cost numeric DEFAULT 0,
  conversions numeric DEFAULT 0,
  conversion_value numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  average_cpc numeric DEFAULT 0,
  average_cpm numeric DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  cost_per_conversion numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_organization ON google_ads_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_active ON google_ads_accounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_google_ads_campaigns_organization ON google_ads_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_campaigns_account ON google_ads_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_campaigns_status ON google_ads_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_google_ads_metrics_organization ON google_ads_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_metrics_account ON google_ads_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_metrics_campaign ON google_ads_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_metrics_date ON google_ads_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_google_ads_metrics_org_date ON google_ads_metrics(organization_id, date DESC);

ALTER TABLE google_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view Google Ads accounts in org" ON google_ads_accounts FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users insert Google Ads accounts in org" ON google_ads_accounts FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users update Google Ads accounts in org" ON google_ads_accounts FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users delete Google Ads accounts in org" ON google_ads_accounts FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users view Google Ads campaigns in org" ON google_ads_campaigns FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users insert Google Ads campaigns in org" ON google_ads_campaigns FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users update Google Ads campaigns in org" ON google_ads_campaigns FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users delete Google Ads campaigns in org" ON google_ads_campaigns FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users view Google Ads metrics in org" ON google_ads_metrics FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users insert Google Ads metrics in org" ON google_ads_metrics FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users update Google Ads metrics in org" ON google_ads_metrics FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users delete Google Ads metrics in org" ON google_ads_metrics FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND is_active = true));
