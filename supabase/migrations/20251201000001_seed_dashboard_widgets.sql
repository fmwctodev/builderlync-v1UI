/*
  # Seed Dashboard Widgets

  Populates the dashboard_widgets table with all available widgets from metrics data
*/

-- Insert Jobs widgets
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible) VALUES
('jobs-total', 'jobs-total', 'Total Jobs', 'Total number of jobs in the system', 'jobs', 'Briefcase', true, true),
('jobs-created', 'jobs-created', 'Jobs Created', 'New jobs created in date range', 'jobs', 'Plus', true, true),
('jobs-completed', 'jobs-completed', 'Jobs Completed', 'Successfully completed jobs', 'jobs', 'CheckCircle', true, true),
('jobs-in-progress', 'jobs-in-progress', 'Jobs In Progress', 'Currently active jobs', 'jobs', 'Briefcase', true, false),
('jobs_count', 'jobs-total', 'Jobs', 'Active jobs', 'jobs', 'Briefcase', true, true),
('completed_jobs', 'jobs-completed', 'Completed Jobs', 'This month', 'jobs', 'CheckCircle', true, false),
('active_jobs', 'jobs-in-progress', 'Active Jobs', 'In progress', 'jobs', 'Briefcase', true, false)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  default_visible = EXCLUDED.default_visible,
  updated_at = now();

-- Insert Opportunities widgets
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible) VALUES
('opportunities-total', 'opportunities-total', 'Total Opportunities', 'Total opportunities in pipeline', 'opportunities', 'Target', true, true),
('opportunities-new', 'opportunities-new', 'New Opportunities', 'Newly created opportunities', 'opportunities', 'TrendingUp', true, true),
('opportunities-closed-won', 'opportunities-closed-won', 'Closed Won', 'Successfully closed opportunities', 'opportunities', 'Award', true, true),
('opportunities_pipeline', 'opportunities-total', 'Opportunities', 'Pipeline value', 'opportunities', 'Target', true, true)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  default_visible = EXCLUDED.default_visible,
  updated_at = now();

-- Insert Contacts widgets
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible) VALUES
('general-total-contacts', 'general-total-contacts', 'Total Contacts', 'Total contacts in system', 'reporting', 'Users', true, true),
('general-new-contacts', 'general-new-contacts', 'New Contacts', 'New contacts added', 'reporting', 'UserPlus', true, true),
('contacts_total', 'general-total-contacts', 'Contacts', 'Total contacts', 'reporting', 'Users', true, true)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  default_visible = EXCLUDED.default_visible,
  updated_at = now();

-- Insert Payments widgets
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible) VALUES
('payments-total-collected', 'payments-total-collected', 'Total Payments Collected', 'Total revenue collected', 'payments', 'DollarSign', true, true),
('payments-pending', 'payments-pending', 'Pending Payments', 'Payments pending', 'payments', 'Clock', true, true),
('payments-overdue', 'payments-overdue', 'Overdue Payments', 'Overdue payment amount', 'payments', 'AlertCircle', true, true),
('revenue_total', 'payments-total-collected', 'Revenue', 'This month', 'payments', 'DollarSign', true, true),
('pending_payments', 'payments-pending', 'Pending Payments', 'Awaiting payment', 'payments', 'Clock', true, false)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  default_visible = EXCLUDED.default_visible,
  updated_at = now();

-- Insert Appointments widgets
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible) VALUES
('appointments-total', 'appointments-total', 'Total Appointments', 'Total appointments in date range', 'appointments', 'Calendar', true, true),
('appointments-booked', 'appointments-booked', 'Appointments Booked', 'Newly booked appointments', 'appointments', 'CalendarCheck', true, true),
('today_appointments', 'today_appointments', 'Today''s Appointments', 'Scheduled for today', 'appointments', 'CalendarDays', true, false),
('upcoming_appointments', 'appointments-total', 'Upcoming Appointments', 'Next 7 days', 'appointments', 'Calendar', true, true)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  default_visible = EXCLUDED.default_visible,
  updated_at = now();

-- Insert Special widgets (Activity & Tasks)
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible) VALUES
('recent_activity', 'recent_activity', 'My Recent Activity', 'Your recent actions', 'reporting', 'Activity', true, false),
('upcoming_tasks', 'upcoming_tasks', 'My Upcoming Tasks', 'Tasks assigned to you', 'reporting', 'CheckSquare', true, false)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active,
  default_visible = EXCLUDED.default_visible,
  updated_at = now();
