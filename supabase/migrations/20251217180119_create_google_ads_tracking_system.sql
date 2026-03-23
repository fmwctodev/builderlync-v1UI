/*
  # Create Google Ads Tracking System

  ## Overview
  This migration creates tables to store Google Ads campaign performance data
  including campaigns, ad groups, keywords, and daily metrics

  ## 1. New Tables

  ### `google_ads_accounts`
  Stores connected Google Ads accounts
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `account_id` (text, required) - Google Ads account ID
  - `account_name` (text) - Account display name
  - `currency_code` (text) - Currency code (USD, EUR, etc)
  - `timezone` (text) - Account timezone
  - `is_active` (boolean) - Sync status
  - `access_token_encrypted` (text) - Encrypted OAuth token
  - `refresh_token_encrypted` (text) - Encrypted refresh token
  - `last_sync_at` (timestamptz) - Last successful sync
  - `sync_status` (text) - Current sync status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update

  ### `google_ads_campaigns`
  Stores Google Ads campaigns
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `account_id` (uuid) - Reference to google_ads_accounts
  - `campaign_id` (text, required) - Google campaign ID
  - `campaign_name` (text) - Campaign name
  - `campaign_status` (text) - Status (enabled, paused, removed)
  - `campaign_type` (text) - Type (search, display, shopping, video)
  - `budget_amount` (numeric) - Daily budget
  - `budget_type` (text) - Budget type
  - `start_date` (date) - Campaign start date
  - `end_date` (date) - Campaign end date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update

  ### `google_ads_metrics`
  Stores daily performance metrics
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `account_id` (uuid) - Reference to google_ads_accounts
  - `campaign_id` (uuid) - Reference to google_ads_campaigns
  - `date` (date, required) - Metric date
  - `impressions` (bigint) - Total impressions
  - `clicks` (bigint) - Total clicks
  - `cost` (numeric) - Total cost in micros
  - `conversions` (numeric) - Total conversions
  - `conversion_value` (numeric) - Total conversion value
  - `ctr` (numeric) - Click-through rate
  - `average_cpc` (numeric) - Average cost per click
  - `average_cpm` (numeric) - Average cost per thousand impressions
  - `conversion_rate` (numeric) - Conversion rate
  - `cost_per_conversion` (numeric) - Cost per conversion
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update

  ## 2. Security
  - Enable RLS on all tables
  - Organization-scoped access policies

  ## 3. Indexes
  - Performance indexes for common queries
  - Unique constraints on external IDs
*/

-- Create google_ads_accounts table
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

-- Create google_ads_campaigns table
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

-- Create google_ads_metrics table
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

-- Create indexes for performance
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

-- Enable RLS
ALTER TABLE google_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_ads_accounts
CREATE POLICY "Users view Google Ads accounts in org" ON google_ads_accounts FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage Google Ads accounts in org" ON google_ads_accounts FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for google_ads_campaigns
CREATE POLICY "Users view Google Ads campaigns in org" ON google_ads_campaigns FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage Google Ads campaigns in org" ON google_ads_campaigns FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for google_ads_metrics
CREATE POLICY "Users view Google Ads metrics in org" ON google_ads_metrics FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage Google Ads metrics in org" ON google_ads_metrics FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
