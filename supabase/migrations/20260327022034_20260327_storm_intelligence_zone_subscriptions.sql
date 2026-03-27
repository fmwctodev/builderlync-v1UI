/*
  # Storm Intelligence Zone Subscriptions

  ## Summary
  Creates the zone_alert_subscriptions table to support the NWS zone-based alerting system.
  Users can subscribe to specific NWS UGC zone codes (e.g., TXZ001) and receive notifications
  when hail-related storm alerts are issued for those zones.

  ## New Tables
  - `zone_alert_subscriptions`
    - `id` (uuid, primary key)
    - `organization_id` (uuid) - tenant scoping
    - `user_id` (uuid, foreign key to auth.users)
    - `zone_code` (text) - NWS UGC zone code e.g. "TXZ001" or "TXC453"
    - `zone_name` (text) - Human-readable zone name
    - `state_code` (text) - Two-letter state code e.g. "TX"
    - `zone_type` (text) - "Z" for forecast zone, "C" for county
    - `min_severity` (text) - Minimum alert severity: "Extreme"|"Severe"|"Moderate"|"Minor"
    - `event_types` (text[]) - Alert event types to watch
    - `notify_email` (boolean)
    - `notify_push` (boolean)
    - `is_active` (boolean)
    - `last_notified_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only manage their own subscriptions within their org
*/

CREATE TABLE IF NOT EXISTS zone_alert_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_code text NOT NULL,
  zone_name text NOT NULL DEFAULT '',
  state_code text NOT NULL,
  zone_type text NOT NULL DEFAULT 'Z',
  min_severity text NOT NULL DEFAULT 'Severe',
  event_types text[] NOT NULL DEFAULT ARRAY['Severe Thunderstorm Warning', 'Tornado Warning'],
  notify_email boolean NOT NULL DEFAULT false,
  notify_push boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  last_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zone_alert_subscriptions_org ON zone_alert_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_zone_alert_subscriptions_user ON zone_alert_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_zone_alert_subscriptions_zone ON zone_alert_subscriptions(zone_code);
CREATE INDEX IF NOT EXISTS idx_zone_alert_subscriptions_state ON zone_alert_subscriptions(state_code);

ALTER TABLE zone_alert_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON zone_alert_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON zone_alert_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON zone_alert_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON zone_alert_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
