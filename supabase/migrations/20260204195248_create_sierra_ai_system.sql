/*
  # Create Sierra AI System Tables
  
  1. New Tables
    - sierra_config: AI configuration
    - sierra_behavior_profiles: AI behavior profiles
    - sierra_kb_collections: Knowledge base collections
    - sierra_kb_articles: KB articles
    - sierra_kb_qapairs: Q&A pairs
    - sierra_kb_embeddings: Vector embeddings
    - sierra_kb_web_sources: Web scraping sources
    - sierra_channels_config: Channel configuration
    - sierra_sms_templates: AI SMS templates
    - sierra_appointments: AI-scheduled appointments
    - sierra_audit_logs: AI audit logging
    - sierra_webchat_sessions: Web chat sessions
    - ai_agent_phone_numbers: Phone numbers for AI agents
    - ai_agent_client_tools: Client tools for AI agents
    
  2. Security
    - Enable RLS on all tables
    - Organization/user-scoped access
*/

-- Enable vector extension if available
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'vector extension not available, skipping';
END $$;

-- Sierra Config Table
CREATE TABLE IF NOT EXISTS sierra_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_enabled boolean DEFAULT true,
  persona_name text DEFAULT 'Sierra',
  persona_settings jsonb DEFAULT '{}'::jsonb,
  voice_settings jsonb DEFAULT '{}'::jsonb,
  language_settings jsonb DEFAULT '{}'::jsonb,
  response_settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE sierra_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra config in their org"
    ON sierra_config FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_config.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra Behavior Profiles Table
CREATE TABLE IF NOT EXISTS sierra_behavior_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name text NOT NULL,
  description text,
  personality_traits jsonb DEFAULT '{}'::jsonb,
  conversation_style jsonb DEFAULT '{}'::jsonb,
  response_templates jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_behavior_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra behavior profiles in their org"
    ON sierra_behavior_profiles FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_behavior_profiles.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra KB Collections Table
CREATE TABLE IF NOT EXISTS sierra_kb_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  collection_type text DEFAULT 'general',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_kb_collections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra kb collections in their org"
    ON sierra_kb_collections FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_kb_collections.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra KB Articles Table
CREATE TABLE IF NOT EXISTS sierra_kb_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES sierra_kb_collections(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  source_url text,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_kb_articles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra kb articles"
    ON sierra_kb_articles FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM sierra_kb_collections
        JOIN user_organizations ON user_organizations.organization_id = sierra_kb_collections.organization_id
        WHERE sierra_kb_collections.id = sierra_kb_articles.collection_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra KB QA Pairs Table
CREATE TABLE IF NOT EXISTS sierra_kb_qapairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES sierra_kb_collections(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  confidence_score numeric DEFAULT 1.0,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_kb_qapairs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra kb qapairs"
    ON sierra_kb_qapairs FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM sierra_kb_collections
        JOIN user_organizations ON user_organizations.organization_id = sierra_kb_collections.organization_id
        WHERE sierra_kb_collections.id = sierra_kb_qapairs.collection_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra KB Embeddings Table (for vector search)
CREATE TABLE IF NOT EXISTS sierra_kb_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  content_chunk text NOT NULL,
  embedding_model text DEFAULT 'text-embedding-ada-002',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_kb_embeddings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra kb embeddings in their org"
    ON sierra_kb_embeddings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_kb_embeddings.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra KB Web Sources Table
CREATE TABLE IF NOT EXISTS sierra_kb_web_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  status text DEFAULT 'pending',
  last_scraped_at timestamptz,
  scrape_frequency text DEFAULT 'weekly',
  content_hash text,
  page_count integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_kb_web_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra kb web sources in their org"
    ON sierra_kb_web_sources FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_kb_web_sources.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra Channels Config Table
CREATE TABLE IF NOT EXISTS sierra_channels_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type text NOT NULL,
  is_enabled boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  routing_rules jsonb DEFAULT '[]'::jsonb,
  working_hours jsonb DEFAULT '{}'::jsonb,
  auto_reply_settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id, channel_type)
);

ALTER TABLE sierra_channels_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra channels config in their org"
    ON sierra_channels_config FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_channels_config.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra SMS Templates Table
CREATE TABLE IF NOT EXISTS sierra_sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  content text NOT NULL,
  category text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_sms_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra sms templates in their org"
    ON sierra_sms_templates FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_sms_templates.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra Appointments Table
CREATE TABLE IF NOT EXISTS sierra_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  status text DEFAULT 'scheduled',
  booked_via text DEFAULT 'ai',
  conversation_id uuid,
  calendar_event_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_appointments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra appointments in their org"
    ON sierra_appointments FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_appointments.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra Audit Logs Table
CREATE TABLE IF NOT EXISTS sierra_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view sierra audit logs in their org"
    ON sierra_audit_logs FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_audit_logs.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra Webchat Sessions Table
CREATE TABLE IF NOT EXISTS sierra_webchat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id text,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  session_data jsonb DEFAULT '{}'::jsonb,
  messages jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sierra_webchat_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage sierra webchat sessions in their org"
    ON sierra_webchat_sessions FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sierra_webchat_sessions.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AI Agent Phone Numbers Table
CREATE TABLE IF NOT EXISTS ai_agent_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  phone_number_id uuid NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  routing_rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, phone_number_id)
);

ALTER TABLE ai_agent_phone_numbers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage ai agent phone numbers"
    ON ai_agent_phone_numbers FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM ai_agents
        JOIN user_organizations ON user_organizations.organization_id = ai_agents.organization_id
        WHERE ai_agents.id = ai_agent_phone_numbers.agent_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AI Agent Client Tools Table
CREATE TABLE IF NOT EXISTS ai_agent_client_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  tool_type text NOT NULL,
  description text,
  configuration jsonb DEFAULT '{}'::jsonb,
  is_enabled boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_agent_client_tools ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage ai agent client tools"
    ON ai_agent_client_tools FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM ai_agents
        JOIN user_organizations ON user_organizations.organization_id = ai_agents.organization_id
        WHERE ai_agents.id = ai_agent_client_tools.agent_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sierra_config_org ON sierra_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_behavior_profiles_org ON sierra_behavior_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_collections_org ON sierra_kb_collections(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_articles_collection ON sierra_kb_articles(collection_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_qapairs_collection ON sierra_kb_qapairs(collection_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_embeddings_org ON sierra_kb_embeddings(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_embeddings_source ON sierra_kb_embeddings(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_web_sources_org ON sierra_kb_web_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_channels_config_org ON sierra_channels_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_sms_templates_org ON sierra_sms_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_appointments_org ON sierra_appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_audit_logs_org ON sierra_audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sierra_webchat_sessions_org ON sierra_webchat_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_phone_numbers_agent ON ai_agent_phone_numbers(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_client_tools_agent ON ai_agent_client_tools(agent_id);
