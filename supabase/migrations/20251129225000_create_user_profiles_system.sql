/*
  # Create User Profiles System

  1. New Tables
    - user_profile_data - Extended user profile information
    - user_preferences - User-specific settings

  2. Security
    - Enable RLS for user privacy
*/

CREATE TABLE IF NOT EXISTS user_profile_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  phone text,
  mobile_phone text,
  title text,
  department text,
  bio text,
  timezone text DEFAULT 'America/New_York',
  language text DEFAULT 'en',
  date_format text DEFAULT 'MM/DD/YYYY',
  time_format text DEFAULT '12h',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme text DEFAULT 'system',
  sidebar_collapsed boolean DEFAULT false,
  default_view text DEFAULT 'list',
  items_per_page integer DEFAULT 25,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  notification_sound boolean DEFAULT true,
  notification_frequency text DEFAULT 'realtime',
  digest_frequency text DEFAULT 'daily',
  notify_mentions boolean DEFAULT true,
  notify_assignments boolean DEFAULT true,
  notify_comments boolean DEFAULT true,
  notify_updates boolean DEFAULT false,
  dashboard_layout jsonb DEFAULT '[]'::jsonb,
  quick_filters jsonb DEFAULT '{}'::jsonb,
  saved_searches jsonb DEFAULT '[]'::jsonb,
  keyboard_shortcuts_enabled boolean DEFAULT true,
  accessibility_mode boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_data_user ON user_profile_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

ALTER TABLE user_profile_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile data" ON user_profile_data FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view all profile data" ON user_profile_data FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
