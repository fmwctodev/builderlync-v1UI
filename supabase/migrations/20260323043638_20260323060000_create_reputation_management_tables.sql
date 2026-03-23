/*
  # Create Reputation Management Tables

  ## Summary
  Creates all tables required for the Reputation Management module, which allows
  organizations to manage and respond to reviews from Google Business and Facebook.

  ## New Tables

  ### 1. reputation_reviews
  Stores individual reviews synced from external platforms (Google Business, Facebook).
  Columns: id, org_id, platform, account_id, rating, reviewer info, reply status, etc.

  ### 2. reputation_review_replies
  Stores replies (published or drafted) for each review.
  Links back to reputation_reviews via review_id.

  ### 3. reputation_ai_drafts
  Stores AI-generated reply drafts. Tracks tone preset, model used, and applied status.

  ### 4. reputation_settings
  Per-organization configuration (AI tone defaults, signature, SLA hours, escalation).

  ### 5. reputation_routing_rules
  Rules for auto-assigning reviews to users/roles based on platform and rating range.

  ### 6. reputation_actions_audit
  Audit log for all reputation-related actions (sync, reply, escalation, etc.).

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read and write all rows (matching the pattern used by
    contacts, jobs, and other existing tables in this project)
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- reputation_reviews
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_reviews (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  uuid NOT NULL,
  late_review_id          text,
  platform                text NOT NULL CHECK (platform IN ('facebook', 'googlebusiness')),
  account_id              text NOT NULL,
  account_username        text,
  reviewer_id             text,
  reviewer_name           text,
  reviewer_profile_image  text,
  rating                  integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text             text,
  review_created_at       timestamptz NOT NULL DEFAULT now(),
  has_reply               boolean NOT NULL DEFAULT false,
  review_url              text,
  last_synced_at          timestamptz NOT NULL DEFAULT now(),
  assigned_to_user_id     uuid,
  priority                text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  sla_breached            boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reputation reviews"
  ON reputation_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reputation reviews"
  ON reputation_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reputation reviews"
  ON reputation_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reputation reviews"
  ON reputation_reviews FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_id ON reputation_reviews (org_id);
CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_platform ON reputation_reviews (org_id, platform);
CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_created ON reputation_reviews (org_id, review_created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reputation_reviews_late_id ON reputation_reviews (org_id, late_review_id) WHERE late_review_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- reputation_review_replies
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_review_replies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL,
  review_id           uuid NOT NULL REFERENCES reputation_reviews (id) ON DELETE CASCADE,
  late_reply_id       text,
  reply_text          text,
  reply_created_at    timestamptz,
  created_by_user_id  uuid,
  source              text NOT NULL DEFAULT 'manual' CHECK (source IN ('late', 'manual', 'ai_draft')),
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deleted')),
  last_updated_at     timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reputation replies"
  ON reputation_review_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reputation replies"
  ON reputation_review_replies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reputation replies"
  ON reputation_review_replies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reputation replies"
  ON reputation_review_replies FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reputation_replies_review_id ON reputation_review_replies (review_id);
CREATE INDEX IF NOT EXISTS idx_reputation_replies_org_id ON reputation_review_replies (org_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- reputation_ai_drafts
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_ai_drafts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL,
  review_id             uuid NOT NULL REFERENCES reputation_reviews (id) ON DELETE CASCADE,
  draft_text            text NOT NULL,
  model                 text NOT NULL DEFAULT 'gpt-4o',
  tone_preset           text CHECK (tone_preset IN ('concise', 'empathetic', 'fixit')),
  created_by_user_id    uuid NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  applied               boolean NOT NULL DEFAULT false,
  applied_at            timestamptz
);

ALTER TABLE reputation_ai_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ai drafts"
  ON reputation_ai_drafts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ai drafts"
  ON reputation_ai_drafts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ai drafts"
  ON reputation_ai_drafts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ai drafts"
  ON reputation_ai_drafts FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reputation_ai_drafts_review_id ON reputation_ai_drafts (review_id);
CREATE INDEX IF NOT EXISTS idx_reputation_ai_drafts_org_id ON reputation_ai_drafts (org_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- reputation_settings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  uuid NOT NULL UNIQUE,
  default_ai_tone         text NOT NULL DEFAULT 'concise',
  default_signature       text NOT NULL DEFAULT '',
  auto_append_signature   boolean NOT NULL DEFAULT false,
  default_temperature     numeric(3,2) NOT NULL DEFAULT 0.4,
  escalation_email        text,
  escalation_user_id      uuid,
  sla_hours_positive      integer NOT NULL DEFAULT 48,
  sla_hours_negative      integer NOT NULL DEFAULT 12,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reputation settings"
  ON reputation_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reputation settings"
  ON reputation_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reputation settings"
  ON reputation_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reputation_settings_org_id ON reputation_settings (org_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- reputation_routing_rules
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_routing_rules (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                    uuid NOT NULL,
  platform                  text CHECK (platform IN ('facebook', 'googlebusiness')),
  min_rating                integer NOT NULL DEFAULT 1 CHECK (min_rating >= 1 AND min_rating <= 5),
  max_rating                integer NOT NULL DEFAULT 5 CHECK (max_rating >= 1 AND max_rating <= 5),
  assign_to_user_id         uuid,
  assign_to_role            text,
  priority                  text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  requires_manual_approval  boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view routing rules"
  ON reputation_routing_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert routing rules"
  ON reputation_routing_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update routing rules"
  ON reputation_routing_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete routing rules"
  ON reputation_routing_rules FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reputation_routing_rules_org_id ON reputation_routing_rules (org_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- reputation_actions_audit
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputation_actions_audit (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL,
  user_id      uuid,
  action       text NOT NULL,
  entity_type  text,
  entity_id    uuid,
  metadata     jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_actions_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit log"
  ON reputation_actions_audit FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert audit log"
  ON reputation_actions_audit FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reputation_audit_org_id ON reputation_actions_audit (org_id);
CREATE INDEX IF NOT EXISTS idx_reputation_audit_action ON reputation_actions_audit (org_id, action);
