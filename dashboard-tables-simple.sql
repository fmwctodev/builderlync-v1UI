-- Minimal Dashboard Tables (No RLS issues)
-- Run this in Supabase SQL Editor

-- 1. Create tables
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_key text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  default_visible boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  widget_key text NOT NULL,
  is_visible boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS widget_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL,
  widget_key text NOT NULL,
  stat_value jsonb NOT NULL,
  calculated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON user_dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_stats_org ON widget_stats(organization_id);

-- 3. Insert widgets
INSERT INTO dashboard_widgets (widget_key, name, category, is_active, default_visible) VALUES
('jobs-total', 'Total Jobs', 'jobs', true, true),
('jobs-created', 'Jobs Created', 'jobs', true, true),
('jobs-completed', 'Jobs Completed', 'jobs', true, true),
('jobs-in-progress', 'Jobs In Progress', 'jobs', true, false),
('opportunities-total', 'Total Opportunities', 'opportunities', true, true),
('opportunities-new', 'New Opportunities', 'opportunities', true, true),
('opportunities-closed-won', 'Closed Won', 'opportunities', true, true),
('general-total-contacts', 'Total Contacts', 'reporting', true, true),
('general-new-contacts', 'New Contacts', 'reporting', true, true),
('payments-total-collected', 'Total Payments', 'payments', true, true),
('payments-pending', 'Pending Payments', 'payments', true, true),
('payments-overdue', 'Overdue Payments', 'payments', true, true),
('appointments-total', 'Upcoming Appointments', 'appointments', true, true),
('appointments-booked', 'Appointments Booked', 'appointments', true, true),
('today_appointments', 'Today''s Appointments', 'appointments', true, false),
('revenue_total', 'Revenue', 'payments', true, true),
('contacts_total', 'Contacts', 'reporting', true, true),
('jobs_count', 'Jobs', 'jobs', true, true),
('opportunities_pipeline', 'Opportunities', 'opportunities', true, true),
('recent_activity', 'Recent Activity', 'reporting', true, false),
('upcoming_tasks', 'Upcoming Tasks', 'reporting', true, false)
ON CONFLICT (widget_key) DO NOTHING;
