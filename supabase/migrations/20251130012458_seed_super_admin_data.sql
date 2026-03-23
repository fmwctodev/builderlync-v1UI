/*
  # Seed Super Admin Data

  Populates the database with realistic mock data for development:
  - 3 super admin users
  - 50 enterprise accounts
  - Account modules and integrations
  - Usage tracking data
  - Feature flags
  - Plan definitions
  - Audit events
  - Billing snapshots
  - Support tickets
  - NPS feedback
*/

-- Insert Super Admin Users (passwords would be hashed in production)
INSERT INTO super_admin_users (email, password_hash, role, name, status) VALUES
  ('owner@builderlync.io', 'password123', 'super_admin', 'Platform Owner', 'active'),
  ('ops@builderlync.io', 'password123', 'operations', 'Operations Manager', 'active'),
  ('admin@builderlync.io', 'password123', 'admin', 'System Admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Plan Definitions
INSERT INTO plan_definitions (name, price_monthly, price_annual, description, included_modules, limits, display_order, active) VALUES
  ('Starter', 99.00, 990.00, 'Perfect for small roofing companies', 
   ARRAY['Jobs', 'Reporting'], 
   '{"sms": 1000, "call_minutes": 500, "ai_minutes": 100, "email": 5000, "storage": 10, "seats": 5}'::jsonb, 
   1, true),
  ('Pro', 299.00, 2990.00, 'For growing businesses', 
   ARRAY['Jobs', 'Claims', 'Marketing', 'Reputation', 'Reporting', 'Integrations'], 
   '{"sms": 5000, "call_minutes": 2000, "ai_minutes": 500, "email": 20000, "storage": 50, "seats": 15}'::jsonb, 
   2, true),
  ('Enterprise', 799.00, 7990.00, 'Full-featured platform', 
   ARRAY['Jobs', 'Claims', 'SierraAI', 'Marketing', 'Sites', 'Reputation', 'Reporting', 'Integrations', 'ABC', 'SRS', 'Beacon'], 
   '{"sms": 20000, "call_minutes": 10000, "ai_minutes": 2000, "email": 100000, "storage": 200, "seats": 50}'::jsonb, 
   3, true)
ON CONFLICT (name) DO NOTHING;

-- Insert Enterprise Accounts (50 accounts with varied data)
INSERT INTO enterprise_accounts (name, owner_name, owner_email, owner_phone, status, plan, billing_cycle, renewal_date, seats_used, seats_limit, mrr, arr, tags, health_score, last_login_at) VALUES
  ('Apex Roofing Solutions', 'John Smith', 'john@apexroofing.com', '555-0101', 'active', 'Enterprise', 'annual', CURRENT_DATE + INTERVAL '120 days', 12, 50, 799.00, 7990.00, ARRAY['VIP', 'High Value'], 95, NOW() - INTERVAL '2 hours'),
  ('Summit Construction', 'Sarah Johnson', 'sarah@summitconstruction.com', '555-0102', 'active', 'Pro', 'monthly', CURRENT_DATE + INTERVAL '25 days', 8, 15, 299.00, 3588.00, ARRAY['Beta'], 88, NOW() - INTERVAL '5 hours'),
  ('Peak Contractors LLC', 'Michael Brown', 'mike@peakcontractors.com', '555-0103', 'trial', 'Pro', 'monthly', CURRENT_DATE + INTERVAL '10 days', 3, 15, 0.00, 0.00, ARRAY['New'], 72, NOW() - INTERVAL '1 day'),
  ('Elite Roofing Services', 'Emily Davis', 'emily@eliteroofing.com', '555-0104', 'active', 'Enterprise', 'monthly', CURRENT_DATE + INTERVAL '15 days', 25, 50, 799.00, 9588.00, ARRAY['High Value'], 92, NOW() - INTERVAL '3 hours'),
  ('Premier Home Improvements', 'David Wilson', 'david@premierhome.com', '555-0105', 'past_due', 'Starter', 'monthly', CURRENT_DATE - INTERVAL '5 days', 4, 5, 99.00, 1188.00, ARRAY['At Risk'], 45, NOW() - INTERVAL '10 days'),
  ('Quality Roofing Co', 'Jennifer Martinez', 'jennifer@qualityroofing.com', '555-0106', 'active', 'Pro', 'annual', CURRENT_DATE + INTERVAL '200 days', 10, 15, 299.00, 2990.00, ARRAY[]::text[], 85, NOW() - INTERVAL '1 hour'),
  ('Professional Contractors Inc', 'Robert Taylor', 'robert@procontractors.com', '555-0107', 'active', 'Starter', 'monthly', CURRENT_DATE + INTERVAL '20 days', 3, 5, 99.00, 1188.00, ARRAY[]::text[], 78, NOW() - INTERVAL '2 days'),
  ('Advanced Roofing Systems', 'Lisa Anderson', 'lisa@advancedroofing.com', '555-0108', 'suspended', 'Pro', 'monthly', CURRENT_DATE - INTERVAL '30 days', 6, 15, 0.00, 0.00, ARRAY['At Risk'], 25, NOW() - INTERVAL '45 days'),
  ('Reliable Home Services', 'James Thomas', 'james@reliablehome.com', '555-0109', 'active', 'Enterprise', 'annual', CURRENT_DATE + INTERVAL '180 days', 18, 50, 799.00, 7990.00, ARRAY['VIP'], 90, NOW() - INTERVAL '6 hours'),
  ('Superior Construction Group', 'Mary Jackson', 'mary@superiorconstruction.com', '555-0110', 'trial', 'Starter', 'monthly', CURRENT_DATE + INTERVAL '14 days', 2, 5, 0.00, 0.00, ARRAY['New'], 65, NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- Generate more accounts (40 additional)
DO $$
DECLARE
  i INT;
  statuses TEXT[] := ARRAY['active', 'active', 'active', 'active', 'trial', 'past_due'];
  plans TEXT[] := ARRAY['Starter', 'Pro', 'Pro', 'Enterprise'];
  cycles TEXT[] := ARRAY['monthly', 'annual'];
BEGIN
  FOR i IN 11..50 LOOP
    INSERT INTO enterprise_accounts (
      name, owner_name, owner_email, status, plan, billing_cycle, 
      renewal_date, seats_used, seats_limit, mrr, arr, health_score, last_login_at
    ) VALUES (
      'Company ' || i,
      'Owner ' || i,
      'owner' || i || '@company' || i || '.com',
      statuses[1 + floor(random() * array_length(statuses, 1))::int],
      plans[1 + floor(random() * array_length(plans, 1))::int],
      cycles[1 + floor(random() * array_length(cycles, 1))::int],
      CURRENT_DATE + (random() * 365)::int,
      1 + floor(random() * 20)::int,
      CASE 
        WHEN plans[1 + floor(random() * array_length(plans, 1))::int] = 'Starter' THEN 5
        WHEN plans[1 + floor(random() * array_length(plans, 1))::int] = 'Pro' THEN 15
        ELSE 50
      END,
      CASE 
        WHEN plans[1 + floor(random() * array_length(plans, 1))::int] = 'Starter' THEN 99.00
        WHEN plans[1 + floor(random() * array_length(plans, 1))::int] = 'Pro' THEN 299.00
        ELSE 799.00
      END,
      CASE 
        WHEN plans[1 + floor(random() * array_length(plans, 1))::int] = 'Starter' THEN 1188.00
        WHEN plans[1 + floor(random() * array_length(plans, 1))::int] = 'Pro' THEN 3588.00
        ELSE 9588.00
      END,
      50 + floor(random() * 50)::int,
      NOW() - (random() * 30 || ' days')::interval
    );
  END LOOP;
END $$;

-- Insert Account Modules for each account
INSERT INTO account_modules (account_id, module_name, enabled, enabled_at)
SELECT 
  ea.id,
  unnest(ARRAY['Jobs', 'Claims', 'SierraAI', 'Marketing', 'Sites', 'Reputation', 'Reporting', 'Integrations', 'ABC', 'SRS', 'Beacon']) as module_name,
  CASE 
    WHEN ea.plan = 'Enterprise' THEN random() > 0.2
    WHEN ea.plan = 'Pro' THEN random() > 0.4
    ELSE random() > 0.7
  END as enabled,
  CASE WHEN random() > 0.5 THEN NOW() - (random() * 90 || ' days')::interval ELSE NULL END
FROM enterprise_accounts ea
ON CONFLICT (account_id, module_name) DO NOTHING;

-- Insert Account Integrations
INSERT INTO account_integrations (account_id, provider, connected, status, last_sync_at, connected_at)
SELECT 
  ea.id,
  unnest(ARRAY['Twilio', 'QuickBooks', 'EagleView', 'ABC', 'SRS', 'Beacon', 'Google', 'Microsoft']) as provider,
  random() > 0.3 as connected,
  CASE 
    WHEN random() > 0.9 THEN 'error'
    WHEN random() > 0.8 THEN 'warning'
    ELSE 'healthy'
  END,
  CASE WHEN random() > 0.3 THEN NOW() - (random() * 24 || ' hours')::interval ELSE NULL END,
  CASE WHEN random() > 0.3 THEN NOW() - (random() * 180 || ' days')::interval ELSE NULL END
FROM enterprise_accounts ea
WHERE ea.status = 'active'
ON CONFLICT (account_id, provider) DO NOTHING;

-- Insert Usage Tracking (last 3 months)
INSERT INTO usage_tracking (account_id, period, sms_count, mms_count, call_minutes, ai_minutes, emails_sent, storage_gb)
SELECT 
  ea.id,
  date_trunc('month', CURRENT_DATE - (i || ' months')::interval)::date,
  floor(random() * 3000)::int,
  floor(random() * 500)::int,
  floor(random() * 1500)::int,
  floor(random() * 300)::int,
  floor(random() * 8000)::int,
  (random() * 50)::decimal(10,2)
FROM enterprise_accounts ea
CROSS JOIN generate_series(0, 2) as i
WHERE ea.status IN ('active', 'past_due')
ON CONFLICT (account_id, period) DO NOTHING;

-- Insert Usage Limits
INSERT INTO usage_limits (account_id, sms_limit, call_limit, ai_limit, email_limit, storage_limit)
SELECT 
  id,
  CASE 
    WHEN plan = 'Starter' THEN 1000
    WHEN plan = 'Pro' THEN 5000
    ELSE 20000
  END,
  CASE 
    WHEN plan = 'Starter' THEN 500
    WHEN plan = 'Pro' THEN 2000
    ELSE 10000
  END,
  CASE 
    WHEN plan = 'Starter' THEN 100
    WHEN plan = 'Pro' THEN 500
    ELSE 2000
  END,
  CASE 
    WHEN plan = 'Starter' THEN 5000
    WHEN plan = 'Pro' THEN 20000
    ELSE 100000
  END,
  CASE 
    WHEN plan = 'Starter' THEN 10.0
    WHEN plan = 'Pro' THEN 50.0
    ELSE 200.0
  END
FROM enterprise_accounts
ON CONFLICT (account_id) DO NOTHING;

-- Insert Feature Flags
INSERT INTO feature_flags (key, name, description, status, rollout_type, rollout_config) VALUES
  ('advanced_ai_features', 'Advanced AI Features', 'Access to advanced AI capabilities including predictive analytics', 'beta', 'beta', '{}'::jsonb),
  ('new_dashboard_layout', 'New Dashboard Layout', 'Redesigned dashboard with enhanced widgets', 'on', 'all', '{}'::jsonb),
  ('multi_currency_support', 'Multi-Currency Support', 'Support for multiple currencies in billing', 'off', 'accounts', '{"accountIds": []}'::jsonb),
  ('api_v2_access', 'API v2 Access', 'Access to new API v2 endpoints', 'beta', 'percentage', '{"percentage": 25}'::jsonb),
  ('beta_reporting_engine', 'Beta Reporting Engine', 'New reporting engine with custom reports', 'beta', 'beta', '{}'::jsonb),
  ('mobile_app_access', 'Mobile App Access', 'Access to native mobile applications', 'on', 'all', '{}'::jsonb),
  ('white_label_branding', 'White Label Branding', 'Custom branding and white-labeling options', 'off', 'accounts', '{"accountIds": []}'::jsonb),
  ('advanced_integrations', 'Advanced Integrations', 'Premium integration features', 'beta', 'accounts', '{"accountIds": []}'::jsonb),
  ('custom_workflows', 'Custom Workflows', 'Build custom automation workflows', 'on', 'all', '{}'::jsonb),
  ('enterprise_sso', 'Enterprise SSO', 'Single sign-on for enterprise accounts', 'beta', 'accounts', '{"accountIds": []}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert Billing Snapshots
INSERT INTO billing_snapshots (account_id, plan, price_monthly, billing_cycle, last_invoice_date, last_invoice_amount, next_billing_date, is_past_due, outstanding_amount)
SELECT 
  id,
  plan,
  mrr,
  billing_cycle,
  CURRENT_DATE - INTERVAL '15 days',
  CASE 
    WHEN billing_cycle = 'annual' THEN arr
    ELSE mrr
  END,
  renewal_date,
  status = 'past_due',
  CASE WHEN status = 'past_due' THEN mrr * (random() * 2 + 1) ELSE 0 END
FROM enterprise_accounts
WHERE status IN ('active', 'past_due')
ON CONFLICT (account_id) DO NOTHING;

-- Insert Integration Health
INSERT INTO integration_health (provider, status, last_check_at, message, affected_accounts) VALUES
  ('Twilio', 'healthy', NOW(), 'All systems operational', 0),
  ('QuickBooks', 'healthy', NOW(), 'All systems operational', 0),
  ('EagleView', 'warning', NOW() - INTERVAL '2 hours', 'Experiencing slight delays in report generation', 3),
  ('ABC', 'healthy', NOW(), 'All systems operational', 0),
  ('SRS', 'healthy', NOW(), 'All systems operational', 0),
  ('Beacon', 'healthy', NOW(), 'All systems operational', 0),
  ('Email', 'healthy', NOW(), 'All systems operational', 0),
  ('AI', 'healthy', NOW(), 'All systems operational', 0)
ON CONFLICT (provider) DO NOTHING;

-- Insert Support Tickets
INSERT INTO support_tickets (ticket_number, account_id, subject, description, priority, status, sla_breached)
SELECT 
  'TKT-' || LPAD(i::text, 6, '0'),
  (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1),
  CASE (i % 5)
    WHEN 0 THEN 'Cannot access dashboard'
    WHEN 1 THEN 'Integration sync failing'
    WHEN 2 THEN 'Billing question about invoice'
    WHEN 3 THEN 'Feature request: export to Excel'
    ELSE 'Need help with setup'
  END,
  'Detailed description of the issue...',
  CASE (i % 4)
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    WHEN 2 THEN 'high'
    ELSE 'urgent'
  END,
  CASE (i % 3)
    WHEN 0 THEN 'open'
    WHEN 1 THEN 'in_progress'
    ELSE 'closed'
  END,
  random() > 0.9
FROM generate_series(1, 50) as i
ON CONFLICT (ticket_number) DO NOTHING;

-- Insert NPS Feedback
INSERT INTO nps_feedback (account_id, score, comment, sentiment, followed_up)
SELECT 
  (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1),
  floor(random() * 11)::int,
  CASE floor(random() * 5)::int
    WHEN 0 THEN 'Great platform, really helps us manage our business!'
    WHEN 1 THEN 'Good features but could use better mobile support.'
    WHEN 2 THEN 'Love the automation features, saves us so much time.'
    WHEN 3 THEN 'Interface is a bit confusing at first but getting better.'
    ELSE 'Excellent customer support, very helpful team.'
  END,
  CASE 
    WHEN floor(random() * 11)::int >= 9 THEN 'positive'
    WHEN floor(random() * 11)::int >= 7 THEN 'neutral'
    ELSE 'negative'
  END,
  random() > 0.5
FROM generate_series(1, 100) as i
ON CONFLICT DO NOTHING;

-- Insert Audit Events
INSERT INTO audit_events (actor_type, actor_name, action, target_type, target_name, metadata)
SELECT 
  CASE (i % 3)
    WHEN 0 THEN 'super_admin'
    WHEN 1 THEN 'account_admin'
    ELSE 'system'
  END,
  CASE (i % 3)
    WHEN 0 THEN 'Platform Owner'
    WHEN 1 THEN 'John Smith'
    ELSE 'System'
  END,
  CASE (i % 6)
    WHEN 0 THEN 'create'
    WHEN 1 THEN 'update'
    WHEN 2 THEN 'delete'
    WHEN 3 THEN 'view'
    WHEN 4 THEN 'login'
    ELSE 'export'
  END,
  CASE (i % 4)
    WHEN 0 THEN 'account'
    WHEN 1 THEN 'user'
    WHEN 2 THEN 'billing'
    ELSE 'feature'
  END,
  'Target ' || i,
  ('{"action": "Sample action", "details": "Event details"}')::jsonb
FROM generate_series(1, 500) as i;