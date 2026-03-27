/*
  # Storm Alert Notifications Log and Settings Extensions

  ## Summary
  Creates infrastructure for multi-channel storm alert notifications (browser, email, in-app)
  and extends existing settings tables with notification defaults and gridpoint metadata caching.

  ## New Tables
  1. `storm_alert_notifications`
    - `id` (uuid, primary key) - Unique notification record
    - `organization_id` (uuid) - Tenant scoping
    - `user_id` (uuid, FK to auth.users) - Recipient
    - `zone_subscription_id` (uuid, FK to zone_alert_subscriptions, nullable) - Source subscription
    - `nws_alert_id` (text) - NWS alert identifier for dedup
    - `channel` (text) - Delivery channel: browser, email, in_app
    - `status` (text) - Delivery status: pending, sent, failed
    - `error_message` (text, nullable) - Error details on failure
    - `sent_at` (timestamptz, nullable) - When notification was delivered
    - `created_at` (timestamptz) - Record creation time

  ## Modified Tables
  2. `canvass_org_settings` - Two new notification default columns
    - `notify_browser_default` (boolean, default true) - Default browser notification preference
    - `notify_email_default` (boolean, default false) - Default email notification preference

  3. `storm_events` - Four new gridpoint metadata cache columns
    - `wfo` (text) - Weather Forecast Office code
    - `grid_x` (integer) - NWS gridpoint X coordinate
    - `grid_y` (integer) - NWS gridpoint Y coordinate
    - `forecast_zone` (text) - UGC forecast zone code

  ## Security
  - RLS enabled on storm_alert_notifications
  - Separate policies for SELECT, INSERT, UPDATE, DELETE
  - All scoped to authenticated user via auth.uid()

  ## Notes
  - Unique constraint on (user_id, nws_alert_id, channel) prevents duplicate notifications
  - All new columns use safe defaults so existing rows are unaffected
*/

CREATE TABLE IF NOT EXISTS storm_alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_subscription_id uuid REFERENCES zone_alert_subscriptions(id) ON DELETE SET NULL,
  nws_alert_id text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('browser', 'email', 'in_app')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_storm_alert_notif_dedup
  ON storm_alert_notifications(user_id, nws_alert_id, channel);
CREATE INDEX IF NOT EXISTS idx_storm_alert_notif_org
  ON storm_alert_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_storm_alert_notif_user
  ON storm_alert_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_storm_alert_notif_zone_sub
  ON storm_alert_notifications(zone_subscription_id);

ALTER TABLE storm_alert_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert notifications"
  ON storm_alert_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert notifications"
  ON storm_alert_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert notifications"
  ON storm_alert_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert notifications"
  ON storm_alert_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'notify_browser_default'
  ) THEN
    ALTER TABLE canvass_org_settings
      ADD COLUMN notify_browser_default boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'canvass_org_settings' AND column_name = 'notify_email_default'
  ) THEN
    ALTER TABLE canvass_org_settings
      ADD COLUMN notify_email_default boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storm_events' AND column_name = 'wfo'
  ) THEN
    ALTER TABLE storm_events ADD COLUMN wfo text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storm_events' AND column_name = 'grid_x'
  ) THEN
    ALTER TABLE storm_events ADD COLUMN grid_x integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storm_events' AND column_name = 'grid_y'
  ) THEN
    ALTER TABLE storm_events ADD COLUMN grid_y integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storm_events' AND column_name = 'forecast_zone'
  ) THEN
    ALTER TABLE storm_events ADD COLUMN forecast_zone text;
  END IF;
END $$;
