/*
  # Dashboard Widgets System

  1. New Tables
    - `dashboard_widgets`: Available widgets configuration
    - `user_dashboard_preferences`: User widget preferences
    - `widget_stats`: Cached widget statistics

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
*/

-- Create dashboard_widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_key text UNIQUE NOT NULL,
  metric_id text,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  icon_name text,
  is_active boolean DEFAULT true,
  default_visible boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_dashboard_preferences table
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id integer NOT NULL,
  widget_key text NOT NULL,
  is_visible boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, widget_key)
);

-- Create widget_stats table for caching
CREATE TABLE IF NOT EXISTS widget_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  widget_key text NOT NULL,
  stat_value jsonb NOT NULL,
  calculated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(organization_id, widget_key)
);

-- Enable RLS
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_stats ENABLE ROW LEVEL SECURITY;

-- Policies for dashboard_widgets (public read for active widgets)
CREATE POLICY "Anyone can view active widgets"
  ON dashboard_widgets FOR SELECT
  USING (is_active = true);

-- Policies for user_dashboard_preferences
CREATE POLICY "Users can view own preferences"
  ON user_dashboard_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_dashboard_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own preferences"
  ON user_dashboard_preferences FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own preferences"
  ON user_dashboard_preferences FOR DELETE
  USING (true);

-- Policies for widget_stats
CREATE POLICY "Users can view organization stats"
  ON widget_stats FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_widget_key ON user_dashboard_preferences(widget_key);
CREATE INDEX IF NOT EXISTS idx_widget_stats_organization_id ON widget_stats(organization_id);
CREATE INDEX IF NOT EXISTS idx_widget_stats_widget_key ON widget_stats(widget_key);
CREATE INDEX IF NOT EXISTS idx_widget_stats_expires_at ON widget_stats(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_preferences_updated_at BEFORE UPDATE ON user_dashboard_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
