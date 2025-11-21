/*
  # Create Workflow Templates System

  ## Overview
  Creates a comprehensive workflow template library system for organizing and managing pre-built workflow templates.

  ## New Tables

  ### `workflow_template_categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category display name (e.g., "A2P", "Residential Sales Pipeline")
  - `description` (text, nullable) - Category description
  - `icon` (text, nullable) - Icon name for UI display
  - `color` (text) - Color theme for category (teal, navy, purple)
  - `display_order` (integer) - Sort order for displaying categories
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `workflow_templates`
  - `id` (uuid, primary key) - Unique template identifier
  - `name` (text) - Template name
  - `description` (text, nullable) - Template description
  - `category_id` (uuid, foreign key) - References workflow_template_categories
  - `icon` (text, nullable) - Icon name for display
  - `gradient_colors` (text[]) - Array of gradient colors for card background
  - `trigger_config` (jsonb) - Trigger configuration data
  - `actions_config` (jsonb) - Array of action configurations
  - `is_system_template` (boolean) - Whether this is a built-in template
  - `is_favorite` (boolean) - Whether template is favorited
  - `tags` (text[]) - Array of tags for filtering
  - `created_by` (uuid, nullable) - User who created template
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Allow authenticated users to read all templates
  - Allow users to create/update/delete their own custom templates
  - System templates (is_system_template = true) are read-only
*/

-- Create workflow_template_categories table
CREATE TABLE IF NOT EXISTS workflow_template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text NOT NULL DEFAULT 'teal',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow_templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES workflow_template_categories(id) ON DELETE SET NULL,
  icon text,
  gradient_colors text[] DEFAULT ARRAY['#3b82f6', '#8b5cf6'],
  trigger_config jsonb NOT NULL DEFAULT '{}',
  actions_config jsonb NOT NULL DEFAULT '[]',
  is_system_template boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workflow_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_template_categories
CREATE POLICY "Anyone can view template categories"
  ON workflow_template_categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for workflow_templates
CREATE POLICY "Anyone can view all templates"
  ON workflow_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own templates"
  ON workflow_templates FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid() AND is_system_template = false);

CREATE POLICY "Users can update their own templates"
  ON workflow_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND is_system_template = false)
  WITH CHECK (created_by = auth.uid() AND is_system_template = false);

CREATE POLICY "Users can delete their own templates"
  ON workflow_templates FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND is_system_template = false);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category_id ON workflow_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_created_by ON workflow_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_system ON workflow_templates(is_system_template);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING gin(tags);

-- Insert template categories
INSERT INTO workflow_template_categories (name, description, color, display_order) VALUES
  ('A2P', 'A2P messaging workflows and compliance', 'teal', 1),
  ('Sierra-AI Caller', 'AI-powered calling workflows', 'navy', 2),
  ('Sierra-AI-JobWorkflows', 'AI job automation workflows', 'purple', 3),
  ('Residential Sales Pipeline', 'Residential sales and lead management', 'teal', 4),
  ('Commercial Sales Pipeline', 'Commercial project workflows', 'navy', 5),
  ('Subcontractor Pipeline', 'Subcontractor management workflows', 'purple', 6),
  ('New Employee Application', 'Employee onboarding workflows', 'teal', 7),
  ('Request Review', 'Review request and management workflows', 'navy', 8)
ON CONFLICT DO NOTHING;

-- Create function to seed workflow templates
CREATE OR REPLACE FUNCTION seed_workflow_templates()
RETURNS void AS $$
DECLARE
  cat_a2p uuid;
  cat_sierra_caller uuid;
  cat_sierra_job uuid;
  cat_residential uuid;
  cat_commercial uuid;
  cat_subcontractor uuid;
  cat_employee uuid;
  cat_review uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_a2p FROM workflow_template_categories WHERE name = 'A2P';
  SELECT id INTO cat_sierra_caller FROM workflow_template_categories WHERE name = 'Sierra-AI Caller';
  SELECT id INTO cat_sierra_job FROM workflow_template_categories WHERE name = 'Sierra-AI-JobWorkflows';
  SELECT id INTO cat_residential FROM workflow_template_categories WHERE name = 'Residential Sales Pipeline';
  SELECT id INTO cat_commercial FROM workflow_template_categories WHERE name = 'Commercial Sales Pipeline';
  SELECT id INTO cat_subcontractor FROM workflow_template_categories WHERE name = 'Subcontractor Pipeline';
  SELECT id INTO cat_employee FROM workflow_template_categories WHERE name = 'New Employee Application';
  SELECT id INTO cat_review FROM workflow_template_categories WHERE name = 'Request Review';

  -- Insert A2P templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('A2P Compliance Check', 'Automatically verify A2P compliance for new contacts', cat_a2p, 'MessageSquare', ARRAY['#14b8a6', '#06b6d4'], 
     '{"type": "contact-created", "name": "Contact Created"}',
     '[{"type": "action", "name": "Send SMS", "id": "send-sms"}]',
     true, ARRAY['compliance', 'a2p', 'messaging']);

  -- Insert Sierra-AI Caller templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('AI Lead Qualification Call', 'AI-powered initial lead qualification call', cat_sierra_caller, 'Phone', ARRAY['#1e3a8a', '#312e81'],
     '{"type": "contact-created", "name": "Contact Created"}',
     '[{"type": "action", "name": "Create Contact", "id": "create-contact"}, {"type": "action", "name": "Add Contact Tag", "id": "add-tag"}]',
     true, ARRAY['ai', 'calling', 'lead-qualification']);

  -- Insert Sierra-AI JobWorkflows templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('Job Status Update Automation', 'Automatically update job status and notify team', cat_sierra_job, 'Briefcase', ARRAY['#7c3aed', '#a855f7'],
     '{"type": "contact-changed", "name": "Contact Changed"}',
     '[{"type": "action", "name": "Update Contact Field", "id": "update-contact"}, {"type": "action", "name": "Send SMS", "id": "send-sms"}]',
     true, ARRAY['job', 'automation', 'status']);

  -- Insert Residential Sales Pipeline templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('New Residential Lead Nurture', 'Welcome and nurture new residential leads', cat_residential, 'Home', ARRAY['#14b8a6', '#06b6d4'],
     '{"type": "contact-tag", "name": "Contact Tag"}',
     '[{"type": "action", "name": "Send SMS", "id": "send-sms"}, {"type": "action", "name": "Add To Notes", "id": "add-notes"}]',
     true, ARRAY['residential', 'lead', 'nurture']),
    ('Appointment Confirmation', 'Confirm residential appointments and send reminders', cat_residential, 'Calendar', ARRAY['#14b8a6', '#06b6d4'],
     '{"type": "task-reminder", "name": "Task Reminder"}',
     '[{"type": "action", "name": "Send SMS", "id": "send-sms"}]',
     true, ARRAY['appointment', 'residential', 'reminder']);

  -- Insert Commercial Sales Pipeline templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('Commercial Proposal Follow-up', 'Follow up on commercial proposals', cat_commercial, 'Building', ARRAY['#1e3a8a', '#312e81'],
     '{"type": "note-added", "name": "Note Added"}',
     '[{"type": "action", "name": "Assign To User", "id": "assign-user"}, {"type": "action", "name": "Send SMS", "id": "send-sms"}]',
     true, ARRAY['commercial', 'proposal', 'follow-up']);

  -- Insert Subcontractor Pipeline templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('Subcontractor Onboarding', 'Onboard new subcontractors with required documents', cat_subcontractor, 'Users', ARRAY['#7c3aed', '#a855f7'],
     '{"type": "contact-created", "name": "Contact Created"}',
     '[{"type": "action", "name": "Add Contact Tag", "id": "add-tag"}, {"type": "action", "name": "Send SMS", "id": "send-sms"}]',
     true, ARRAY['subcontractor', 'onboarding']);

  -- Insert New Employee Application templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('Employee Application Review', 'Review and process new employee applications', cat_employee, 'UserCheck', ARRAY['#14b8a6', '#06b6d4'],
     '{"type": "contact-created", "name": "Contact Created"}',
     '[{"type": "action", "name": "Assign To User", "id": "assign-user"}, {"type": "action", "name": "Add Contact Tag", "id": "add-tag"}]',
     true, ARRAY['employee', 'application', 'onboarding']);

  -- Insert Request Review templates
  INSERT INTO workflow_templates (name, description, category_id, icon, gradient_colors, trigger_config, actions_config, is_system_template, tags) VALUES
    ('Post-Job Review Request', 'Request reviews after job completion', cat_review, 'Star', ARRAY['#1e3a8a', '#312e81'],
     '{"type": "task-added", "name": "Task Added"}',
     '[{"type": "action", "name": "Send SMS", "id": "send-sms"}]',
     true, ARRAY['review', 'feedback', 'customer']);
END;
$$ LANGUAGE plpgsql;

-- Execute the seed function
SELECT seed_workflow_templates();