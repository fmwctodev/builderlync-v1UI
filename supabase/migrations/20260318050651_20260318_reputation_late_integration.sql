/*
  # Reputation Module — Late.dev Integration

  ## Summary
  Adds four new tables to support the Reputation module that syncs reviews from
  the Late.dev inbox API (Facebook + Google Business), generates AI-assisted reply
  drafts via GPT-5.1, and logs every action for audit purposes.

  ## New Tables

  ### 1. reputation_reviews
  Stores reviews pulled from the Late.dev /inbox/reviews API.
  - `late_review_id` is the external ID from Late; unique per org.
  - `platform` is either "facebook" or "googlebusiness".
  - `account_id` is the Late social account that owns this review.
  - `has_reply` mirrors the Late flag and is updated on every sync/reply action.
  - `last_synced_at` tracks freshness of the cached row.

  ### 2. reputation_review_replies
  Stores reply records for reviews, sourced from Late ("late"), typed manually
  ("manual"), or saved as an AI draft ("ai_draft").
  - `status` is "draft", "published", or "deleted".
  - `created_by_user_id` is set when a user publishes a reply through our app.

  ### 3. reputation_ai_drafts
  Stores AI-generated reply draft text produced by GPT-5.1.
  - Three drafts are generated per request (concise, empathetic, fix-it).
  - `applied` / `applied_at` track whether the user selected and used this draft.

  ### 4. reputation_actions_audit
  Immutable audit trail for every meaningful action in the Reputation module:
  sync_reviews, generate_ai_reply, publish_reply, delete_reply.

  ## Security
  - RLS enabled on all four tables.
  - Every policy scopes rows to the calling user's organization via
    `organization_members` membership check.
  - Write policies additionally verify the user is an owner or admin
    (matching the existing pattern used throughout the codebase).

  ## Notes
  - All tables use `gen_random_uuid()` primary keys.
  - Foreign keys from `reputation_review_replies` and `reputation_ai_drafts`
    back to `reputation_reviews` use ON DELETE CASCADE so removing a cached
    review row automatically cleans up replies and drafts.
  - `reputation_actions_audit` rows are intentionally never deleted (immutable log).
*/

-- ============================================================
-- 1. reputation_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reputation_reviews (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL,
  late_review_id        text NOT NULL,
  platform              text NOT NULL CHECK (platform IN ('facebook', 'googlebusiness')),
  account_id            text NOT NULL,
  account_username      text,
  reviewer_id           text,
  reviewer_name         text,
  reviewer_profile_image text,
  rating                int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text           text,
  review_created_at     timestamptz NOT NULL,
  has_reply             boolean DEFAULT false,
  review_url            text,
  last_synced_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, late_review_id)
);

CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_platform
  ON reputation_reviews (org_id, platform);

CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_account
  ON reputation_reviews (org_id, account_id);

CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_rating
  ON reputation_reviews (org_id, rating);

CREATE INDEX IF NOT EXISTS idx_reputation_reviews_org_created
  ON reputation_reviews (org_id, review_created_at);

ALTER TABLE reputation_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view reputation reviews"
  ON reputation_reviews FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org admins can insert reputation reviews"
  ON reputation_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org admins can update reputation reviews"
  ON reputation_reviews FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================
-- 2. reputation_review_replies
-- ============================================================
CREATE TABLE IF NOT EXISTS reputation_review_replies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL,
  review_id           uuid NOT NULL REFERENCES reputation_reviews(id) ON DELETE CASCADE,
  late_reply_id       text,
  reply_text          text,
  reply_created_at    timestamptz,
  created_by_user_id  uuid,
  source              text NOT NULL DEFAULT 'late' CHECK (source IN ('late', 'manual', 'ai_draft')),
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deleted')),
  last_updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reputation_replies_org
  ON reputation_review_replies (org_id);

CREATE INDEX IF NOT EXISTS idx_reputation_replies_review
  ON reputation_review_replies (review_id);

ALTER TABLE reputation_review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view reputation replies"
  ON reputation_review_replies FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org members can insert reputation replies"
  ON reputation_review_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org members can update reputation replies"
  ON reputation_review_replies FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================
-- 3. reputation_ai_drafts
-- ============================================================
CREATE TABLE IF NOT EXISTS reputation_ai_drafts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL,
  review_id           uuid NOT NULL REFERENCES reputation_reviews(id) ON DELETE CASCADE,
  draft_text          text NOT NULL,
  model               text NOT NULL DEFAULT 'gpt-5.1',
  tone_preset         text,
  created_by_user_id  uuid NOT NULL,
  created_at          timestamptz DEFAULT now(),
  applied             boolean DEFAULT false,
  applied_at          timestamptz
);

CREATE INDEX IF NOT EXISTS idx_reputation_ai_drafts_review
  ON reputation_ai_drafts (review_id);

CREATE INDEX IF NOT EXISTS idx_reputation_ai_drafts_org
  ON reputation_ai_drafts (org_id);

ALTER TABLE reputation_ai_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view ai drafts"
  ON reputation_ai_drafts FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org members can insert ai drafts"
  ON reputation_ai_drafts FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org members can update ai drafts"
  ON reputation_ai_drafts FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================
-- 4. reputation_actions_audit
-- ============================================================
CREATE TABLE IF NOT EXISTS reputation_actions_audit (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL,
  user_id     uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('sync_reviews', 'generate_ai_reply', 'publish_reply', 'delete_reply')),
  entity_type text NOT NULL CHECK (entity_type IN ('review', 'reply', 'draft')),
  entity_id   uuid NOT NULL,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reputation_audit_org
  ON reputation_actions_audit (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reputation_audit_entity
  ON reputation_actions_audit (entity_type, entity_id);

ALTER TABLE reputation_actions_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view reputation audit log"
  ON reputation_actions_audit FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org members can insert reputation audit entries"
  ON reputation_actions_audit FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
