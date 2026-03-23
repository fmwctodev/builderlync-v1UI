/*
  # Create Facebook Ads Tracking System

  ## Overview
  This migration creates tables to store Facebook Ads campaign performance data
  including ad accounts, campaigns, ad sets, and daily metrics

  ## 1. New Tables

  ### `facebook_ads_accounts`
  Stores connected Facebook Ads accounts
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `account_id` (text, required) - Facebook account ID
  - `account_name` (text) - Account display name
  - `currency` (text) - Currency code
  - `timezone_name` (text) - Account timezone
  - `is_active` (boolean) - Sync status
  - `access_token_encrypted` (text) - Encrypted OAuth token
  - `last_sync_at` (timestamptz) - Last successful sync
  - `sync_status` (text) - Current sync status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update

  ### `facebook_ads_campaigns`
  Stores Facebook Ads campaigns
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `account_id` (uuid) - Reference to facebook_ads_accounts
  - `campaign_id` (text, required) - Facebook campaign ID
  - `campaign_name` (text) - Campaign name
  - `campaign_status` (text) - Status (active, paused, archived)
  - `objective` (text) - Campaign objective
  - `daily_budget` (numeric) - Daily budget
  - `lifetime_budget` (numeric) - Lifetime budget
  - `start_time` (timestamptz) - Campaign start time
  - `stop_time` (timestamptz) - Campaign stop time
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update

  ### `facebook_ads_metrics`
  Stores daily performance metrics
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `account_id` (uuid) - Reference to facebook_ads_accounts
  - `campaign_id` (uuid) - Reference to facebook_ads_campaigns
  - `date` (date, required) - Metric date
  - `impressions` (bigint) - Total impressions
  - `clicks` (bigint) - Total clicks
  - `spend` (numeric) - Total spend
  - `reach` (bigint) - Unique reach
  - `frequency` (numeric) - Average frequency
  - `conversions` (numeric) - Total conversions
  - `conversion_value` (numeric) - Total conversion value
  - `ctr` (numeric) - Click-through rate
  - `cpc` (numeric) - Cost per click
  - `cpm` (numeric) - Cost per thousand impressions
  - `cpp` (numeric) - Cost per purchase
  - `roas` (numeric) - Return on ad spend
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update

  ## 2. Security
  - Enable RLS on all tables
  - Organization-scoped access policies

  ## 3. Indexes
  - Performance indexes for common queries
  - Unique constraints on external IDs
*/

-- Create facebook_ads_accounts table
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

-- Create facebook_ads_campaigns table
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

-- Create facebook_ads_metrics table
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

-- Create indexes for performance
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

-- Enable RLS
ALTER TABLE facebook_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_ads_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for facebook_ads_accounts
CREATE POLICY "Users view Facebook Ads accounts in org" ON facebook_ads_accounts FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage Facebook Ads accounts in org" ON facebook_ads_accounts FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for facebook_ads_campaigns
CREATE POLICY "Users view Facebook Ads campaigns in org" ON facebook_ads_campaigns FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage Facebook Ads campaigns in org" ON facebook_ads_campaigns FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for facebook_ads_metrics
CREATE POLICY "Users view Facebook Ads metrics in org" ON facebook_ads_metrics FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage Facebook Ads metrics in org" ON facebook_ads_metrics FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
