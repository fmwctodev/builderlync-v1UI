/*
  Platform Analytics Data Schema
  
  This SQL file creates the platform_analytics_data table for storing
  marketing analytics data from various platforms.
  
  Run this in your Supabase SQL Editor to create the table.
*/

-- Create platform_analytics_data table
CREATE TABLE IF NOT EXISTS platform_analytics_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('google_analytics', 'meta', 'google_ads', 'tiktok', 'google_business')),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_label text,
  date date NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE platform_analytics_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_analytics_data

-- Users can view their own analytics data
CREATE POLICY "Users can view own analytics data"
  ON platform_analytics_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own analytics data
CREATE POLICY "Users can insert own analytics data"
  ON platform_analytics_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own analytics data
CREATE POLICY "Users can update own analytics data"
  ON platform_analytics_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analytics data
CREATE POLICY "Users can delete own analytics data"
  ON platform_analytics_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON platform_analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON platform_analytics_data(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON platform_analytics_data(date);
CREATE INDEX IF NOT EXISTS idx_analytics_user_platform_date ON platform_analytics_data(user_id, platform, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_analytics_updated_at_trigger ON platform_analytics_data;
CREATE TRIGGER update_analytics_updated_at_trigger
  BEFORE UPDATE ON platform_analytics_data
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();
