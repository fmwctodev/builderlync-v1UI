/*
  # Create Marketing Campaigns System

  1. New Tables
    - campaigns - Email/SMS campaign management
    - campaign_recipients - Individual recipient tracking
    - campaign_stats - Aggregated performance metrics
    - email_templates - Reusable email templates
    - sms_templates - Reusable SMS templates

  2. Security
    - Enable RLS on all tables
    - Organization-based access control

  3. Features
    - Drip campaigns, A/B testing, template library
    - Delivery tracking and engagement analytics
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  campaign_type text NOT NULL CHECK (campaign_type IN ('email', 'sms', 'mixed')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed')),
  subject text,
  from_name text,
  from_email text,
  reply_to_email text,
  content text NOT NULL,
  plain_text_content text,
  template_id uuid,
  target_audience jsonb DEFAULT '{}'::jsonb,
  scheduled_date timestamptz,
  send_immediately boolean DEFAULT false,
  timezone text DEFAULT 'UTC',
  is_ab_test boolean DEFAULT false,
  ab_test_config jsonb DEFAULT '{}'::jsonb,
  send_in_batches boolean DEFAULT false,
  batch_size integer DEFAULT 100,
  batch_delay_minutes integer DEFAULT 5,
  track_opens boolean DEFAULT true,
  track_clicks boolean DEFAULT true,
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create campaign_recipients table
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL,
  recipient_email text,
  recipient_phone text,
  recipient_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed')),
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  first_opened_at timestamptz,
  open_count integer DEFAULT 0,
  clicked_at timestamptz,
  first_clicked_at timestamptz,
  click_count integer DEFAULT 0,
  error_message text,
  error_code text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  provider_message_id text,
  provider_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);

-- Create campaign_stats table
CREATE TABLE IF NOT EXISTS campaign_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE UNIQUE,
  total_recipients integer DEFAULT 0,
  total_queued integer DEFAULT 0,
  total_sent integer DEFAULT 0,
  total_delivered integer DEFAULT 0,
  total_failed integer DEFAULT 0,
  total_bounced integer DEFAULT 0,
  total_opened integer DEFAULT 0,
  total_clicked integer DEFAULT 0,
  total_unsubscribed integer DEFAULT 0,
  unique_opens integer DEFAULT 0,
  unique_clicks integer DEFAULT 0,
  delivery_rate numeric(5, 2) DEFAULT 0,
  open_rate numeric(5, 2) DEFAULT 0,
  click_rate numeric(5, 2) DEFAULT 0,
  bounce_rate numeric(5, 2) DEFAULT 0,
  unsubscribe_rate numeric(5, 2) DEFAULT 0,
  click_to_open_rate numeric(5, 2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  subject text NOT NULL,
  from_name text,
  from_email text,
  reply_to_email text,
  html_content text NOT NULL,
  plain_text_content text,
  available_variables jsonb DEFAULT '[]'::jsonb,
  thumbnail_url text,
  design_json jsonb DEFAULT '{}'::jsonb,
  is_shared boolean DEFAULT false,
  is_system_template boolean DEFAULT false,
  use_count integer DEFAULT 0,
  last_used_at timestamptz,
  version integer DEFAULT 1,
  parent_version_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sms_templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  content text NOT NULL,
  character_count integer DEFAULT 0,
  message_parts integer DEFAULT 1,
  available_variables jsonb DEFAULT '[]'::jsonb,
  compliance_tags text[] DEFAULT ARRAY[]::text[],
  include_opt_out boolean DEFAULT true,
  is_shared boolean DEFAULT false,
  is_system_template boolean DEFAULT false,
  use_count integer DEFAULT 0,
  last_used_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact ON campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_organization ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_organization ON sms_templates(organization_id);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view campaigns in org" ON campaigns FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users create campaigns in org" ON campaigns FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users view recipients in org" ON campaign_recipients FOR SELECT TO authenticated
  USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));

CREATE POLICY "System manages recipients" ON campaign_recipients FOR ALL TO authenticated
  USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));

CREATE POLICY "Users view stats in org" ON campaign_stats FOR SELECT TO authenticated
  USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));

CREATE POLICY "Users view templates in org" ON email_templates FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) OR is_system_template = true);

CREATE POLICY "Users view SMS templates in org" ON sms_templates FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) OR is_system_template = true);
