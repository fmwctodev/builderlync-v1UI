/*
  # Sierra Social AI Module — Database Schema

  ## Overview
  Creates all tables required for the AI Social Manager module.

  ## New Tables
  1. `sierra_social_accounts` — OAuth-connected social media accounts per organization
  2. `sierra_social_account_groups` — Named groupings of accounts for bulk-posting
  3. `sierra_social_ai_threads` — Chat conversation containers
  4. `sierra_social_ai_messages` — Individual chat messages within threads
  5. `sierra_social_campaigns` — Recurring content campaigns
  6. `sierra_social_posts` — Central posts table (drafts, scheduled, published)
  7. `sierra_social_post_content` — Per-platform text overrides
  8. `sierra_social_post_logs` — Audit trail for post state changes
  9. `sierra_social_post_metrics` — Analytics synced from publishing API
  10. `sierra_social_post_comment_posts` — Live posts that have received comments
  11. `sierra_social_post_comments` — Individual comments synced from platforms
  12. `sierra_social_guidelines` — Org-wide AI content guidelines
  13. `sierra_social_post_ai_metadata` — Audit log for AI actions on posts

  ## Security
  - RLS enabled on all tables
  - All policies restrict to authenticated users scoped by organization_id
*/

-- ============================================================
-- sierra_social_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_accounts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid NOT NULL,
  provider                text NOT NULL CHECK (provider IN ('facebook','instagram','linkedin','google_business','tiktok','youtube','reddit')),
  external_account_id     text NOT NULL,
  display_name            text NOT NULL,
  profile_image_url       text,
  access_token_encrypted  text,
  refresh_token_encrypted text,
  token_expiry            timestamptz,
  token_meta              jsonb DEFAULT '{}',
  account_type            text DEFAULT 'page',
  status                  text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','disconnected','error')),
  last_error              text,
  connected_by            uuid,
  unipile_account_id      text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE sierra_social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view social accounts"
  ON sierra_social_accounts FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert social accounts"
  ON sierra_social_accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update social accounts"
  ON sierra_social_accounts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete social accounts"
  ON sierra_social_accounts FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_account_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_account_groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name            text NOT NULL,
  description     text,
  account_ids     uuid[] NOT NULL DEFAULT '{}',
  created_by      uuid,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE sierra_social_account_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage social account groups"
  ON sierra_social_account_groups FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert social account groups"
  ON sierra_social_account_groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update social account groups"
  ON sierra_social_account_groups FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete social account groups"
  ON sierra_social_account_groups FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_ai_threads
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_ai_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id         uuid NOT NULL,
  title           text NOT NULL DEFAULT 'New conversation',
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sierra_social_ai_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social threads"
  ON sierra_social_ai_threads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own social threads"
  ON sierra_social_ai_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own social threads"
  ON sierra_social_ai_threads FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own social threads"
  ON sierra_social_ai_threads FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- sierra_social_ai_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_ai_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id       uuid NOT NULL REFERENCES sierra_social_ai_threads(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'user' CHECK (role IN ('user','assistant','system')),
  content         text NOT NULL DEFAULT '',
  message_type    text NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text','url_scrape','youtube_transcript','file_upload','post_draft','campaign_request','image_suggestion')),
  attachments     jsonb NOT NULL DEFAULT '[]',
  generated_posts jsonb,
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sierra_social_ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own threads"
  ON sierra_social_ai_messages FOR SELECT TO authenticated
  USING (thread_id IN (SELECT id FROM sierra_social_ai_threads WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in own threads"
  ON sierra_social_ai_messages FOR INSERT TO authenticated
  WITH CHECK (thread_id IN (SELECT id FROM sierra_social_ai_threads WHERE user_id = auth.uid()));

CREATE POLICY "Users can update messages in own threads"
  ON sierra_social_ai_messages FOR UPDATE TO authenticated
  USING (thread_id IN (SELECT id FROM sierra_social_ai_threads WHERE user_id = auth.uid()))
  WITH CHECK (thread_id IN (SELECT id FROM sierra_social_ai_threads WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete messages in own threads"
  ON sierra_social_ai_messages FOR DELETE TO authenticated
  USING (thread_id IN (SELECT id FROM sierra_social_ai_threads WHERE user_id = auth.uid()));

-- ============================================================
-- sierra_social_campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL,
  created_by          uuid NOT NULL,
  name                text NOT NULL DEFAULT '',
  description         text NOT NULL DEFAULT '',
  theme               text NOT NULL DEFAULT '',
  frequency           text NOT NULL DEFAULT 'weekly'
    CHECK (frequency IN ('daily','weekly','biweekly','monthly')),
  platforms           jsonb NOT NULL DEFAULT '[]',
  content_type        text NOT NULL DEFAULT '',
  hook_style_preset   text NOT NULL DEFAULT 'question'
    CHECK (hook_style_preset IN ('question','statistic','story','bold_claim','educational')),
  approval_required   boolean NOT NULL DEFAULT false,
  autopilot_mode      boolean NOT NULL DEFAULT false,
  status              text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','completed')),
  next_generation_at  timestamptz,
  last_generated_at   timestamptz,
  post_count          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sierra_social_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view social campaigns"
  ON sierra_social_campaigns FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert social campaigns"
  ON sierra_social_campaigns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update social campaigns"
  ON sierra_social_campaigns FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete social campaigns"
  ON sierra_social_campaigns FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_posts (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid NOT NULL,
  created_by              uuid,
  body                    text NOT NULL DEFAULT '',
  media                   jsonb NOT NULL DEFAULT '[]',
  targets                 jsonb NOT NULL DEFAULT '[]',
  first_comment           text,
  link_preview            jsonb,
  platform_options        jsonb DEFAULT '{}',
  customized_per_channel  boolean DEFAULT false,
  status                  text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_approval','scheduled','queued','posting','posted','failed','cancelled','denied')),
  scheduled_at_utc        timestamptz,
  scheduled_timezone      text DEFAULT 'UTC',
  requires_approval       boolean DEFAULT false,
  approved_by             uuid,
  approved_at             timestamptz,
  approval_token          text,
  approval_notes          text,
  approval_requested_at   timestamptz,
  approval_email_sent_at  timestamptz,
  posted_at               timestamptz,
  published_at            timestamptz,
  provider_post_ids       jsonb DEFAULT '{}',
  attempt_count           integer DEFAULT 0,
  last_error              text,
  ai_generated            boolean DEFAULT false,
  ai_generation_id        uuid,
  hook_text               text,
  cta_text                text,
  hashtags                text[],
  visual_style_suggestion text,
  engagement_prediction   numeric,
  ab_variant_group        uuid,
  media_asset_ids         uuid[] DEFAULT '{}',
  campaign_id             uuid REFERENCES sierra_social_campaigns(id) ON DELETE SET NULL,
  thread_id               uuid REFERENCES sierra_social_ai_threads(id) ON DELETE SET NULL,
  late_post_id            text,
  late_status             text,
  late_response           jsonb,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE sierra_social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sierra social posts"
  ON sierra_social_posts FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sierra social posts"
  ON sierra_social_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sierra social posts"
  ON sierra_social_posts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sierra social posts"
  ON sierra_social_posts FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_post_content
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_post_content (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           uuid NOT NULL REFERENCES sierra_social_posts(id) ON DELETE CASCADE,
  platform          text NOT NULL,
  account_id        uuid,
  text              text NOT NULL DEFAULT '',
  follow_up_comment text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE (post_id, platform)
);

ALTER TABLE sierra_social_post_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage post content"
  ON sierra_social_post_content FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert post content"
  ON sierra_social_post_content FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update post content"
  ON sierra_social_post_content FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete post content"
  ON sierra_social_post_content FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_post_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_post_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES sierra_social_posts(id) ON DELETE CASCADE,
  account_id uuid,
  action     text NOT NULL
    CHECK (action IN ('created','scheduled','approved','denied','approval_requested','posted','failed','cancelled','publish_attempted')),
  details    jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_social_post_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view post logs"
  ON sierra_social_post_logs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert post logs"
  ON sierra_social_post_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_post_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_post_metrics (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             uuid NOT NULL REFERENCES sierra_social_posts(id) ON DELETE CASCADE,
  organization_id     uuid NOT NULL,
  platform            text NOT NULL,
  impressions         integer DEFAULT 0,
  reach               integer DEFAULT 0,
  likes               integer DEFAULT 0,
  comments            integer DEFAULT 0,
  shares              integer DEFAULT 0,
  saves               integer DEFAULT 0,
  clicks              integer DEFAULT 0,
  video_views         integer DEFAULT 0,
  watch_time_seconds  integer DEFAULT 0,
  engagement_score    numeric DEFAULT 0,
  reach_score         numeric DEFAULT 0,
  fetched_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sierra_social_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view post metrics"
  ON sierra_social_post_metrics FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert post metrics"
  ON sierra_social_post_metrics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update post metrics"
  ON sierra_social_post_metrics FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_post_comment_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_post_comment_posts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL,
  late_post_id        text NOT NULL,
  late_account_id     text NOT NULL,
  platform            text NOT NULL,
  post_body_preview   text,
  platform_post_url   text,
  comment_count       integer NOT NULL DEFAULT 0,
  last_comment_at     timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, late_post_id, late_account_id)
);

ALTER TABLE sierra_social_post_comment_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comment posts"
  ON sierra_social_post_comment_posts FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert comment posts"
  ON sierra_social_post_comment_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update comment posts"
  ON sierra_social_post_comment_posts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_post_comments
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_post_comments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL,
  comment_post_id     uuid REFERENCES sierra_social_post_comment_posts(id) ON DELETE CASCADE,
  late_comment_id     text NOT NULL,
  late_post_id        text NOT NULL,
  late_account_id     text NOT NULL,
  platform            text NOT NULL,
  author_id           text,
  author_name         text,
  author_handle       text,
  author_avatar_url   text,
  text                text,
  like_count          integer NOT NULL DEFAULT 0,
  reply_count         integer NOT NULL DEFAULT 0,
  is_reply            boolean NOT NULL DEFAULT false,
  parent_comment_id   text,
  hidden              boolean NOT NULL DEFAULT false,
  has_private_reply   boolean NOT NULL DEFAULT false,
  actioned_at         timestamptz,
  actioned_by         uuid,
  synced_at           timestamptz NOT NULL DEFAULT now(),
  comment_created_at  timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, late_comment_id)
);

ALTER TABLE sierra_social_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view post comments"
  ON sierra_social_post_comments FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert post comments"
  ON sierra_social_post_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update post comments"
  ON sierra_social_post_comments FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_guidelines
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_guidelines (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL,
  user_id              uuid,
  content_themes       jsonb NOT NULL DEFAULT '[]',
  image_style          jsonb NOT NULL DEFAULT '[]',
  writing_style        jsonb NOT NULL DEFAULT '[]',
  tone_preferences     jsonb NOT NULL DEFAULT '{"formality":50,"friendliness":50,"energy":50,"confidence":50}',
  words_to_avoid       text[] NOT NULL DEFAULT '{}',
  hashtag_preferences  jsonb NOT NULL DEFAULT '{"preferred":[],"banned":[]}',
  cta_rules            text[] NOT NULL DEFAULT '{}',
  emoji_rules          jsonb NOT NULL DEFAULT '{"frequency":"minimal","banned":[]}',
  industry_positioning text NOT NULL DEFAULT '',
  visual_style_rules   jsonb NOT NULL DEFAULT '[]',
  platform_tweaks      jsonb NOT NULL DEFAULT '{}',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE sierra_social_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view guidelines"
  ON sierra_social_guidelines FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert guidelines"
  ON sierra_social_guidelines FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update guidelines"
  ON sierra_social_guidelines FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- sierra_social_post_ai_metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_social_post_ai_metadata (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             uuid REFERENCES sierra_social_posts(id) ON DELETE SET NULL,
  organization_id     uuid NOT NULL,
  user_id             uuid,
  platform            text,
  action_type         text NOT NULL,
  model_used          text,
  input_content       text,
  output_content      text,
  tokens_used         integer DEFAULT 0,
  generation_params   jsonb DEFAULT '{}',
  applied             boolean DEFAULT false,
  applied_at          timestamptz,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE sierra_social_post_ai_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view AI metadata"
  ON sierra_social_post_ai_metadata FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert AI metadata"
  ON sierra_social_post_ai_metadata FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sierra_social_posts_org_status ON sierra_social_posts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_sierra_social_posts_scheduled ON sierra_social_posts(scheduled_at_utc) WHERE status IN ('scheduled','queued');
CREATE INDEX IF NOT EXISTS idx_sierra_social_posts_campaign ON sierra_social_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sierra_social_posts_thread ON sierra_social_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_sierra_social_ai_messages_thread ON sierra_social_ai_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sierra_social_ai_threads_user ON sierra_social_ai_threads(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sierra_social_post_metrics_org ON sierra_social_post_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_social_accounts_org ON sierra_social_accounts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_sierra_social_campaigns_org ON sierra_social_campaigns(organization_id, status);
