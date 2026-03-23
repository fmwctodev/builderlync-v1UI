/*
  # Reputation Settings, Routing Rules, and Integration Status

  ## Summary
  This migration adds the full enterprise configuration layer for the Reputation module.

  ## New Tables

  ### `reputation_settings`
  - Per-organization configuration for AI defaults, SLA targets, and escalation settings
  - `default_ai_tone` — preferred tone for AI reply generation
  - `default_signature` — text appended to AI drafts when auto_append_signature is true
  - `auto_append_signature` — whether to auto-append signature to AI drafts
  - `default_temperature` — OpenAI temperature override (0.2–0.7)
  - `escalation_email` — email address for escalation notifications
  - `escalation_user_id` — user assigned to escalated reviews
  - `sla_hours_positive` — SLA target in hours for positive reviews (default 48)
  - `sla_hours_negative` — SLA target in hours for negative reviews (default 12)

  ### `reputation_routing_rules`
  - Rules that auto-assign reviews to users or roles based on platform and rating
  - `platform` — nullable, applies to all platforms if null
  - `min_rating` / `max_rating` — inclusive rating range filter
  - `assign_to_user_id` — direct user assignment (mutually exclusive with assign_to_role)
  - `assign_to_role` — role-based assignment (resolved at sync time to first available user)
  - `priority` — urgency level: low, normal, high, urgent
  - `requires_manual_approval` — whether the assigned user must explicitly approve before replying

  ### `reputation_integration_status`
  - Persisted status record updated after every sync run
  - `connected` — whether the Late integration is active
  - `last_sync_at` — timestamp of the most recent successful sync
  - `last_error` — error message from the most recent failed sync (null on success)
  - `accounts_connected` — JSONB summary of connected platform accounts

  ## Modified Tables

  ### `reputation_reviews`
  - Added `assigned_to_user_id uuid` — the user assigned to handle this review
  - Added `priority text default 'normal'` — urgency level applied by routing rules
  - Added `sla_breached boolean default false` — true when SLA deadline has passed without a reply

  ## Security
  - RLS enabled on all three new tables
  - All policies scope access by organization membership using the existing `organization_members` pattern
*/

-- ─── reputation_settings ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reputation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL UNIQUE,
  default_ai_tone text NOT NULL DEFAULT 'concise',
  default_signature text NOT NULL DEFAULT '',
  auto_append_signature boolean NOT NULL DEFAULT false,
  default_temperature numeric(3,2) NOT NULL DEFAULT 0.40
    CHECK (default_temperature >= 0.20 AND default_temperature <= 0.70),
  escalation_email text,
  escalation_user_id uuid,
  sla_hours_positive integer NOT NULL DEFAULT 48,
  sla_hours_negative integer NOT NULL DEFAULT 12,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can select reputation_settings"
  ON reputation_settings FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org admins can insert reputation_settings"
  ON reputation_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org admins can update reputation_settings"
  ON reputation_settings FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

-- ─── reputation_routing_rules ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reputation_routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  platform text CHECK (platform IN ('facebook', 'googlebusiness')),
  min_rating integer NOT NULL DEFAULT 1 CHECK (min_rating >= 1 AND min_rating <= 5),
  max_rating integer NOT NULL DEFAULT 5 CHECK (max_rating >= 1 AND max_rating <= 5),
  assign_to_user_id uuid,
  assign_to_role text,
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  requires_manual_approval boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reputation_routing_rules_org_id
  ON reputation_routing_rules(org_id);

ALTER TABLE reputation_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can select routing rules"
  ON reputation_routing_rules FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org admins can insert routing rules"
  ON reputation_routing_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org admins can update routing rules"
  ON reputation_routing_rules FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org admins can delete routing rules"
  ON reputation_routing_rules FOR DELETE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

-- ─── reputation_integration_status ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reputation_integration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL UNIQUE,
  connected boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  last_error text,
  accounts_connected jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reputation_integration_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can select integration status"
  ON reputation_integration_status FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Org admins can insert integration status"
  ON reputation_integration_status FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org admins can update integration status"
  ON reputation_integration_status FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

-- ─── Extend reputation_reviews ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reputation_reviews' AND column_name = 'assigned_to_user_id'
  ) THEN
    ALTER TABLE reputation_reviews ADD COLUMN assigned_to_user_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reputation_reviews' AND column_name = 'priority'
  ) THEN
    ALTER TABLE reputation_reviews ADD COLUMN priority text NOT NULL DEFAULT 'normal'
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reputation_reviews' AND column_name = 'sla_breached'
  ) THEN
    ALTER TABLE reputation_reviews ADD COLUMN sla_breached boolean NOT NULL DEFAULT false;
  END IF;
END $$;
