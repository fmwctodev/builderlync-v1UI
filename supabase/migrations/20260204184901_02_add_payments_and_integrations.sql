/*
  # Add Payments, Integrations, and Additional Features
  
  Tables for:
  - Payment transactions
  - Stripe integration
  - Third-party integrations
  - Marketing forms
  - AI Agents
*/

-- ============================================================================
-- Payments & Transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  invoice_id uuid REFERENCES invoices(id),
  amount numeric(12,2) NOT NULL,
  payment_method text,
  payment_status text DEFAULT 'pending',
  transaction_id text,
  payment_date timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  provider text NOT NULL,
  provider_payment_method_id text,
  type text NOT NULL,
  last_four text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_org ON payment_methods(organization_id);

-- ============================================================================
-- Integrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type text NOT NULL,
  provider text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  credentials jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, integration_type, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);

-- ============================================================================
-- Marketing Forms
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketing_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  form_config jsonb DEFAULT '{}'::jsonb,
  fields jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  thank_you_message text,
  redirect_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id uuid REFERENCES marketing_forms(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  submission_data jsonb NOT NULL,
  source_url text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_forms_org ON marketing_forms(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_org ON form_submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON form_submissions(form_id);

-- ============================================================================
-- AI Agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  agent_type text NOT NULL,
  description text,
  system_prompt text,
  configuration jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_agent_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  channel text,
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org ON ai_agent_conversations(organization_id);

-- ============================================================================
-- Notes & Activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  job_id uuid REFERENCES jobs(id),
  content text NOT NULL,
  note_type text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  job_id uuid REFERENCES jobs(id),
  activity_type text NOT NULL,
  subject text,
  description text,
  status text DEFAULT 'pending',
  due_date timestamptz,
  completed_at timestamptz,
  assigned_to uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_org ON notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);

-- ============================================================================
-- Dashboard Widgets
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  position jsonb DEFAULT '{}'::jsonb,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_org ON dashboard_widgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE POLICY "Users can view organization payments"
  ON payments FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization payments"
  ON payments FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Payment Methods
CREATE POLICY "Users can view organization payment methods"
  ON payment_methods FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization payment methods"
  ON payment_methods FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Integrations
CREATE POLICY "Users can view organization integrations"
  ON integrations FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization integrations"
  ON integrations FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Marketing Forms
CREATE POLICY "Users can view organization forms"
  ON marketing_forms FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization forms"
  ON marketing_forms FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Form Submissions
CREATE POLICY "Users can view organization form submissions"
  ON form_submissions FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization form submissions"
  ON form_submissions FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- AI Agents
CREATE POLICY "Users can view organization ai agents"
  ON ai_agents FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization ai agents"
  ON ai_agents FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- AI Conversations
CREATE POLICY "Users can view organization ai conversations"
  ON ai_agent_conversations FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization ai conversations"
  ON ai_agent_conversations FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Notes
CREATE POLICY "Users can view organization notes"
  ON notes FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization notes"
  ON notes FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Activities
CREATE POLICY "Users can view organization activities"
  ON activities FOR SELECT TO authenticated
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can manage organization activities"
  ON activities FOR ALL TO authenticated
  USING (user_has_org_access(organization_id))
  WITH CHECK (user_has_org_access(organization_id));

-- Dashboard Widgets
CREATE POLICY "Users can view own dashboard widgets"
  ON dashboard_widgets FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND user_has_org_access(organization_id));

CREATE POLICY "Users can manage own dashboard widgets"
  ON dashboard_widgets FOR ALL TO authenticated
  USING (user_id = auth.uid() AND user_has_org_access(organization_id))
  WITH CHECK (user_id = auth.uid() AND user_has_org_access(organization_id));
