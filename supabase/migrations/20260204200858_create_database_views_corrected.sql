/*
  # Create Database Views (Corrected)

  This migration creates helpful views for the application.

  ## Views Created:
    - `stripe_user_subscriptions` - User subscription details with Stripe info
    - `stripe_user_orders` - User order history with Stripe details
    - `contact_summary` - Contact overview with related counts
    - `opportunity_summary` - Opportunity details with stage info
    - `organization_summary` - Organization overview with member counts
    - `dashboard_metrics` - Pre-computed dashboard metrics
    - `canvassing_performance` - Storm canvassing metrics
    - `review_metrics` - Review performance metrics

  ## Security
    - Views respect underlying table RLS policies
*/

-- ============================================================================
-- STRIPE USER SUBSCRIPTIONS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT 
  ss.id,
  sc.organization_id,
  ss.stripe_subscription_id,
  ss.status,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at,
  ss.canceled_at,
  ss.trial_start,
  ss.trial_end,
  ss.quantity,
  ss.metadata,
  ss.created_at,
  ss.updated_at,
  o.name as organization_name,
  pd.name as plan_name,
  pd.display_name as plan_display_name,
  pd.price_monthly,
  pd.price_yearly
FROM stripe_subscriptions ss
JOIN stripe_customers sc ON sc.id = ss.customer_id
JOIN organizations o ON o.id = sc.organization_id
LEFT JOIN plan_definitions pd ON pd.stripe_monthly_price_id = ss.stripe_price_id 
  OR pd.stripe_yearly_price_id = ss.stripe_price_id;

-- ============================================================================
-- STRIPE USER ORDERS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT 
  so.id,
  sc.organization_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.status,
  so.amount_total,
  so.currency,
  so.line_items,
  so.metadata,
  so.created_at,
  o.name as organization_name
FROM stripe_orders so
JOIN stripe_customers sc ON sc.id = so.customer_id
JOIN organizations o ON o.id = sc.organization_id;

-- ============================================================================
-- CONTACT SUMMARY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW contact_summary AS
SELECT 
  c.id,
  c.organization_id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.status,
  c.source,
  c.created_at,
  c.updated_at,
  COALESCE(opp_counts.opportunity_count, 0) as opportunity_count,
  COALESCE(opp_counts.total_value, 0) as total_opportunity_value,
  COALESCE(job_counts.job_count, 0) as job_count,
  COALESCE(task_counts.open_task_count, 0) as open_task_count,
  last_activity.last_activity_at
FROM contacts c
LEFT JOIN (
  SELECT 
    contact_id, 
    COUNT(*) as opportunity_count,
    SUM(COALESCE(value, 0)) as total_value
  FROM opportunities
  GROUP BY contact_id
) opp_counts ON opp_counts.contact_id = c.id
LEFT JOIN (
  SELECT 
    contact_id, 
    COUNT(*) as job_count
  FROM jobs
  GROUP BY contact_id
) job_counts ON job_counts.contact_id = c.id
LEFT JOIN (
  SELECT 
    contact_id, 
    COUNT(*) as open_task_count
  FROM tasks
  WHERE status IN ('pending', 'in_progress')
  GROUP BY contact_id
) task_counts ON task_counts.contact_id = c.id
LEFT JOIN (
  SELECT 
    contact_id,
    MAX(created_at) as last_activity_at
  FROM activities
  GROUP BY contact_id
) last_activity ON last_activity.contact_id = c.id;

-- ============================================================================
-- OPPORTUNITY SUMMARY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW opportunity_summary AS
SELECT 
  o.id,
  o.organization_id,
  o.name,
  o.value,
  o.status,
  o.expected_close_date,
  o.probability,
  o.created_at,
  o.updated_at,
  c.first_name as contact_first_name,
  c.last_name as contact_last_name,
  c.email as contact_email,
  ps.name as stage_name,
  ps.color as stage_color,
  ps.probability as stage_probability,
  p.name as pipeline_name
FROM opportunities o
LEFT JOIN contacts c ON c.id = o.contact_id
LEFT JOIN pipeline_stages ps ON ps.id = o.stage_id
LEFT JOIN pipelines p ON p.id = o.pipeline_id;

-- ============================================================================
-- ORGANIZATION SUMMARY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW organization_summary AS
SELECT 
  o.id,
  o.name,
  o.subscription_tier,
  o.subscription_status,
  o.created_at,
  o.updated_at,
  COALESCE(member_counts.member_count, 0) as member_count,
  COALESCE(contact_counts.contact_count, 0) as contact_count,
  COALESCE(opportunity_counts.opportunity_count, 0) as opportunity_count,
  COALESCE(opportunity_counts.pipeline_value, 0) as pipeline_value,
  COALESCE(job_counts.job_count, 0) as job_count,
  COALESCE(job_counts.active_jobs, 0) as active_job_count
FROM organizations o
LEFT JOIN (
  SELECT 
    organization_id, 
    COUNT(*) as member_count
  FROM organization_members
  WHERE is_active = true
  GROUP BY organization_id
) member_counts ON member_counts.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id, 
    COUNT(*) as contact_count
  FROM contacts
  GROUP BY organization_id
) contact_counts ON contact_counts.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id, 
    COUNT(*) as opportunity_count,
    SUM(COALESCE(value, 0)) as pipeline_value
  FROM opportunities
  WHERE status = 'open'
  GROUP BY organization_id
) opportunity_counts ON opportunity_counts.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id, 
    COUNT(*) as job_count,
    COUNT(*) FILTER (WHERE status IN ('in_progress', 'scheduled')) as active_jobs
  FROM jobs
  GROUP BY organization_id
) job_counts ON job_counts.organization_id = o.id;

-- ============================================================================
-- DASHBOARD METRICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  COALESCE(contact_stats.total_contacts, 0) as total_contacts,
  COALESCE(contact_stats.new_contacts_this_month, 0) as new_contacts_this_month,
  COALESCE(opp_stats.open_opportunities, 0) as open_opportunities,
  COALESCE(opp_stats.pipeline_value, 0) as pipeline_value,
  COALESCE(opp_stats.won_this_month, 0) as opportunities_won_this_month,
  COALESCE(opp_stats.won_value_this_month, 0) as revenue_won_this_month,
  COALESCE(job_stats.active_jobs, 0) as active_jobs,
  COALESCE(job_stats.completed_this_month, 0) as jobs_completed_this_month,
  COALESCE(invoice_stats.invoiced_this_month, 0) as invoiced_this_month,
  COALESCE(invoice_stats.collected_this_month, 0) as collected_this_month,
  COALESCE(task_stats.overdue_tasks, 0) as overdue_tasks,
  COALESCE(appt_stats.upcoming_appointments, 0) as upcoming_appointments
FROM organizations o
LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) as total_contacts,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) as new_contacts_this_month
  FROM contacts
  GROUP BY organization_id
) contact_stats ON contact_stats.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) FILTER (WHERE status = 'open') as open_opportunities,
    SUM(COALESCE(value, 0)) FILTER (WHERE status = 'open') as pipeline_value,
    COUNT(*) FILTER (WHERE status = 'won' AND updated_at >= date_trunc('month', now())) as won_this_month,
    SUM(COALESCE(value, 0)) FILTER (WHERE status = 'won' AND updated_at >= date_trunc('month', now())) as won_value_this_month
  FROM opportunities
  GROUP BY organization_id
) opp_stats ON opp_stats.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) FILTER (WHERE status IN ('in_progress', 'scheduled')) as active_jobs,
    COUNT(*) FILTER (WHERE status = 'completed' AND updated_at >= date_trunc('month', now())) as completed_this_month
  FROM jobs
  GROUP BY organization_id
) job_stats ON job_stats.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id,
    SUM(COALESCE(total, 0)) FILTER (WHERE created_at >= date_trunc('month', now())) as invoiced_this_month,
    SUM(COALESCE(paid_amount, 0)) FILTER (WHERE status = 'paid' AND updated_at >= date_trunc('month', now())) as collected_this_month
  FROM invoices
  GROUP BY organization_id
) invoice_stats ON invoice_stats.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) as overdue_tasks
  FROM tasks
  WHERE status IN ('pending', 'in_progress')
    AND due_date < now()
  GROUP BY organization_id
) task_stats ON task_stats.organization_id = o.id
LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) as upcoming_appointments
  FROM appointments
  WHERE start_time > now()
    AND start_time < now() + interval '7 days'
    AND status != 'cancelled'
  GROUP BY organization_id
) appt_stats ON appt_stats.organization_id = o.id;

-- ============================================================================
-- CANVASSING PERFORMANCE VIEW
-- ============================================================================

CREATE OR REPLACE VIEW canvassing_performance AS
SELECT 
  ct.organization_id,
  ct.id as turf_id,
  ct.name as turf_name,
  ct.status as turf_status,
  se.name as storm_event_name,
  se.event_date as storm_date,
  COALESCE(door_stats.total_doors, 0) as total_doors,
  COALESCE(door_stats.visited_doors, 0) as visited_doors,
  COALESCE(door_stats.interested_doors, 0) as interested_doors,
  COALESCE(door_stats.appointments_set, 0) as appointments_set,
  COALESCE(lead_stats.total_leads, 0) as total_leads,
  COALESCE(lead_stats.converted_leads, 0) as converted_leads,
  CASE WHEN COALESCE(door_stats.total_doors, 0) > 0 
    THEN (COALESCE(door_stats.visited_doors, 0)::float / door_stats.total_doors * 100)::numeric(5,2)
    ELSE 0 
  END as visit_rate,
  CASE WHEN COALESCE(door_stats.visited_doors, 0) > 0 
    THEN (COALESCE(lead_stats.total_leads, 0)::float / door_stats.visited_doors * 100)::numeric(5,2)
    ELSE 0 
  END as conversion_rate
FROM canvass_turfs ct
LEFT JOIN storm_events se ON se.id = ct.storm_event_id
LEFT JOIN (
  SELECT 
    turf_id,
    COUNT(*) as total_doors,
    COUNT(*) FILTER (WHERE status != 'not_visited') as visited_doors,
    COUNT(*) FILTER (WHERE status = 'interested') as interested_doors,
    COUNT(*) FILTER (WHERE status = 'appointment_set') as appointments_set
  FROM canvass_doors
  GROUP BY turf_id
) door_stats ON door_stats.turf_id = ct.id
LEFT JOIN (
  SELECT 
    turf_id,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'converted') as converted_leads
  FROM canvass_leads
  GROUP BY turf_id
) lead_stats ON lead_stats.turf_id = ct.id;

-- ============================================================================
-- REVIEW METRICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW review_metrics AS
SELECT 
  organization_id,
  COUNT(*) as total_reviews,
  AVG(rating)::numeric(3,2) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
  COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
  COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
  COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
  COUNT(*) FILTER (WHERE rating = 1) as one_star_count,
  COUNT(*) FILTER (WHERE response_text IS NOT NULL) as responded_count,
  COUNT(*) FILTER (WHERE published_at >= date_trunc('month', now())) as reviews_this_month,
  AVG(rating) FILTER (WHERE published_at >= date_trunc('month', now()))::numeric(3,2) as avg_rating_this_month
FROM reviews
GROUP BY organization_id;
