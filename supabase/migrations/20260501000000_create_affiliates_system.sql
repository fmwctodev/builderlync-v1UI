/*
  # Affiliates System

  Adds affiliate-program tables so Super Admin can:
   - manage affiliates (add / edit / delete)
   - track referrals captured via ?ref=CODE on signup
   - accrue and pay out commissions on a Net 30 cadence
     (recurring % of referred-account MRR, configurable per affiliate)

  ## Tables

  ### affiliates
   Roster of partners promoting BuilderLync. Each gets a unique
   `referral_code` (used in the public ?ref=CODE param).

  ### affiliate_referrals
   One row per referred prospect/customer.
   - status: 'cookie' (only cookie set, no signup yet)
            'signed_up' (referred user signed up)
            'paying' (referred account became paying — commissions accruing)
            'churned' (referred account no longer paying)
   - first_payment_at marks the start of the recurring window

  ### affiliate_payouts
   One row per (affiliate, billing period) commission accrual.
   - period_start / period_end: monthly window
   - amount_due: commission earned in that period
   - due_date = period_end + 30 days (Net 30)
   - status: 'accrued' -> 'approved' -> 'paid'  (or 'void')

  ## Public insert path
  Unauthenticated visitors hitting /signup?ref=CODE need to be able to
  insert into `affiliate_referrals`. This is gated by an RPC
  `record_affiliate_referral(p_code, p_email, p_user_id, p_account_id, p_source_url)`
  that validates the code against `affiliates.status='active'` before insert.
*/

-- =========================================================================
-- Tables
-- =========================================================================

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  referral_code VARCHAR(64) NOT NULL UNIQUE,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.20,        -- 20%
  commission_window_months INTEGER NOT NULL DEFAULT 12,       -- recurring for 12 months
  payout_method VARCHAR(50) DEFAULT 'paypal',                 -- paypal | ach | wire | check
  payout_email VARCHAR(255),
  payout_details JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'active',               -- active | paused | inactive
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_email VARCHAR(255),
  referred_user_id UUID,
  referred_account_id UUID,
  referred_account_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'cookie',
  -- cookie | signed_up | paying | churned
  cookie_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  first_payment_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  source_url TEXT,
  utm JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_account ON affiliate_referrals(referred_account_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  due_date DATE NOT NULL,                            -- period_end + 30 days
  status VARCHAR(20) NOT NULL DEFAULT 'accrued',     -- accrued | approved | paid | void
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  paid_at TIMESTAMPTZ,
  paid_by UUID,
  payment_reference VARCHAR(255),
  breakdown JSONB DEFAULT '[]'::jsonb,                -- per-referral contribution
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (affiliate_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_due_date ON affiliate_payouts(due_date);

-- =========================================================================
-- Updated-at triggers
-- =========================================================================

CREATE OR REPLACE FUNCTION set_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_affiliates_updated_at ON affiliates;
CREATE TRIGGER trg_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION set_affiliate_updated_at();

DROP TRIGGER IF EXISTS trg_affiliate_referrals_updated_at ON affiliate_referrals;
CREATE TRIGGER trg_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW EXECUTE FUNCTION set_affiliate_updated_at();

DROP TRIGGER IF EXISTS trg_affiliate_payouts_updated_at ON affiliate_payouts;
CREATE TRIGGER trg_affiliate_payouts_updated_at
  BEFORE UPDATE ON affiliate_payouts
  FOR EACH ROW EXECUTE FUNCTION set_affiliate_updated_at();

-- =========================================================================
-- Public RPC: record_affiliate_referral
-- Called from the unauthenticated signup flow (anon key).
-- Validates the code against an active affiliate, then upserts
-- a referral row keyed on (affiliate_id, referred_email).
-- =========================================================================

CREATE OR REPLACE FUNCTION record_affiliate_referral(
  p_code TEXT,
  p_email TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_account_id UUID DEFAULT NULL,
  p_account_name TEXT DEFAULT NULL,
  p_source_url TEXT DEFAULT NULL,
  p_utm JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_id UUID;
  v_referral_id UUID;
  v_status VARCHAR(20);
BEGIN
  SELECT id INTO v_affiliate_id
  FROM affiliates
  WHERE referral_code = p_code AND status = 'active'
  LIMIT 1;

  IF v_affiliate_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_user_id IS NOT NULL OR p_account_id IS NOT NULL THEN
    v_status := 'signed_up';
  ELSE
    v_status := 'cookie';
  END IF;

  -- Upsert: prefer matching by user_id, fall back to email
  IF p_user_id IS NOT NULL THEN
    SELECT id INTO v_referral_id
    FROM affiliate_referrals
    WHERE affiliate_id = v_affiliate_id AND referred_user_id = p_user_id
    LIMIT 1;
  END IF;

  IF v_referral_id IS NULL AND p_email IS NOT NULL THEN
    SELECT id INTO v_referral_id
    FROM affiliate_referrals
    WHERE affiliate_id = v_affiliate_id AND lower(referred_email) = lower(p_email)
    LIMIT 1;
  END IF;

  IF v_referral_id IS NULL THEN
    INSERT INTO affiliate_referrals (
      affiliate_id, referred_email, referred_user_id, referred_account_id,
      referred_account_name, status, cookie_at, signed_up_at,
      source_url, utm
    ) VALUES (
      v_affiliate_id, p_email, p_user_id, p_account_id,
      p_account_name, v_status, NOW(),
      CASE WHEN v_status = 'signed_up' THEN NOW() ELSE NULL END,
      p_source_url, COALESCE(p_utm, '{}'::jsonb)
    )
    RETURNING id INTO v_referral_id;
  ELSE
    UPDATE affiliate_referrals
    SET
      referred_email = COALESCE(p_email, referred_email),
      referred_user_id = COALESCE(p_user_id, referred_user_id),
      referred_account_id = COALESCE(p_account_id, referred_account_id),
      referred_account_name = COALESCE(p_account_name, referred_account_name),
      status = CASE
        WHEN status = 'cookie' AND v_status = 'signed_up' THEN 'signed_up'
        ELSE status
      END,
      signed_up_at = CASE
        WHEN signed_up_at IS NULL AND v_status = 'signed_up' THEN NOW()
        ELSE signed_up_at
      END,
      source_url = COALESCE(source_url, p_source_url),
      utm = CASE WHEN utm = '{}'::jsonb THEN COALESCE(p_utm, '{}'::jsonb) ELSE utm END
    WHERE id = v_referral_id;
  END IF;

  RETURN v_referral_id;
END;
$$;

GRANT EXECUTE ON FUNCTION record_affiliate_referral(TEXT, TEXT, UUID, UUID, TEXT, TEXT, JSONB)
  TO anon, authenticated;

-- =========================================================================
-- Sync paying status from enterprise_accounts
-- Marks a referral as 'paying' once the referred account becomes active+MRR>0,
-- and stamps first_payment_at if missing. Returns count of rows transitioned.
-- =========================================================================

CREATE OR REPLACE FUNCTION sync_affiliate_referral_paying_status()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Begin paying
  WITH updated AS (
    UPDATE affiliate_referrals r
    SET status = 'paying',
        first_payment_at = COALESCE(r.first_payment_at, NOW())
    FROM enterprise_accounts a
    WHERE r.referred_account_id = a.id
      AND r.status IN ('signed_up', 'cookie')
      AND a.status = 'active'
      AND COALESCE(a.mrr, 0) > 0
    RETURNING r.id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  -- Mark churn
  UPDATE affiliate_referrals r
  SET status = 'churned',
      churned_at = COALESCE(r.churned_at, NOW())
  FROM enterprise_accounts a
  WHERE r.referred_account_id = a.id
    AND r.status = 'paying'
    AND (a.status <> 'active' OR COALESCE(a.mrr, 0) = 0);

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION sync_affiliate_referral_paying_status() TO authenticated;

-- =========================================================================
-- Accrue commissions for a billing period (default = previous calendar month)
-- For each (affiliate, period), sums commission across paying referrals
-- still inside their commission_window_months from first_payment_at.
-- Idempotent via UNIQUE (affiliate_id, period_start, period_end).
-- =========================================================================

CREATE OR REPLACE FUNCTION accrue_affiliate_payouts(
  p_period_start DATE DEFAULT NULL,
  p_period_end DATE DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_due_date DATE;
  v_inserted INTEGER := 0;
BEGIN
  v_period_start := COALESCE(
    p_period_start,
    (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE
  );
  v_period_end := COALESCE(
    p_period_end,
    (DATE_TRUNC('month', v_period_start) + INTERVAL '1 month - 1 day')::DATE
  );
  v_due_date := v_period_end + INTERVAL '30 days';

  WITH eligible AS (
    SELECT
      a.id AS affiliate_id,
      a.commission_rate,
      a.commission_window_months,
      r.id AS referral_id,
      r.referred_account_id,
      r.referred_account_name,
      r.first_payment_at,
      ea.mrr,
      ROUND(COALESCE(ea.mrr, 0) * a.commission_rate, 2) AS line_amount
    FROM affiliates a
    JOIN affiliate_referrals r ON r.affiliate_id = a.id
    LEFT JOIN enterprise_accounts ea ON ea.id = r.referred_account_id
    WHERE r.status = 'paying'
      AND r.first_payment_at IS NOT NULL
      AND r.first_payment_at::DATE <= v_period_end
      AND (
        a.commission_window_months IS NULL
        OR a.commission_window_months <= 0
        OR r.first_payment_at + (a.commission_window_months || ' months')::INTERVAL >= v_period_start
      )
      AND COALESCE(ea.mrr, 0) > 0
  ),
  grouped AS (
    SELECT
      affiliate_id,
      SUM(line_amount) AS total_amount,
      jsonb_agg(jsonb_build_object(
        'referral_id', referral_id,
        'account_id', referred_account_id,
        'account_name', referred_account_name,
        'mrr', mrr,
        'rate', commission_rate,
        'amount', line_amount
      )) AS breakdown
    FROM eligible
    GROUP BY affiliate_id
  ),
  inserted AS (
    INSERT INTO affiliate_payouts (
      affiliate_id, period_start, period_end, amount_due,
      due_date, status, breakdown
    )
    SELECT
      affiliate_id, v_period_start, v_period_end, total_amount,
      v_due_date, 'accrued', breakdown
    FROM grouped
    WHERE total_amount > 0
    ON CONFLICT (affiliate_id, period_start, period_end)
    DO UPDATE SET
      amount_due = EXCLUDED.amount_due,
      breakdown = EXCLUDED.breakdown,
      updated_at = NOW()
    WHERE affiliate_payouts.status = 'accrued'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_inserted FROM inserted;

  RETURN v_inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION accrue_affiliate_payouts(DATE, DATE) TO authenticated;

-- =========================================================================
-- RLS — keep simple, mirrors super_admin pattern: authenticated can read/write
-- =========================================================================

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read affiliates" ON affiliates;
CREATE POLICY "Authenticated read affiliates" ON affiliates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write affiliates" ON affiliates;
CREATE POLICY "Authenticated write affiliates" ON affiliates
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read referrals" ON affiliate_referrals;
CREATE POLICY "Authenticated read referrals" ON affiliate_referrals
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write referrals" ON affiliate_referrals;
CREATE POLICY "Authenticated write referrals" ON affiliate_referrals
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read payouts" ON affiliate_payouts;
CREATE POLICY "Authenticated read payouts" ON affiliate_payouts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write payouts" ON affiliate_payouts;
CREATE POLICY "Authenticated write payouts" ON affiliate_payouts
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
