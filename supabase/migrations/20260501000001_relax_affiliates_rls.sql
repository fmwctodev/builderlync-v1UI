/*
  # Relax affiliates RLS to permit anon-key access from the browser

  The super-admin module uses a client-side mock auth (not Supabase auth),
  so the browser hits Supabase as the `anon` role. The original migration
  gated reads/writes on `auth.role() = 'authenticated'`, which never matches.

  This migration drops those policies and replaces them with permissive
  ones (USING true) so the super-admin pages can read/write affiliate data
  using the anon key. Access is gated client-side by the super-admin login.

  Important: this matches the security posture of other super-admin tables
  in this codebase (mock auth + permissive RLS). When proper Supabase auth
  or service-role key access is wired up, tighten these policies.
*/

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- affiliates
DROP POLICY IF EXISTS "Authenticated read affiliates" ON affiliates;
DROP POLICY IF EXISTS "Authenticated write affiliates" ON affiliates;
DROP POLICY IF EXISTS "Allow read affiliates" ON affiliates;
DROP POLICY IF EXISTS "Allow write affiliates" ON affiliates;
CREATE POLICY "Allow read affiliates" ON affiliates
  FOR SELECT USING (true);
CREATE POLICY "Allow write affiliates" ON affiliates
  FOR ALL USING (true) WITH CHECK (true);

-- affiliate_referrals
DROP POLICY IF EXISTS "Authenticated read referrals" ON affiliate_referrals;
DROP POLICY IF EXISTS "Authenticated write referrals" ON affiliate_referrals;
DROP POLICY IF EXISTS "Allow read referrals" ON affiliate_referrals;
DROP POLICY IF EXISTS "Allow write referrals" ON affiliate_referrals;
CREATE POLICY "Allow read referrals" ON affiliate_referrals
  FOR SELECT USING (true);
CREATE POLICY "Allow write referrals" ON affiliate_referrals
  FOR ALL USING (true) WITH CHECK (true);

-- affiliate_payouts
DROP POLICY IF EXISTS "Authenticated read payouts" ON affiliate_payouts;
DROP POLICY IF EXISTS "Authenticated write payouts" ON affiliate_payouts;
DROP POLICY IF EXISTS "Allow read payouts" ON affiliate_payouts;
DROP POLICY IF EXISTS "Allow write payouts" ON affiliate_payouts;
CREATE POLICY "Allow read payouts" ON affiliate_payouts
  FOR SELECT USING (true);
CREATE POLICY "Allow write payouts" ON affiliate_payouts
  FOR ALL USING (true) WITH CHECK (true);

-- Make sure anon/authenticated can call the helper RPCs
GRANT EXECUTE ON FUNCTION sync_affiliate_referral_paying_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION accrue_affiliate_payouts(DATE, DATE) TO anon, authenticated;
