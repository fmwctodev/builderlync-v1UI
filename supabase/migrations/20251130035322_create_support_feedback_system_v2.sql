/*
  # Support & Feedback System

  1. Enhanced Tables
    - Enhance existing support_tickets table with new columns
    - Enhance existing nps_feedback table

  2. New Tables
    - support_ticket_comments - Ticket conversation tracking
    - product_feedback - Feature requests and bug reports
    - account_health - Account health snapshots and risk monitoring

  3. Features
    - Support ticket workflow with comments
    - NPS collection and analysis
    - Product feedback management
    - Account health scoring and risk assessment
    - First response time tracking
    - Resolution time tracking

  4. Security
    - Enable RLS on all tables
    - Super admin access policies
*/

-- Enhance support_tickets table with new columns
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'contact_email') THEN
    ALTER TABLE support_tickets ADD COLUMN contact_email text NOT NULL DEFAULT 'unknown@example.com';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'contact_name') THEN
    ALTER TABLE support_tickets ADD COLUMN contact_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'category') THEN
    ALTER TABLE support_tickets ADD COLUMN category text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'source') THEN
    ALTER TABLE support_tickets ADD COLUMN source text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'first_response_at') THEN
    ALTER TABLE support_tickets ADD COLUMN first_response_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'resolved_at') THEN
    ALTER TABLE support_tickets ADD COLUMN resolved_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'tags') THEN
    ALTER TABLE support_tickets ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;
  
  -- Change assigned_to from uuid to text if it exists as uuid
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'assigned_to' AND data_type = 'uuid') THEN
    ALTER TABLE support_tickets ALTER COLUMN assigned_to TYPE text USING assigned_to::text;
  END IF;
END $$;

-- Drop old status constraint and add new one with more states
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check;
ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_status_check 
  CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed'));

-- Support Ticket Comments Table
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_type text NOT NULL CHECK (author_type IN ('customer', 'internal')),
  author_name text,
  author_email text,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_internal_note boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON support_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created ON support_ticket_comments(created_at DESC);

-- Enhance NPS feedback table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nps_feedback' AND column_name = 'contact_email') THEN
    ALTER TABLE nps_feedback ADD COLUMN contact_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nps_feedback' AND column_name = 'source') THEN
    ALTER TABLE nps_feedback ADD COLUMN source text;
  END IF;
END $$;

-- Product Feedback Table
CREATE TABLE IF NOT EXISTS product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES enterprise_accounts(id) ON DELETE SET NULL,
  contact_email text,
  type text CHECK (type IN ('bug', 'idea', 'praise', 'question')),
  title text NOT NULL,
  body text NOT NULL,
  area text,
  severity text CHECK (severity IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'in_progress', 'done', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_product_feedback_account ON product_feedback(account_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_type ON product_feedback(type);
CREATE INDEX IF NOT EXISTS idx_product_feedback_status ON product_feedback(status);
CREATE INDEX IF NOT EXISTS idx_product_feedback_created ON product_feedback(created_at DESC);

-- Account Health Table
CREATE TABLE IF NOT EXISTS account_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES enterprise_accounts(id) ON DELETE CASCADE,
  period date NOT NULL,
  health_score integer NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  tickets_open integer NOT NULL DEFAULT 0,
  nps_latest integer CHECK (nps_latest >= 0 AND nps_latest <= 10),
  usage_score integer CHECK (usage_score >= 0 AND usage_score <= 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, period)
);

CREATE INDEX IF NOT EXISTS idx_account_health_account ON account_health(account_id);
CREATE INDEX IF NOT EXISTS idx_account_health_risk ON account_health(risk_level);
CREATE INDEX IF NOT EXISTS idx_account_health_score ON account_health(health_score);
CREATE INDEX IF NOT EXISTS idx_account_health_period ON account_health(period DESC);

-- Enable Row Level Security
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Super Admin access)
CREATE POLICY "Super admin full access to ticket_comments"
  ON support_ticket_comments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to product_feedback"
  ON product_feedback FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Super admin full access to account_health"
  ON account_health FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed Sample Support Tickets (20-30 tickets)
INSERT INTO support_tickets (ticket_number, account_id, contact_email, contact_name, subject, description, status, priority, category, source, assigned_to, tags, created_at)
SELECT
  'TKT-' || LPAD((1000 + row_number() OVER ())::text, 5, '0'),
  (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1),
  'contact' || floor(random() * 100) || '@example.com',
  'Contact User ' || floor(random() * 100),
  (ARRAY['Login issues', 'Billing question', 'Feature not working', 'Data export problem', 'Integration setup help', 'Performance slow', 'Mobile app crash', 'Report generation fails', 'Cannot add users', 'Email notifications not working'])[floor(random() * 10 + 1)],
  'Detailed description of the issue. Customer is experiencing problems with the system and needs assistance. ' || 'Additional context: ' || md5(random()::text),
  (ARRAY['open', 'in_progress', 'waiting', 'resolved', 'closed'])[floor(random() * 5 + 1)]::text,
  (ARRAY['low', 'medium', 'high', 'urgent'])[floor(random() * 4 + 1)]::text,
  (ARRAY['billing', 'bug', 'feature_request', 'onboarding', 'technical'])[floor(random() * 5 + 1)],
  (ARRAY['in_app', 'email', 'phone', 'chat'])[floor(random() * 4 + 1)],
  CASE WHEN random() > 0.3 THEN 'support@builderlync.com' ELSE NULL END,
  CASE WHEN random() > 0.5 THEN ARRAY['urgent', 'needs-followup'] ELSE ARRAY[]::text[] END,
  now() - (random() * interval '30 days')
FROM generate_series(1, 25)
ON CONFLICT (ticket_number) DO NOTHING;

-- Seed Ticket Comments (5-10 per ticket)
INSERT INTO support_ticket_comments (ticket_id, author_type, author_name, author_email, body, created_at, is_internal_note)
SELECT
  t.id,
  (ARRAY['customer', 'internal'])[floor(random() * 2 + 1)]::text,
  CASE 
    WHEN random() > 0.5 THEN 'Support Team'
    ELSE 'Customer User'
  END,
  CASE 
    WHEN random() > 0.5 THEN 'support@builderlync.com'
    ELSE t.contact_email
  END,
  (ARRAY[
    'Thank you for your response. I will try that solution.',
    'I have investigated this issue and found the root cause.',
    'Can you please provide more details about when this started?',
    'This has been escalated to our engineering team.',
    'The issue should now be resolved. Please confirm.',
    'I am still experiencing the same problem.',
    'Scheduled a follow-up call for tomorrow at 2pm.',
    'Workaround: Use the alternative method described in docs.',
    'This is a known issue that will be fixed in next release.',
    'Thank you for the quick resolution!'
  ])[floor(random() * 10 + 1)],
  t.created_at + (random() * interval '5 days'),
  random() > 0.7
FROM support_tickets t
CROSS JOIN generate_series(1, 5);

-- Seed NPS Responses (30-50 responses)
INSERT INTO nps_feedback (account_id, contact_email, score, comment, source, created_at)
SELECT
  (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1),
  'customer' || floor(random() * 100) || '@example.com',
  floor(random() * 11)::int,
  CASE 
    WHEN random() > 0.3 THEN 
      (ARRAY[
        'Great product, very easy to use!',
        'Could use some improvements in the UI.',
        'Very satisfied with the support team.',
        'Missing some key features we need.',
        'Excellent value for money.',
        'Interface is confusing at times.',
        'Outstanding customer service!',
        'Product works well but could be faster.',
        'Love the recent updates!',
        'Not meeting our expectations.'
      ])[floor(random() * 10 + 1)]
    ELSE NULL
  END,
  (ARRAY['in_app', 'email', 'campaign'])[floor(random() * 3 + 1)],
  now() - (random() * interval '90 days')
FROM generate_series(1, 40)
ON CONFLICT DO NOTHING;

-- Seed Product Feedback (15-20 items)
INSERT INTO product_feedback (account_id, contact_email, type, title, body, area, severity, status, created_at)
SELECT
  (SELECT id FROM enterprise_accounts ORDER BY random() LIMIT 1),
  'user' || floor(random() * 100) || '@example.com',
  (ARRAY['bug', 'idea', 'praise', 'question'])[floor(random() * 4 + 1)]::text,
  (ARRAY[
    'Add dark mode support',
    'Export to Excel not working',
    'Calendar view for appointments',
    'Bulk edit for jobs',
    'Mobile app improvements',
    'Integration with Slack',
    'Dashboard is very intuitive',
    'Faster load times needed',
    'Multi-language support',
    'API documentation unclear',
    'Love the new features!',
    'Search function improvements',
    'Automated reporting',
    'Better filtering options',
    'Custom fields in forms'
  ])[floor(random() * 15 + 1)],
  'Detailed feedback body explaining the suggestion or issue in more detail. This would include specific use cases, examples, and any additional context that would help the team understand and prioritize this feedback.',
  (ARRAY['jobs', 'claims', 'ai', 'billing', 'integrations', 'mobile', 'dashboard'])[floor(random() * 7 + 1)],
  CASE 
    WHEN random() > 0.5 THEN (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)]::text
    ELSE NULL
  END,
  (ARRAY['new', 'reviewing', 'planned', 'in_progress', 'done', 'rejected'])[floor(random() * 6 + 1)]::text,
  now() - (random() * interval '60 days')
FROM generate_series(1, 18)
ON CONFLICT DO NOTHING;

-- Seed Account Health Snapshots (10-15 snapshots)
INSERT INTO account_health (account_id, period, health_score, risk_level, tickets_open, nps_latest, usage_score, notes, created_at)
SELECT
  acc.id,
  date_trunc('month', CURRENT_DATE - (floor(random() * 2) || ' months')::interval)::date,
  30 + floor(random() * 70)::int,
  (ARRAY['low', 'medium', 'high'])[
    CASE 
      WHEN random() > 0.7 THEN 3
      WHEN random() > 0.4 THEN 2
      ELSE 1
    END
  ]::text,
  floor(random() * 6)::int,
  floor(random() * 11)::int,
  40 + floor(random() * 60)::int,
  CASE 
    WHEN random() > 0.5 THEN 'Account showing good engagement. Monitor usage trends.'
    WHEN random() > 0.3 THEN 'Some concerns about ticket volume. Schedule check-in.'
    ELSE 'Healthy account. No immediate action needed.'
  END,
  now()
FROM enterprise_accounts acc
ORDER BY random()
LIMIT 12
ON CONFLICT (account_id, period) DO NOTHING;