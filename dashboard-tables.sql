-- Dashboard Tables Creation Script
-- Run this in your Supabase SQL Editor or PostgreSQL database

-- 1. Create dashboard_widgets table
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

-- 2. Create user_dashboard_preferences table
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  widget_key text NOT NULL,
  is_visible boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, widget_key)
);

-- 3. Create widget_stats table (for caching)
CREATE TABLE IF NOT EXISTS widget_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  widget_key text NOT NULL,
  stat_value jsonb NOT NULL,
  calculated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(organization_id, widget_key)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_widget_key ON user_dashboard_preferences(widget_key);
CREATE INDEX IF NOT EXISTS idx_widget_stats_organization_id ON widget_stats(organization_id);
CREATE INDEX IF NOT EXISTS idx_widget_stats_widget_key ON widget_stats(widget_key);
CREATE INDEX IF NOT EXISTS idx_widget_stats_expires_at ON widget_stats(expires_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_stats ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- dashboard_widgets: Anyone can view active widgets
CREATE POLICY "Anyone can view active widgets" ON dashboard_widgets
  FOR SELECT USING (is_active = true);

-- user_dashboard_preferences: Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON user_dashboard_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_dashboard_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_dashboard_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_dashboard_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- widget_stats: Users can view their organization's stats (simplified)
CREATE POLICY "Users can view organization stats" ON widget_stats
  FOR SELECT USING (true);

-- 7. Insert initial widget data
INSERT INTO dashboard_widgets (widget_key, name, description, category, icon_name, is_active, default_visible) VALUES
-- Jobs widgets
('jobs-total', 'Total Jobs', 'Total number of jobs', 'jobs', 'Briefcase', true, true),
('jobs-created', 'Jobs Created', 'New jobs this month', 'jobs', 'Plus', true, true),
('jobs-completed', 'Jobs Completed', 'Completed jobs this month', 'jobs', 'CheckCircle', true, true),
('jobs-in-progress', 'Jobs In Progress', 'Currently active jobs', 'jobs', 'Briefcase', true, false),
('jobs_count', 'Jobs', 'Active jobs', 'jobs', 'Briefcase', true, true),
('completed_jobs', 'Completed Jobs', 'This month', 'jobs', 'CheckCircle', true, false),
('active_jobs', 'Active Jobs', 'In progress', 'jobs', 'Briefcase', true, false),

-- Opportunities widgets
('opportunities-total', 'Total Opportunities', 'Pipeline value', 'opportunities', 'Target', true, true),
('opportunities-new', 'New Opportunities', 'This month', 'opportunities', 'TrendingUp', true, true),
('opportunities-closed-won', 'Closed Won', 'This month', 'opportunities', 'Award', true, true),
('opportunities_pipeline', 'Opportunities', 'Pipeline value', 'opportunities', 'Target', true, true),

-- Contacts widgets
('general-total-contacts', 'Total Contacts', 'Total contacts', 'reporting', 'Users', true, true),
('general-new-contacts', 'New Contacts', 'This month', 'reporting', 'UserPlus', true, true),
('contacts_total', 'Contacts', 'Total contacts', 'reporting', 'Users', true, true),

-- Payments widgets
('payments-total-collected', 'Total Payments', 'Revenue collected', 'payments', 'DollarSign', true, true),
('payments-pending', 'Pending Payments', 'Awaiting payment', 'payments', 'Clock', true, true),
('payments-overdue', 'Overdue Payments', 'Overdue amount', 'payments', 'AlertCircle', true, true),
('revenue_total', 'Revenue', 'This month', 'payments', 'DollarSign', true, true),
('pending_payments', 'Pending Payments', 'Awaiting payment', 'payments', 'Clock', true, false),

-- Appointments widgets
('appointments-total', 'Upcoming Appointments', 'Next 7 days', 'appointments', 'Calendar', true, true),
('appointments-booked', 'Appointments Booked', 'This month', 'appointments', 'CalendarCheck', true, true),
('today_appointments', 'Today''s Appointments', 'Scheduled today', 'appointments', 'CalendarDays', true, false),
('upcoming_appointments', 'Upcoming Appointments', 'Next 7 days', 'appointments', 'Calendar', true, true),

-- Special widgets
('recent_activity', 'Recent Activity', 'Your recent actions', 'reporting', 'Activity', true, false),
('upcoming_tasks', 'Upcoming Tasks', 'Tasks assigned to you', 'reporting', 'CheckSquare', true, false)

ON CONFLICT (widget_key) DO NOTHING;

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at
CREATE TRIGGER update_dashboard_widgets_updated_at 
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboard_preferences_updated_at 
  BEFORE UPDATE ON user_dashboard_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! Tables created successfully
