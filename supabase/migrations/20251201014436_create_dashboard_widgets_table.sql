/*
  # Create Dashboard Widgets Table

  This migration creates the missing dashboard_widgets table that was referenced
  but never created in the original migrations.

  ## Tables Created
  
  1. **dashboard_widgets**
     - Stores customizable dashboard widgets for user dashboards
     - Allows users to configure which metrics they see
     - Supports widget positioning and settings

  ## Security
  - Enable RLS on dashboard_widgets table
  - Users can only access widgets for their organization
*/

-- Create dashboard_widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_key text NOT NULL,
  metric_id text,
  title text NOT NULL,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 1,
  height integer DEFAULT 1,
  settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_organization ON dashboard_widgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_metric ON dashboard_widgets(metric_id);

-- Enable RLS
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view widgets in their organization"
  ON dashboard_widgets FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create widgets in their organization"
  ON dashboard_widgets FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own widgets"
  ON dashboard_widgets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own widgets"
  ON dashboard_widgets FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());