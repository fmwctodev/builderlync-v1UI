/*
  # Create Custom Fields System

  1. Tables: custom_field_definitions, custom_field_values
  2. Features: Dynamic fields for entities, validation rules
*/

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL,
  field_options jsonb DEFAULT '[]'::jsonb,
  default_value text,
  is_required boolean DEFAULT false,
  is_searchable boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  display_order integer DEFAULT 0,
  help_text text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, entity_type, field_name)
);

CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_field_definition_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field_value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(custom_field_definition_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_defs_org ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_entity ON custom_field_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_def ON custom_field_values(custom_field_definition_id);

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view custom fields" ON custom_field_definitions FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage custom fields" ON custom_field_definitions FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Members manage field values" ON custom_field_values FOR ALL TO authenticated
  USING (custom_field_definition_id IN (SELECT id FROM custom_field_definitions WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())));
