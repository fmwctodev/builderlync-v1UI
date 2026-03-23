/*
  # Create User Dashboard Preferences Table

  This migration creates the user_dashboard_preferences table to store
  user-specific dashboard widget preferences (visibility, position, etc).

  ## Tables Created
  
  1. **user_dashboard_preferences**
     - Stores which widgets each user wants to see
     - Tracks widget positioning and visibility
     - Links to users and dashboard_widgets

  ## Security
  - Enable RLS on user_dashboard_preferences table
  - Users can only access their own preferences
*/

-- Create user_dashboard_preferences table
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_key text NOT NULL,
  is_visible boolean DEFAULT true,
  position integer DEFAULT 0,
  custom_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, widget_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user ON user_dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_widget ON user_dashboard_preferences(widget_key);

-- Enable RLS
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences"
  ON user_dashboard_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own preferences"
  ON user_dashboard_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON user_dashboard_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own preferences"
  ON user_dashboard_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());