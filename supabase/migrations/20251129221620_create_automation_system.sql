/*
  # Create Automation System

  1. New Tables
    - automation_rules - Trigger-based automation rules
    - automation_executions - Automation execution history

  2. Security
    - Enable RLS on all tables
    - Organization-based access control

  3. Features
    - Trigger conditions (contact created, opportunity changed, etc.)
    - Action workflows (send email, create task, update field)
    - Execution logging and error handling
*/

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  
  -- Rule Information
  name text NOT NULL,
  description text,
  
  -- Status
  is_active boolean DEFAULT true,
  is_paused boolean DEFAULT false,
  
  -- Trigger Configuration
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'contact_created',
    'contact_updated',
    'opportunity_created',
    'opportunity_stage_changed',
    'job_created',
    'job_status_changed',
    'appointment_scheduled',
    'appointment_completed',
    'form_submitted',
    'email_opened',
    'email_clicked',
    'sms_received',
    'tag_added',
    'tag_removed',
    'scheduled_time'
  )),
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Conditions (AND/OR logic)
  conditions jsonb DEFAULT '[]'::jsonb,
  condition_match_type text DEFAULT 'all' CHECK (condition_match_type IN ('all', 'any')),
  
  -- Actions (sequential execution)
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Execution Settings
  max_executions_per_contact integer,
  cooldown_period_hours integer,
  execution_delay_minutes integer DEFAULT 0,
  
  -- Schedule (for scheduled_time trigger)
  schedule_config jsonb DEFAULT '{}'::jsonb,
  
  -- Tracking
  execution_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  last_executed_at timestamptz,
  
  -- Metadata
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create automation_executions table
CREATE TABLE IF NOT EXISTS automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id uuid NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  
  -- Execution Context
  trigger_event text NOT NULL,
  trigger_data jsonb DEFAULT '{}'::jsonb,
  
  -- Related Objects
  contact_id uuid,
  opportunity_id uuid,
  job_id uuid,
  
  -- Execution Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'running',
    'completed',
    'failed',
    'skipped'
  )),
  
  -- Conditions Evaluation
  conditions_met boolean,
  conditions_result jsonb DEFAULT '{}'::jsonb,
  
  -- Actions Execution
  actions_completed jsonb DEFAULT '[]'::jsonb,
  actions_failed jsonb DEFAULT '[]'::jsonb,
  current_action_index integer DEFAULT 0,
  
  -- Error Handling
  error_message text,
  error_stack text,
  retry_count integer DEFAULT 0,
  
  -- Performance
  started_at timestamptz,
  completed_at timestamptz,
  execution_duration_ms integer,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_organization ON automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON automation_executions(automation_rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_organization ON automation_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_contact ON automation_executions(contact_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_created_at ON automation_executions(created_at DESC);

-- Enable RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_rules
CREATE POLICY "Users view automation rules in org" ON automation_rules FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users create automation rules in org" ON automation_rules FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Users update automation rules in org" ON automation_rules FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')));

CREATE POLICY "Users delete automation rules in org" ON automation_rules FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- RLS Policies for automation_executions
CREATE POLICY "Users view executions in org" ON automation_executions FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "System manages executions" ON automation_executions FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Function to update rule execution stats
CREATE OR REPLACE FUNCTION update_automation_rule_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE automation_rules
  SET
    execution_count = execution_count + 1,
    success_count = CASE WHEN NEW.status = 'completed' THEN success_count + 1 ELSE success_count END,
    failure_count = CASE WHEN NEW.status = 'failed' THEN failure_count + 1 ELSE failure_count END,
    last_executed_at = NEW.completed_at
  WHERE id = NEW.automation_rule_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats
DROP TRIGGER IF EXISTS trigger_update_automation_rule_stats ON automation_executions;
CREATE TRIGGER trigger_update_automation_rule_stats
  AFTER UPDATE OF status ON automation_executions
  FOR EACH ROW
  WHEN (NEW.status IN ('completed', 'failed'))
  EXECUTE FUNCTION update_automation_rule_stats();
