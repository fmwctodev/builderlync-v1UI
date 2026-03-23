/*
  # Sierra Marketing AI — Demo Seed Data + Approval Settings Table

  ## Changes
  - Creates marketing_approval_settings table
  - Seeds all demo data for every tab with consistent UUIDs
  - Demo org UUID: a0000000-0000-0000-0000-000000000001
*/

CREATE TABLE IF NOT EXISTS marketing_approval_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL UNIQUE,
  approval_mode text NOT NULL DEFAULT 'recommend_and_approve',
  budget_guardrails_enabled boolean DEFAULT true,
  daily_cap numeric DEFAULT 500,
  monthly_cap numeric DEFAULT 8000,
  notifications jsonb DEFAULT '{"new_lead":true,"action_queued":true,"pixel_issues":true,"budget_threshold":false,"weekly_summary":true,"anomaly_detection":true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_approval_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_approval_settings' AND policyname = 'Authenticated users can manage approval settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can manage approval settings" ON marketing_approval_settings FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Seed marketing_accounts
INSERT INTO marketing_accounts (id, organization_id, channel, account_name, account_id, status, spend_mtd, leads_mtd, jobs_won, last_sync, pixel_status, issues)
VALUES
  ('aa000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'google_ads', 'Google Ads — BuilderLync Roofing', 'AW-123456789', 'connected', 5400, 138, 14, '2026-03-23T08:15:00Z', 'healthy', '[]'),
  ('aa000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'meta_ads', 'Meta Ads — BuilderLync FB', 'act_987654321', 'connected', 3200, 79, 7, '2026-03-23T08:10:00Z', 'issues', '["Pixel not firing on thank-you page"]'),
  ('aa000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'tiktok_ads', 'TikTok Ads', null, 'disconnected', 0, 0, 0, null, 'missing', '["Not connected"]'),
  ('aa000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'local_services_ads', 'Google Local Services', 'LSA-456', 'connected', 1200, 22, 2, '2026-03-23T07:50:00Z', 'not_applicable', '[]'),
  ('aa000001-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'call_tracking', 'Twilio Call Tracking', 'TW-789', 'connected', 205, 31, 4, '2026-03-23T08:20:00Z', 'not_applicable', '[]'),
  ('aa000001-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'referral', 'Referral', null, 'connected', 0, 18, 3, null, 'not_applicable', '[]')
ON CONFLICT (id) DO NOTHING;

-- Seed marketing_campaigns
INSERT INTO marketing_campaigns (id, organization_id, name, goal, service_type, geography, budget_daily, budget_monthly, offer_type, destination, channels, status, spend, leads, appointments, estimates, jobs_won, revenue, cpl, cpa, close_rate, generated_assets, created_at)
VALUES
  ('cc000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Spring Roof Inspection — Tampa', 'roof_inspections', 'residential_roofing', 'Tampa, FL — 30mi radius', 120, 3600, 'free_inspection', 'landing_page', '["google_ads","meta_ads"]', 'active', 2840, 92, 34, 28, 11, 198000, 30.9, 83.5, 39.3,
    '{"headlines":["Free Roof Inspection — Tampa Homeowners","Storm Damage? Get a Free Roof Check Today","Trusted Tampa Roofing — Book Inspection Now"],"primary_text":["Protect your home before the next storm. Our certified inspectors will assess your roof at no cost."],"descriptions":["Same-day appointments available.","Licensed. Insured. 5-star rated."],"ctas":["Book Free Inspection","Schedule Now","Get My Free Check"],"audience_suggestions":["Homeowners 35-65, Tampa metro","Recent storm activity ZIP codes"],"keyword_suggestions":["free roof inspection tampa","storm damage roof repair"],"negative_keywords":["diy roofing","roofing jobs"],"landing_page_structure":"Headline > Trust badges > Offer stack > Short form > Review snippets > FAQ > CTA","form_fields":["Full Name","Phone","Address","Best time to call"],"followup_automation_draft":"Immediate SMS confirmation > 1hr follow-up call attempt > 24hr email nurture"}',
    '2026-03-01T09:00:00Z'),
  ('cc000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Emergency Tarp — Hail Season', 'emergency_repairs', 'emergency_tarp', 'Greater Tampa Bay', 200, 6000, 'emergency_tarp', 'click_to_call', '["google_ads"]', 'active', 1620, 44, 38, 32, 18, 126000, 36.8, 42.6, 56.3, null, '2026-03-10T14:00:00Z'),
  ('cc000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Zero-Down Financing — Roof Replacement', 'financing_leads', 'residential_roofing', 'Tampa Bay Area', 80, 2400, 'financing', 'landing_page', '["meta_ads"]', 'active', 1840, 61, 21, 14, 5, 88500, 30.2, 87.6, 35.7, null, '2026-03-05T10:00:00Z'),
  ('cc000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Gutter Replacement — Spring Promo', 'estimates_booked', 'gutters', 'Tampa, FL', 40, 1200, 'free_estimate', 'landing_page', '["meta_ads"]', 'paused', 960, 29, 11, 8, 2, 14400, 33.1, 87.3, 25.0, null, '2026-02-15T09:00:00Z'),
  ('cc000001-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Stale Estimate Reactivation', 'estimates_booked', 'residential_roofing', 'All service areas', 20, 600, 'custom', 'embedded_form', '["email","sms"]', 'draft', 0, 0, 0, 0, 0, 0, 0, 0, 0, null, '2026-03-22T16:00:00Z'),
  ('cc000001-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Insurance Claim Assistance', 'roof_inspections', 'residential_roofing', 'Storm-affected ZIP codes', 150, 4500, 'insurance_help', 'landing_page', '["google_ads","local_services_ads"]', 'active', 2100, 56, 28, 19, 9, 162000, 37.5, 75.0, 47.4, null, '2026-03-12T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed marketing_attribution_records
INSERT INTO marketing_attribution_records (id, organization_id, contact_name, channel, campaign_id, campaign_name, ad_group, keyword, landing_page, utm_source, utm_medium, utm_campaign, first_touch, last_touch, assigned_rep, appointment_status, estimate_status, proposal_status, job_status, revenue_value, service_type, city, zip, is_repeat_customer, created_at)
VALUES
  ('bb000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Robert Harmon', 'google_ads', 'cc000001-0000-0000-0000-000000000001'::uuid, 'Spring Roof Inspection — Tampa', 'Free Inspection', 'free roof inspection tampa', '/free-inspection', 'google', 'cpc', 'spring-inspection-tampa', '2026-03-05T10:22:00Z', '2026-03-05T10:22:00Z', 'Mike Torres', 'completed', 'accepted', 'accepted', 'won', 18500, 'residential_roofing', 'Tampa', '33602', false, '2026-03-05T10:22:00Z'),
  ('bb000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Angela Russo', 'meta_ads', 'cc000001-0000-0000-0000-000000000003'::uuid, 'Zero-Down Financing', null, null, '/financing-offer', 'facebook', 'paid', 'financing-roof', '2026-03-08T14:05:00Z', '2026-03-10T09:30:00Z', 'Sarah Kimball', 'completed', 'sent', 'none', 'none', 0, 'residential_roofing', 'Brandon', '33511', false, '2026-03-08T14:05:00Z'),
  ('bb000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Derek Okonkwo', 'google_ads', 'cc000001-0000-0000-0000-000000000002'::uuid, 'Emergency Tarp — Hail Season', null, 'emergency roof tarp', null, null, null, null, '2026-03-14T08:45:00Z', '2026-03-14T08:45:00Z', 'Mike Torres', 'completed', 'accepted', 'accepted', 'won', 7200, 'emergency_tarp', 'St. Petersburg', '33701', false, '2026-03-14T08:45:00Z'),
  ('bb000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Linda Marsh', 'referral', null, null, null, null, null, null, null, null, '2026-03-11T11:20:00Z', '2026-03-11T11:20:00Z', 'Sarah Kimball', 'scheduled', 'none', 'none', 'none', 0, 'residential_roofing', 'Clearwater', '33755', true, '2026-03-11T11:20:00Z'),
  ('bb000001-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'James Carver', 'local_services_ads', 'cc000001-0000-0000-0000-000000000006'::uuid, 'Insurance Claim Assistance', null, null, null, null, null, null, '2026-03-16T09:00:00Z', '2026-03-16T09:00:00Z', 'Tom Fletcher', 'completed', 'accepted', 'accepted', 'won', 22000, 'residential_roofing', 'Tampa', '33629', false, '2026-03-16T09:00:00Z'),
  ('bb000001-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Patricia Nguyen', 'google_ads', 'cc000001-0000-0000-0000-000000000001'::uuid, 'Spring Roof Inspection — Tampa', null, null, '/free-inspection', 'google', 'cpc', 'spring-inspection-tampa', '2026-03-18T13:15:00Z', '2026-03-18T13:15:00Z', 'Mike Torres', 'no_show', 'none', 'none', 'none', 0, 'residential_roofing', 'Tampa', '33605', false, '2026-03-18T13:15:00Z'),
  ('bb000001-0000-0000-0000-000000000007'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Brian Solis', 'meta_ads', 'cc000001-0000-0000-0000-000000000003'::uuid, 'Zero-Down Financing', null, null, null, null, null, null, '2026-03-20T16:40:00Z', '2026-03-20T16:40:00Z', 'Sarah Kimball', 'scheduled', 'none', 'none', 'none', 0, 'residential_roofing', 'Riverview', '33578', false, '2026-03-20T16:40:00Z'),
  ('bb000001-0000-0000-0000-000000000008'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Monica Bell', 'google_ads', 'cc000001-0000-0000-0000-000000000006'::uuid, 'Insurance Claim Assistance', null, null, null, null, null, null, '2026-03-19T10:00:00Z', '2026-03-21T14:00:00Z', 'Tom Fletcher', 'completed', 'rejected', 'none', 'lost', 0, 'residential_roofing', 'Plant City', '33563', false, '2026-03-19T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed sierra_marketing_recommendations
INSERT INTO sierra_marketing_recommendations (id, organization_id, type, title, rationale, expected_impact, confidence_score, linked_entities, status, created_at)
VALUES
  ('dd000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'budget_shift', 'Shift 18% of Meta budget to Google Search', 'Google Search leads closed at 39% this week vs Meta at 24%. Your CPL on Google is $30.90 vs $40.20 on Meta. Shifting $580/mo would generate an estimated 4 additional closed jobs.', '+4 jobs/month, +$72,000 revenue at avg job value', 87, '[{"type":"channel","id":"aa000001-0000-0000-0000-000000000001","label":"Google Ads"},{"type":"channel","id":"aa000001-0000-0000-0000-000000000002","label":"Meta Ads"}]', 'active', '2026-03-23T06:00:00Z'),
  ('dd000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'storm_response', 'Storm activity detected in 3 ZIP codes — launch emergency campaign', 'NOAA data shows hail activity in 33605, 33611, and 33629 on 3/21. Historical data shows a 3-5 day window for maximum response rate. Suggest activating Emergency Tarp campaign with ZIP targeting.', 'Est. 18-25 emergency leads at $38 CPL based on past storm campaigns', 92, '[{"type":"campaign","id":"cc000001-0000-0000-0000-000000000002","label":"Emergency Tarp — Hail Season"}]', 'active', '2026-03-23T07:15:00Z'),
  ('dd000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'stale_estimate', '14 estimates sent 14+ days ago with no follow-up', 'These contacts received estimates but have not responded. Average value: $16,400. Sierra can launch a reactivation SMS+email sequence targeting these contacts with a limited-time offer.', 'Historically 22% reactivation rate = ~3 closed jobs, ~$49,200 revenue', 78, '[]', 'active', '2026-03-22T18:00:00Z'),
  ('dd000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'funnel_fix', 'Free Inspection landing page conversion dropped 21%', 'The /free-inspection landing page dropped from 8.4% to 6.6% conversion over the past 7 days. Mobile form analysis shows excessive field count and no autofill. Recommend removing 2 optional fields.', '+12 leads/month at no additional spend', 83, '[{"type":"funnel","id":"ff000001-0000-0000-0000-000000000001","label":"Free Inspection Funnel"}]', 'active', '2026-03-22T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed sierra_marketing_actions
INSERT INTO sierra_marketing_actions (id, organization_id, recommendation_id, type, title, rationale, expected_impact, confidence_score, linked_entities, approval_state, execution_state, executed_at, result_summary, can_rollback, created_at)
VALUES
  ('ee000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'dd000001-0000-0000-0000-000000000002'::uuid, 'storm_response', 'Launch Emergency Tarp campaign for ZIP 33605, 33611, 33629', 'Storm activity detected in 3 ZIP codes. 3-5 day response window active.', '18-25 emergency leads at ~$38 CPL', 92, '[{"type":"campaign","id":"cc000001-0000-0000-0000-000000000002","label":"Emergency Tarp — Hail Season"}]', 'pending', 'pending', null, null, true, '2026-03-23T07:15:00Z'),
  ('ee000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'dd000001-0000-0000-0000-000000000003'::uuid, 'followup_reactivation', 'Send reactivation sequence to 14 stale estimates', 'Estimates 14+ days old with no response. Sierra will send a 3-step SMS+email sequence.', '~3 closed jobs, ~$49,200 revenue recovery', 78, '[]', 'pending', 'pending', null, null, true, '2026-03-22T18:00:00Z'),
  ('ee000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'dd000001-0000-0000-0000-000000000001'::uuid, 'budget_shift', 'Shift $580/mo from Meta to Google Search', 'Google Search leads close 1.6x better than Meta this month.', '+4 jobs/month estimated', 87, '[{"type":"channel","id":"aa000001-0000-0000-0000-000000000001","label":"Google Ads"},{"type":"channel","id":"aa000001-0000-0000-0000-000000000002","label":"Meta Ads"}]', 'pending', 'pending', null, null, true, '2026-03-23T06:00:00Z'),
  ('ee000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, null, 'campaign_pause', 'Paused Gutter Replacement — Spring Promo (low performance)', 'CPL increased 34% over 10 days. Close rate dropped to 25%. Budget reallocation recommended.', 'Save $1,200/mo in underperforming spend', 91, '[{"type":"campaign","id":"cc000001-0000-0000-0000-000000000004","label":"Gutter Replacement — Spring Promo"}]', 'approved', 'completed', '2026-03-21T09:00:00Z', 'Campaign paused. $1,200/mo saved. Budget reallocated to Emergency Tarp.', true, '2026-03-21T08:00:00Z'),
  ('ee000001-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, null, 'tracking_issue', 'Fix missing UTM parameters on Contact Form', 'Contact form on homepage missing UTM passthrough. 31 leads in the last 30 days attributed to "direct" when source is unknown.', 'Accurate attribution for $45K+ in influenced pipeline', 99, '[{"type":"form","id":"form-003","label":"Homepage Contact Form"}]', 'approved', 'completed', '2026-03-20T15:30:00Z', 'UTM passthrough added to form handler. Attribution now resolves correctly.', false, '2026-03-20T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed marketing_alerts
INSERT INTO marketing_alerts (id, organization_id, severity, title, description, channel, resolved, created_at)
VALUES
  ('ab000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'warning', 'Meta pixel not firing on thank-you page', 'The Meta conversion pixel is not recording form submissions on /inspection-thankyou. This is causing underreported conversions in Meta Ads Manager.', 'meta_ads', false, '2026-03-21T12:00:00Z'),
  ('ab000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'warning', 'Google Ads CPL increased 28% week-over-week', 'Cost per lead on Google Search increased from $30.90 to $39.50. Possible auction price increase or quality score drop.', 'google_ads', false, '2026-03-23T07:00:00Z'),
  ('ab000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'info', 'TikTok Ads not connected', 'Your TikTok Ads account has not been connected. Connect now to expand reach for storm response and brand awareness campaigns.', 'tiktok_ads', false, '2026-03-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed marketing_experiments
INSERT INTO marketing_experiments (id, organization_id, name, hypothesis, variant_a, variant_b, status, winner, lift, created_at)
VALUES
  ('ac000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Inspection Page: Short Form vs Long Form', 'Removing 2 optional fields will increase form conversion rate', '5-field form (current)', '3-field form (name, phone, address)', 'running', null, null, '2026-03-18T09:00:00Z'),
  ('ac000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Google Ad Headline Test: Free vs No-Cost', 'Free in headline will produce higher CTR than No-Cost', 'Free Roof Inspection — Book Today', 'No-Cost Roof Inspection — Tampa', 'completed', 'a', 14.2, '2026-03-05T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed marketing_funnels
INSERT INTO marketing_funnels (id, organization_id, name, funnel_type, headline, offer, submissions, appointments_booked, close_rate, status, created_at)
VALUES
  ('ff000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Free Roof Inspection', 'free_inspection', 'Get a Free Roof Inspection — No Obligation', 'Free certified roof inspection with storm damage assessment', 142, 89, 32.6, 'active', '2026-03-01T09:00:00Z'),
  ('ff000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Emergency Tarp 24hr', 'emergency_tarp', 'Emergency Roof Tarp — We Deploy in 24 Hours', 'Emergency tarping service with same-day dispatch', 44, 38, 56.3, 'active', '2026-03-10T09:00:00Z'),
  ('ff000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Insurance Claim Help', 'insurance_claim', 'Storm Damage? We Handle the Insurance Claim', 'Free inspection + insurance claim assistance', 61, 31, 42.1, 'active', '2026-03-12T09:00:00Z'),
  ('ff000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Zero-Down Financing', 'financing', 'New Roof, $0 Down — Check If You Qualify', 'Zero-down financing with approved credit', 71, 24, 22.9, 'active', '2026-03-05T09:00:00Z'),
  ('ff000001-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Referral Offer', 'referral', 'Refer a Neighbor, Earn $250', '$250 gift card for every referred job that closes', 18, 9, 50.0, 'active', '2026-02-15T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed marketing_social_posts_ai
INSERT INTO marketing_social_posts_ai (id, organization_id, content, platforms, scheduled_at, published_at, status, source_type, source_id, created_at)
VALUES
  ('ad000001-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Storm season is here and your roof is your first line of defense. Our team is ready 24/7 for emergency tarp and repairs across Tampa Bay. Call now or book online. #TampaRoofing #StormReady', '["facebook","instagram"]', '2026-03-25T09:00:00Z', null, 'scheduled', 'storm', null, '2026-03-23T08:00:00Z'),
  ('ad000001-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Just wrapped a full roof replacement in Brandon, FL. The homeowner was nervous about the insurance claim process — we handled every step. 5-star result. Swipe to see the transformation.', '["facebook","instagram"]', null, null, 'draft', 'job', 'job-045', '2026-03-22T14:00:00Z'),
  ('ad000001-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Best roofing company in Tampa. They found storm damage we had no idea about, worked with our insurance, and finished the job in 2 days. Robert H., Tampa FL. Book your free inspection today.', '["facebook"]', '2026-03-26T10:00:00Z', null, 'scheduled', 'review', 'rev-012', '2026-03-23T09:00:00Z'),
  ('ad000001-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Spring is here — have you had your roof inspected since hurricane season? A 20-minute free check could save you thousands. Book now and we will come to you.', '["facebook","instagram"]', null, '2026-03-20T09:00:00Z', 'published', 'template', null, '2026-03-19T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed default approval settings
INSERT INTO marketing_approval_settings (organization_id, approval_mode, budget_guardrails_enabled, daily_cap, monthly_cap)
VALUES ('a0000000-0000-0000-0000-000000000001', 'recommend_and_approve', true, 500, 8000)
ON CONFLICT (organization_id) DO NOTHING;
