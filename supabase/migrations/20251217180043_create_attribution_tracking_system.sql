/*
  # Create Attribution Tracking System

  ## Overview
  This migration creates comprehensive attribution tracking system for marketing analytics
  including session events, UTM tracking, and lead source attribution

  ## 1. New Tables

  ### `session_events`
  Tracks all visitor sessions and page visits with UTM parameters
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `session_id` (text, required) - Session identifier
  - `event_type` (text, required) - Type of event (page_visit, form_submit, call, etc)
  - `url` (text) - Page URL
  - `referrer` (text) - Referrer URL
  - `utm_source` (text) - UTM source parameter
  - `utm_medium` (text) - UTM medium parameter
  - `utm_campaign` (text) - UTM campaign parameter
  - `utm_content` (text) - UTM content parameter
  - `utm_term` (text) - UTM term parameter
  - `ip_address` (text) - Visitor IP address
  - `user_agent` (text) - Browser user agent
  - `device_type` (text) - Device type (desktop, mobile, tablet)
  - `browser` (text) - Browser name
  - `os` (text) - Operating system
  - `metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz) - Event timestamp

  ### `lead_source_attribution`
  Links leads/contacts to their original marketing sources
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `contact_id` (uuid) - Reference to contact
  - `opportunity_id` (uuid) - Reference to opportunity
  - `session_id` (text) - Original session identifier
  - `first_touch_source` (text) - First interaction source
  - `first_touch_medium` (text) - First interaction medium
  - `first_touch_campaign` (text) - First interaction campaign
  - `last_touch_source` (text) - Last interaction source
  - `last_touch_medium` (text) - Last interaction medium
  - `last_touch_campaign` (text) - Last interaction campaign
  - `attribution_model` (text) - Attribution model used
  - `total_touchpoints` (integer) - Number of interactions
  - `conversion_value` (numeric) - Revenue/value attributed
  - `converted_at` (timestamptz) - Conversion timestamp
  - `created_at` (timestamptz) - Record creation
  - `updated_at` (timestamptz) - Last update

  ### `conversion_tracking`
  Tracks multi-touch attribution for conversions
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, required) - Organization ownership
  - `attribution_id` (uuid) - Reference to lead_source_attribution
  - `session_id` (text) - Session identifier
  - `touchpoint_position` (integer) - Position in conversion path
  - `source` (text) - Marketing source
  - `medium` (text) - Marketing medium
  - `campaign` (text) - Campaign name
  - `attribution_weight` (numeric) - Attribution weight (0-1)
  - `revenue_attributed` (numeric) - Revenue portion attributed
  - `created_at` (timestamptz) - Timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Organization-scoped access policies

  ## 3. Indexes
  - Performance indexes for common queries
  - Composite indexes for date range and organization queries
*/

-- Create session_events table
CREATE TABLE IF NOT EXISTS session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_visit', 'form_submit', 'call_initiated', 'chat_started', 'conversion')),
  url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  ip_address text,
  user_agent text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser text,
  os text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create lead_source_attribution table
CREATE TABLE IF NOT EXISTS lead_source_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  contact_id uuid,
  opportunity_id uuid,
  session_id text,
  first_touch_source text,
  first_touch_medium text,
  first_touch_campaign text,
  first_touch_content text,
  first_touch_term text,
  first_touch_url text,
  first_touch_at timestamptz,
  last_touch_source text,
  last_touch_medium text,
  last_touch_campaign text,
  last_touch_content text,
  last_touch_term text,
  last_touch_url text,
  last_touch_at timestamptz,
  attribution_model text DEFAULT 'last_touch' CHECK (attribution_model IN ('first_touch', 'last_touch', 'linear', 'time_decay', 'position_based')),
  total_touchpoints integer DEFAULT 1,
  conversion_value numeric DEFAULT 0,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversion_tracking table
CREATE TABLE IF NOT EXISTS conversion_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  attribution_id uuid REFERENCES lead_source_attribution(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  touchpoint_position integer NOT NULL,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  url text,
  attribution_weight numeric DEFAULT 0 CHECK (attribution_weight >= 0 AND attribution_weight <= 1),
  revenue_attributed numeric DEFAULT 0,
  touchpoint_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_events_organization ON session_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON session_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_org_date ON session_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_utm_source ON session_events(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_session_events_utm_campaign ON session_events(utm_campaign) WHERE utm_campaign IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_attribution_organization ON lead_source_attribution(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_contact ON lead_source_attribution(contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_opportunity ON lead_source_attribution(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_session ON lead_source_attribution(session_id);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_first_source ON lead_source_attribution(first_touch_source);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_last_source ON lead_source_attribution(last_touch_source);
CREATE INDEX IF NOT EXISTS idx_lead_attribution_converted_at ON lead_source_attribution(converted_at DESC) WHERE converted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_tracking_organization ON conversion_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_attribution ON conversion_tracking(attribution_id);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_session ON conversion_tracking(session_id);

-- Enable RLS
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_source_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_events
CREATE POLICY "Users view session events in org" ON session_events FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users create session events in org" ON session_events FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for lead_source_attribution
CREATE POLICY "Users view attribution in org" ON lead_source_attribution FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage attribution in org" ON lead_source_attribution FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- RLS Policies for conversion_tracking
CREATE POLICY "Users view conversions in org" ON conversion_tracking FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage conversions in org" ON conversion_tracking FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
