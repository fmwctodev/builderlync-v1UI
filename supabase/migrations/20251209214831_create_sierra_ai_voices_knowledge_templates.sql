/*
  # Sierra AI Module Enhancement - Voices, Knowledge Base, and Templates

  ## Overview
  This migration adds comprehensive support for Sierra AI module features including:
  - AI agent voice library and settings
  - Knowledge base document management
  - Global and organization-specific agent templates

  ## New Tables

  ### 1. `ai_agent_voices`
  Voice library containing available TTS voices for AI agents
  - `id` (uuid, primary key)
  - `name` (text) - Display name of the voice
  - `gender` (text) - 'male' or 'female'
  - `language` (text) - Language code (e.g., 'en-US')
  - `provider` (text) - TTS provider (e.g., 'elevenlabs', 'google', 'azure')
  - `voice_id` (text) - Provider's voice identifier
  - `sample_url` (text) - URL to sample audio file
  - `is_active` (boolean) - Whether voice is available for use
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `agent_voice_settings`
  Maps AI agents to their selected voices
  - `id` (uuid, primary key)
  - `agent_id` (uuid) - Reference to sierra_ai_agents
  - `voice_id` (uuid) - Reference to ai_agent_voices
  - `organization_id` (uuid) - Multi-tenant isolation
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `knowledge_base_documents`
  Stores knowledge base documents for AI agents
  - `id` (uuid, primary key)
  - `organization_id` (uuid) - Multi-tenant isolation
  - `collection_id` (uuid, nullable) - Optional grouping
  - `title` (text) - Document title
  - `content` (text) - Document content
  - `source_type` (text) - 'url', 'file', 'text'
  - `source_url` (text, nullable) - Original URL if imported from web
  - `source_file_name` (text, nullable) - Original filename if uploaded
  - `metadata` (jsonb) - Additional metadata
  - `status` (text) - 'draft', 'published'
  - `is_high_priority` (boolean) - Priority flag for RAG
  - `created_by` (uuid) - Reference to auth.users
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `knowledge_base_collections`
  Organizational grouping for knowledge base documents
  - `id` (uuid, primary key)
  - `organization_id` (uuid) - Multi-tenant isolation
  - `name` (text) - Collection name
  - `description` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `agent_templates`
  Reusable agent configuration templates (global and org-specific)
  - `id` (uuid, primary key)
  - `organization_id` (uuid, nullable) - NULL for global templates
  - `name` (text) - Template name
  - `description` (text) - Template description
  - `category` (text) - Template category
  - `icon` (text) - Icon identifier
  - `configuration` (jsonb) - Complete agent configuration
  - `is_global` (boolean) - Whether available to all orgs
  - `is_active` (boolean) - Whether template is available
  - `created_by` (uuid, nullable) - Reference to auth.users
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Organization-scoped policies for multi-tenant isolation
  - Global templates readable by all, writable by super admins only
  - Voice library readable by all authenticated users
*/

-- Create ai_agent_voices table
CREATE TABLE IF NOT EXISTS ai_agent_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'neutral')),
  language text NOT NULL DEFAULT 'en-US',
  provider text NOT NULL,
  voice_id text NOT NULL,
  sample_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_voice_settings table
CREATE TABLE IF NOT EXISTS agent_voice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  voice_id uuid NOT NULL REFERENCES ai_agent_voices(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, organization_id)
);

-- Create knowledge_base_collections table
CREATE TABLE IF NOT EXISTS knowledge_base_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create knowledge_base_documents table
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES knowledge_base_collections(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('url', 'file', 'text')),
  source_url text,
  source_file_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_high_priority boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_templates table
CREATE TABLE IF NOT EXISTS agent_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_global boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_voice_settings_agent ON agent_voice_settings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_voice_settings_org ON agent_voice_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_org ON knowledge_base_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_collection ON knowledge_base_documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_status ON knowledge_base_documents(status);
CREATE INDEX IF NOT EXISTS idx_kb_collections_org ON knowledge_base_collections(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_templates_org ON agent_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_templates_global ON agent_templates(is_global, is_active);

-- Enable RLS
ALTER TABLE ai_agent_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agent_voices (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active voices"
  ON ai_agent_voices FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for agent_voice_settings
CREATE POLICY "Users can view voice settings in their organization"
  ON agent_voice_settings FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert voice settings in their organization"
  ON agent_voice_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update voice settings in their organization"
  ON agent_voice_settings FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete voice settings in their organization"
  ON agent_voice_settings FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for knowledge_base_collections
CREATE POLICY "Users can view collections in their organization"
  ON knowledge_base_collections FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert collections in their organization"
  ON knowledge_base_collections FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update collections in their organization"
  ON knowledge_base_collections FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete collections in their organization"
  ON knowledge_base_collections FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for knowledge_base_documents
CREATE POLICY "Users can view documents in their organization"
  ON knowledge_base_documents FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert documents in their organization"
  ON knowledge_base_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update documents in their organization"
  ON knowledge_base_documents FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete documents in their organization"
  ON knowledge_base_documents FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for agent_templates
CREATE POLICY "Users can view global templates and their org templates"
  ON agent_templates FOR SELECT
  TO authenticated
  USING (
    is_global = true AND is_active = true
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert templates in their organization"
  ON agent_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update templates in their organization"
  ON agent_templates FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete templates in their organization"
  ON agent_templates FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Seed default voices
INSERT INTO ai_agent_voices (name, gender, language, provider, voice_id, sample_url, is_active)
VALUES
  ('James', 'male', 'en-US', 'elevenlabs', 'james-voice-001', NULL, true),
  ('Michael', 'male', 'en-US', 'elevenlabs', 'michael-voice-001', NULL, true),
  ('Sarah', 'female', 'en-US', 'elevenlabs', 'sarah-voice-001', NULL, true),
  ('Emma', 'female', 'en-US', 'elevenlabs', 'emma-voice-001', NULL, true)
ON CONFLICT DO NOTHING;

-- Seed placeholder global templates (will show with Coming Soon overlay)
INSERT INTO agent_templates (name, description, category, icon, configuration, is_global, is_active)
VALUES
  ('Customer Support Agent', 'A friendly AI agent trained to handle common customer support inquiries with empathy and efficiency', 'support', 'headset', '{"tone": "friendly", "expertise": "customer_service"}'::jsonb, true, true),
  ('Lead Qualification Agent', 'Engages with potential customers to qualify leads and book appointments with your sales team', 'sales', 'target', '{"tone": "professional", "expertise": "lead_qualification"}'::jsonb, true, true),
  ('Appointment Scheduler', 'Manages calendar bookings and reschedules appointments while maintaining a professional demeanor', 'scheduling', 'calendar', '{"tone": "efficient", "expertise": "scheduling"}'::jsonb, true, true),
  ('FAQ Assistant', 'Answers frequently asked questions about your products or services with accurate information', 'support', 'help-circle', '{"tone": "informative", "expertise": "faq"}'::jsonb, true, true)
ON CONFLICT DO NOTHING;