/*
  # Create Reputation Management System

  1. New Tables
    - review_sources - Review platform connections
    - reviews - Customer review aggregation
    - review_responses - Responses to reviews
    - review_invitations - Review request tracking
    - gbp_posts - Google Business Profile posts
    - gbp_insights - Google Business Profile analytics

  2. Security
    - Enable RLS on all tables
    - Organization-based access control

  3. Features
    - Multi-platform review aggregation
    - Automated review requests
    - Response management
    - GBP posting and analytics
*/

-- Create review_sources table
CREATE TABLE IF NOT EXISTS review_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  
  -- Platform Information
  platform text NOT NULL CHECK (platform IN (
    'google_business',
    'yelp',
    'facebook',
    'bbb',
    'trustpilot',
    'angi',
    'home_advisor',
    'custom'
  )),
  platform_name text NOT NULL,
  
  -- Connection Details
  is_connected boolean DEFAULT false,
  api_credentials jsonb DEFAULT '{}'::jsonb,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  
  -- Source Metadata
  business_id text,
  business_name text,
  business_url text,
  profile_image_url text,
  
  -- Sync Settings
  auto_sync_enabled boolean DEFAULT true,
  sync_frequency_hours integer DEFAULT 24,
  last_synced_at timestamptz,
  next_sync_at timestamptz,
  
  -- Stats
  total_reviews integer DEFAULT 0,
  average_rating numeric(3, 2) DEFAULT 0,
  
  -- Status
  is_active boolean DEFAULT true,
  error_message text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  review_source_id uuid REFERENCES review_sources(id) ON DELETE SET NULL,
  
  -- Review Information
  external_id text,
  platform text NOT NULL,
  reviewer_name text NOT NULL,
  reviewer_email text,
  reviewer_profile_url text,
  reviewer_profile_image_url text,
  
  -- Review Content
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  
  -- Sentiment Analysis
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score numeric(3, 2),
  
  -- Review Metadata
  review_date timestamptz NOT NULL,
  is_verified boolean DEFAULT false,
  is_flagged boolean DEFAULT false,
  flag_reason text,
  
  -- Response Status
  has_response boolean DEFAULT false,
  response_date timestamptz,
  
  -- Associated Records
  contact_id uuid,
  job_id uuid,
  opportunity_id uuid,
  
  -- Visibility
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  
  -- Metadata
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(review_source_id, external_id)
);

-- Create review_responses table
CREATE TABLE IF NOT EXISTS review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  
  -- Response Content
  response_text text NOT NULL,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'failed')),
  
  -- Publishing
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id),
  external_response_id text,
  
  -- Template
  template_id uuid,
  
  -- Error Handling
  error_message text,
  retry_count integer DEFAULT 0,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create review_invitations table
CREATE TABLE IF NOT EXISTS review_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  
  -- Recipient
  contact_id uuid NOT NULL,
  recipient_name text NOT NULL,
  recipient_email text,
  recipient_phone text,
  
  -- Invitation Details
  platform text NOT NULL,
  review_url text NOT NULL,
  invitation_method text CHECK (invitation_method IN ('email', 'sms', 'both')),
  
  -- Message
  email_subject text,
  email_content text,
  sms_content text,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'reviewed',
    'declined',
    'failed',
    'expired'
  )),
  
  -- Tracking
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  reviewed_at timestamptz,
  expires_at timestamptz,
  
  -- Associated Records
  job_id uuid,
  opportunity_id uuid,
  campaign_id uuid,
  
  -- Unique Link
  unique_token text UNIQUE,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gbp_posts table (Google Business Profile)
CREATE TABLE IF NOT EXISTS gbp_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  review_source_id uuid REFERENCES review_sources(id) ON DELETE SET NULL,
  
  -- Post Information
  post_type text NOT NULL CHECK (post_type IN ('update', 'event', 'offer', 'product')),
  title text,
  content text NOT NULL,
  
  -- Media
  media_urls jsonb DEFAULT '[]'::jsonb,
  
  -- Call to Action
  cta_type text CHECK (cta_type IN ('book', 'order', 'learn_more', 'sign_up', 'call')),
  cta_url text,
  
  -- Event Details (for event posts)
  event_title text,
  event_start_date timestamptz,
  event_end_date timestamptz,
  
  -- Offer Details (for offer posts)
  offer_code text,
  offer_terms text,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'expired', 'failed')),
  
  -- Publishing
  scheduled_date timestamptz,
  published_at timestamptz,
  external_post_id text,
  
  -- Engagement
  views_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  
  -- Error Handling
  error_message text,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gbp_insights table
CREATE TABLE IF NOT EXISTS gbp_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  review_source_id uuid NOT NULL REFERENCES review_sources(id) ON DELETE CASCADE,
  
  -- Time Period
  date date NOT NULL,
  metric_type text NOT NULL,
  
  -- Metrics
  searches_direct integer DEFAULT 0,
  searches_discovery integer DEFAULT 0,
  searches_branded integer DEFAULT 0,
  views_maps integer DEFAULT 0,
  views_search integer DEFAULT 0,
  actions_website integer DEFAULT 0,
  actions_phone integer DEFAULT 0,
  actions_directions integer DEFAULT 0,
  photos_views_merchant integer DEFAULT 0,
  photos_views_customer integer DEFAULT 0,
  photos_count_merchant integer DEFAULT 0,
  photos_count_customer integer DEFAULT 0,
  
  -- Engagement
  total_interactions integer DEFAULT 0,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(review_source_id, date, metric_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_review_sources_organization ON review_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_sources_platform ON review_sources(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_organization ON reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(review_source_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_contact ON reviews(contact_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_invitations_organization ON review_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_review_invitations_contact ON review_invitations(contact_id);
CREATE INDEX IF NOT EXISTS idx_review_invitations_status ON review_invitations(status);
CREATE INDEX IF NOT EXISTS idx_gbp_posts_organization ON gbp_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_gbp_posts_status ON gbp_posts(status);
CREATE INDEX IF NOT EXISTS idx_gbp_insights_source ON gbp_insights(review_source_id);
CREATE INDEX IF NOT EXISTS idx_gbp_insights_date ON gbp_insights(date DESC);

-- Enable RLS
ALTER TABLE review_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gbp_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gbp_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view review sources in org" ON review_sources FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users view reviews in org" ON reviews FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage responses in org" ON review_responses FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage invitations in org" ON review_invitations FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users manage GBP posts in org" ON gbp_posts FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users view GBP insights in org" ON gbp_insights FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
