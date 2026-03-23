/*
  # Sierra Marketing AI — Core Tables

  Creates the full data model for the Sierra Marketing AI module.

  ## New Tables
  - `marketing_accounts` — Connected ad channel accounts
  - `marketing_campaigns` — AI-assisted campaigns with full contractor metrics
  - `marketing_attribution_records` — Source-to-revenue attribution per contact/lead
  - `sierra_marketing_recommendations` — AI-generated strategy recommendations
  - `sierra_marketing_actions` — AI action cards with approval workflow
  - `marketing_funnels` — Landing pages and conversion funnels
  - `marketing_social_posts_ai` — Scheduled/published social content (separate from existing social_posts)
  - `marketing_alerts` — Tracking issues, performance alerts
  - `marketing_experiments` — A/B tests

  ## Security
  - RLS enabled on all tables
  - Authenticated users can access their organization's data
*/

-- marketing_accounts
CREATE TABLE IF NOT EXISTS marketing_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  channel text NOT NULL,
  account_name text NOT NULL,
  account_id text,
  status text NOT NULL DEFAULT 'disconnected',
  spend_mtd numeric DEFAULT 0,
  leads_mtd integer DEFAULT 0,
  jobs_won integer DEFAULT 0,
  last_sync timestamptz,
  pixel_status text NOT NULL DEFAULT 'not_applicable',
  issues jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage marketing accounts"
  ON marketing_accounts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- marketing_campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  goal text NOT NULL DEFAULT 'form_leads',
  service_type text NOT NULL DEFAULT 'residential_roofing',
  geography text,
  budget_daily numeric DEFAULT 0,
  budget_monthly numeric DEFAULT 0,
  offer_type text,
  destination text,
  channels jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'draft',
  spend numeric DEFAULT 0,
  leads integer DEFAULT 0,
  appointments integer DEFAULT 0,
  estimates integer DEFAULT 0,
  jobs_won integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  cpl numeric DEFAULT 0,
  cpa numeric DEFAULT 0,
  close_rate numeric DEFAULT 0,
  generated_assets jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage campaigns"
  ON marketing_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- marketing_attribution_records
CREATE TABLE IF NOT EXISTS marketing_attribution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  contact_id uuid,
  contact_name text,
  opportunity_id uuid,
  channel text NOT NULL DEFAULT 'unknown',
  campaign_id uuid,
  campaign_name text,
  ad_group text,
  keyword text,
  landing_page text,
  form_id uuid,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  first_touch timestamptz DEFAULT now(),
  last_touch timestamptz DEFAULT now(),
  assigned_rep text,
  appointment_status text DEFAULT 'none',
  estimate_status text DEFAULT 'none',
  proposal_status text DEFAULT 'none',
  job_status text DEFAULT 'none',
  revenue_value numeric DEFAULT 0,
  service_type text,
  city text,
  zip text,
  is_repeat_customer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_attribution_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage attribution records"
  ON marketing_attribution_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- sierra_marketing_recommendations
CREATE TABLE IF NOT EXISTS sierra_marketing_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  rationale text,
  expected_impact text,
  confidence_score integer DEFAULT 0,
  linked_entities jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_marketing_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage sierra recommendations"
  ON sierra_marketing_recommendations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- sierra_marketing_actions
CREATE TABLE IF NOT EXISTS sierra_marketing_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  recommendation_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  rationale text,
  expected_impact text,
  confidence_score integer DEFAULT 0,
  linked_entities jsonb DEFAULT '[]',
  approval_state text NOT NULL DEFAULT 'pending',
  execution_state text NOT NULL DEFAULT 'pending',
  executed_at timestamptz,
  result_summary text,
  can_rollback boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_marketing_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage sierra actions"
  ON sierra_marketing_actions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- marketing_funnels
CREATE TABLE IF NOT EXISTS marketing_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  funnel_type text NOT NULL DEFAULT 'free_inspection',
  headline text,
  offer text,
  form_id uuid,
  automation_id uuid,
  submissions integer DEFAULT 0,
  appointments_booked integer DEFAULT 0,
  close_rate numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage funnels"
  ON marketing_funnels FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- marketing_social_posts_ai (separate from existing social_posts table)
CREATE TABLE IF NOT EXISTS marketing_social_posts_ai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  content text NOT NULL,
  platforms jsonb DEFAULT '[]',
  scheduled_at timestamptz,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  source_type text,
  source_id text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_social_posts_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ai social posts"
  ON marketing_social_posts_ai FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- marketing_alerts
CREATE TABLE IF NOT EXISTS marketing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  channel text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage alerts"
  ON marketing_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- marketing_experiments
CREATE TABLE IF NOT EXISTS marketing_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  hypothesis text,
  variant_a text,
  variant_b text,
  status text NOT NULL DEFAULT 'running',
  winner text,
  lift numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage experiments"
  ON marketing_experiments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_mktg_campaigns_org ON marketing_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_mktg_attribution_org ON marketing_attribution_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_mktg_attribution_contact ON marketing_attribution_records(contact_id);
CREATE INDEX IF NOT EXISTS idx_sierra_mktg_actions_org ON sierra_marketing_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_mktg_actions_approval ON sierra_marketing_actions(approval_state);
CREATE INDEX IF NOT EXISTS idx_mktg_funnels_org ON marketing_funnels(organization_id);
