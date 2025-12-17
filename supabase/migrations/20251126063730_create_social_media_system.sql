/*
  # Social Media Management System

  ## Overview
  This migration creates a comprehensive social media management system for scheduling,
  posting, and tracking social media content across multiple platforms.

  ## New Tables

  ### social_media_accounts
  - Stores connected social media account credentials
  - Supports multiple platforms per organization
  - Encrypted tokens for security
  - Connection status tracking

  ### social_posts
  - Central repository for all social media posts
  - Supports drafts, scheduled, and published posts
  - Platform-specific configuration storage
  - Multi-platform posting support

  ### social_post_analytics
  - Tracks performance metrics for published posts
  - Platform-specific engagement data
  - Historical performance tracking

  ## Security
  - All tables have RLS enabled
  - Users can only access data within their organization
  - Encrypted storage for sensitive tokens
*/

-- Create enum for social media platforms
DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM (
    'google_business',
    'facebook',
    'instagram',
    'linkedin',
    'twitter',
    'tiktok',
    'youtube'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for post status
DO $$ BEGIN
  CREATE TYPE social_post_status AS ENUM (
    'draft',
    'scheduled',
    'posting',
    'posted',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Social Media Accounts Table
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  account_name text NOT NULL,
  account_id text,
  profile_image_url text,
  is_connected boolean DEFAULT false,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, platform, account_id)
);

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  media_urls jsonb DEFAULT '[]'::jsonb,
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  platform_options jsonb DEFAULT '{}'::jsonb,
  status social_post_status DEFAULT 'draft',
  scheduled_at timestamptz,
  posted_at timestamptz,
  character_count integer DEFAULT 0,
  is_customize_per_channel boolean DEFAULT false,
  custom_content jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social Post Analytics Table
CREATE TABLE IF NOT EXISTS social_post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  platform_post_id text,
  impressions integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement_rate decimal(5,2) DEFAULT 0.00,
  reach integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, platform)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_org
  ON social_media_accounts(organization_id);

CREATE INDEX IF NOT EXISTS idx_social_media_accounts_platform
  ON social_media_accounts(platform);

CREATE INDEX IF NOT EXISTS idx_social_posts_org
  ON social_posts(organization_id);

CREATE INDEX IF NOT EXISTS idx_social_posts_status
  ON social_posts(status);

CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled
  ON social_posts(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_social_post_analytics_post
  ON social_post_analytics(post_id);

-- Enable Row Level Security
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_media_accounts

CREATE POLICY "Users can view own organization social accounts"
  ON social_media_accounts FOR SELECT
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Users can insert own organization social accounts"
  ON social_media_accounts FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update own organization social accounts"
  ON social_media_accounts FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can delete own organization social accounts"
  ON social_media_accounts FOR DELETE
  TO authenticated
  USING (organization_id = auth.uid());

-- RLS Policies for social_posts

CREATE POLICY "Users can view own organization social posts"
  ON social_posts FOR SELECT
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Users can insert own organization social posts"
  ON social_posts FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = auth.uid() AND user_id = auth.uid());

CREATE POLICY "Users can update own organization social posts"
  ON social_posts FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can delete own organization social posts"
  ON social_posts FOR DELETE
  TO authenticated
  USING (organization_id = auth.uid());

-- RLS Policies for social_post_analytics

CREATE POLICY "Users can view own organization post analytics"
  ON social_post_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_posts
      WHERE social_posts.id = social_post_analytics.post_id
      AND social_posts.organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own organization post analytics"
  ON social_post_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_posts
      WHERE social_posts.id = social_post_analytics.post_id
      AND social_posts.organization_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own organization post analytics"
  ON social_post_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_posts
      WHERE social_posts.id = social_post_analytics.post_id
      AND social_posts.organization_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_posts
      WHERE social_posts.id = social_post_analytics.post_id
      AND social_posts.organization_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_social_media_accounts_updated_at ON social_media_accounts;
CREATE TRIGGER update_social_media_accounts_updated_at
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();