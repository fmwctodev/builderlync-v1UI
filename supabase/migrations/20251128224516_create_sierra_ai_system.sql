/*
  # Create Sierra AI System

  ## Overview
  This migration creates a comprehensive AI agent system for voice, SMS, and webchat
  customer interactions. Sierra AI can handle inquiries, book appointments, qualify
  leads, and escalate to humans when needed.

  ## New Tables

  ### 1. sierra_config
  Main configuration table for Sierra AI agent per account
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `status` (enum: active, paused) - Agent operational status
  - `time_zone` (text) - Account timezone (e.g., 'America/New_York')
  - `business_hours` (jsonb) - Operating hours per day of week
  - `default_pipeline_id` (uuid) - Default opportunity pipeline
  - `default_calendar_id` (uuid) - Default calendar for bookings
  - `draft_version` (jsonb) - Draft configuration version
  - `published_version` (jsonb) - Published/live configuration version
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. sierra_behavior_profiles
  Defines agent personality, tone, and behavior rules
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `name` (text) - Profile name (e.g., 'Default', 'After Hours')
  - `persona_description` (text) - Agent personality description
  - `tone_tags` (text[]) - Array of tone descriptors
  - `formality_level` (enum: casual, neutral, formal)
  - `operating_toggles` (jsonb) - Feature flags and settings
  - `custom_instructions` (text) - Additional LLM instructions
  - `escalation_triggers` (jsonb) - Rules for human escalation
  - `forbidden_topics` (text[]) - Topics to avoid
  - `banned_phrases` (text[]) - Phrases to never use
  - `default_escalation_target_user_id` (uuid)
  - `status` (enum: draft, published)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3-11. Additional tables for KB, channels, appointments, etc.

  ## Security
  - Row Level Security enabled on all tables
  - All tables scoped by user_id
  - Policies restrict access to authenticated users' own data

  ## Performance
  - Indexes on all foreign keys
  - Vector index for embeddings similarity search
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sierra_status') THEN
    CREATE TYPE sierra_status AS ENUM ('active', 'paused');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formality_level') THEN
    CREATE TYPE formality_level AS ENUM ('casual', 'neutral', 'formal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('draft', 'published');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'embedding_source_type') THEN
    CREATE TYPE embedding_source_type AS ENUM ('article', 'qapair');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sierra_channel_type') THEN
    CREATE TYPE sierra_channel_type AS ENUM ('webchat', 'sms', 'voice');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
    CREATE TYPE session_status AS ENUM ('open', 'closed');
  END IF;
END $$;

-- Create sierra_config table
CREATE TABLE IF NOT EXISTS sierra_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status sierra_status DEFAULT 'paused',
  time_zone text DEFAULT 'America/New_York',
  business_hours jsonb DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "enabled": true},
    "tuesday": {"open": "09:00", "close": "17:00", "enabled": true},
    "wednesday": {"open": "09:00", "close": "17:00", "enabled": true},
    "thursday": {"open": "09:00", "close": "17:00", "enabled": true},
    "friday": {"open": "09:00", "close": "17:00", "enabled": true},
    "saturday": {"open": "09:00", "close": "17:00", "enabled": false},
    "sunday": {"open": "09:00", "close": "17:00", "enabled": false}
  }'::jsonb,
  default_pipeline_id uuid,
  default_calendar_id uuid,
  draft_version jsonb DEFAULT '{}'::jsonb,
  published_version jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create sierra_behavior_profiles table
CREATE TABLE IF NOT EXISTS sierra_behavior_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default',
  persona_description text DEFAULT 'Professional and helpful AI assistant',
  tone_tags text[] DEFAULT ARRAY['professional', 'friendly', 'direct'],
  formality_level formality_level DEFAULT 'neutral',
  operating_toggles jsonb DEFAULT '{
    "introduce_with_business_name": true,
    "capture_contact_info": true,
    "offer_appointments": true,
    "handle_pricing_questions": true,
    "describe_services": true
  }'::jsonb,
  custom_instructions text DEFAULT '',
  escalation_triggers jsonb DEFAULT '[]'::jsonb,
  forbidden_topics text[] DEFAULT ARRAY[]::text[],
  banned_phrases text[] DEFAULT ARRAY[]::text[],
  default_escalation_target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status content_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sierra_kb_collections table
CREATE TABLE IF NOT EXISTS sierra_kb_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sierra_kb_articles table
CREATE TABLE IF NOT EXISTS sierra_kb_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES sierra_kb_collections(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  status content_status DEFAULT 'draft',
  priority priority_level DEFAULT 'normal',
  allow_verbatim boolean DEFAULT true,
  is_high_priority_fact boolean DEFAULT false,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sierra_kb_qapairs table
CREATE TABLE IF NOT EXISTS sierra_kb_qapairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES sierra_kb_collections(id) ON DELETE SET NULL,
  question_pattern text NOT NULL,
  intent text NOT NULL,
  answer text NOT NULL,
  priority priority_level DEFAULT 'normal',
  offer_to_book boolean DEFAULT false,
  allow_ranges boolean DEFAULT true,
  status content_status DEFAULT 'draft',
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sierra_kb_embeddings table with vector support
CREATE TABLE IF NOT EXISTS sierra_kb_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type embedding_source_type NOT NULL,
  source_id uuid NOT NULL,
  chunk_index integer DEFAULT 0,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

-- Create sierra_channels_config table
CREATE TABLE IF NOT EXISTS sierra_channels_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type sierra_channel_type NOT NULL,
  enabled boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, channel_type)
);

-- Create sierra_sms_templates table
CREATE TABLE IF NOT EXISTS sierra_sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL,
  body text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sierra_appointments table
CREATE TABLE IF NOT EXISTS sierra_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  opportunity_id uuid,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  calendar_id uuid,
  appointment_type text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text DEFAULT 'on_site',
  external_event_id text,
  created_by text DEFAULT 'sierra',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sierra_audit_logs table
CREATE TABLE IF NOT EXISTS sierra_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  diff jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create sierra_webchat_sessions table
CREATE TABLE IF NOT EXISTS sierra_webchat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  status session_status DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sierra_config_user ON sierra_config(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_config_status ON sierra_config(status);

CREATE INDEX IF NOT EXISTS idx_sierra_behavior_user ON sierra_behavior_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_behavior_status ON sierra_behavior_profiles(status);

CREATE INDEX IF NOT EXISTS idx_sierra_kb_collections_user ON sierra_kb_collections(user_id);

CREATE INDEX IF NOT EXISTS idx_sierra_kb_articles_user ON sierra_kb_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_articles_collection ON sierra_kb_articles(collection_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_articles_status ON sierra_kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_articles_priority ON sierra_kb_articles(priority);

CREATE INDEX IF NOT EXISTS idx_sierra_kb_qapairs_user ON sierra_kb_qapairs(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_qapairs_collection ON sierra_kb_qapairs(collection_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_qapairs_intent ON sierra_kb_qapairs(intent);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_qapairs_status ON sierra_kb_qapairs(status);

CREATE INDEX IF NOT EXISTS idx_sierra_kb_embeddings_user ON sierra_kb_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_embeddings_source ON sierra_kb_embeddings(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_embeddings_vector ON sierra_kb_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_sierra_channels_user ON sierra_channels_config(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_channels_type ON sierra_channels_config(channel_type);

CREATE INDEX IF NOT EXISTS idx_sierra_sms_templates_user ON sierra_sms_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_sms_templates_trigger ON sierra_sms_templates(trigger_type);

CREATE INDEX IF NOT EXISTS idx_sierra_appointments_user ON sierra_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_appointments_contact ON sierra_appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_sierra_appointments_conversation ON sierra_appointments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sierra_appointments_start_time ON sierra_appointments(start_time);

CREATE INDEX IF NOT EXISTS idx_sierra_audit_user ON sierra_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_audit_entity ON sierra_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sierra_audit_created ON sierra_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sierra_webchat_sessions_user ON sierra_webchat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_webchat_sessions_token ON sierra_webchat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sierra_webchat_sessions_status ON sierra_webchat_sessions(status);

-- Enable Row Level Security
ALTER TABLE sierra_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_kb_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_kb_qapairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_kb_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_channels_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_webchat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sierra_config
CREATE POLICY "Users can view their own Sierra config"
  ON sierra_config FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own Sierra config"
  ON sierra_config FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Sierra config"
  ON sierra_config FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for sierra_behavior_profiles
CREATE POLICY "Users can view their own behavior profiles"
  ON sierra_behavior_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own behavior profiles"
  ON sierra_behavior_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own behavior profiles"
  ON sierra_behavior_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own behavior profiles"
  ON sierra_behavior_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sierra_kb_collections
CREATE POLICY "Users can view their own KB collections"
  ON sierra_kb_collections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own KB collections"
  ON sierra_kb_collections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own KB collections"
  ON sierra_kb_collections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own KB collections"
  ON sierra_kb_collections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sierra_kb_articles
CREATE POLICY "Users can view their own KB articles"
  ON sierra_kb_articles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own KB articles"
  ON sierra_kb_articles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own KB articles"
  ON sierra_kb_articles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own KB articles"
  ON sierra_kb_articles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sierra_kb_qapairs
CREATE POLICY "Users can view their own KB Q&A pairs"
  ON sierra_kb_qapairs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own KB Q&A pairs"
  ON sierra_kb_qapairs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own KB Q&A pairs"
  ON sierra_kb_qapairs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own KB Q&A pairs"
  ON sierra_kb_qapairs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sierra_kb_embeddings
CREATE POLICY "Users can view their own embeddings"
  ON sierra_kb_embeddings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own embeddings"
  ON sierra_kb_embeddings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own embeddings"
  ON sierra_kb_embeddings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sierra_channels_config
CREATE POLICY "Users can view their own channels config"
  ON sierra_channels_config FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own channels config"
  ON sierra_channels_config FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for sierra_sms_templates
CREATE POLICY "Users can view their own SMS templates"
  ON sierra_sms_templates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own SMS templates"
  ON sierra_sms_templates FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for sierra_appointments
CREATE POLICY "Users can view their own Sierra appointments"
  ON sierra_appointments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create Sierra appointments"
  ON sierra_appointments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Sierra appointments"
  ON sierra_appointments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for sierra_audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON sierra_audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create audit logs"
  ON sierra_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for sierra_webchat_sessions
CREATE POLICY "Users can view their own webchat sessions"
  ON sierra_webchat_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create webchat sessions"
  ON sierra_webchat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own webchat sessions"
  ON sierra_webchat_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function for semantic search
CREATE OR REPLACE FUNCTION sierra_search_knowledge_base(
  query_embedding vector(1536),
  search_user_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  source_type embedding_source_type,
  source_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.source_type,
    e.source_id,
    e.content,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM sierra_kb_embeddings e
  WHERE e.user_id = search_user_id
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sierra_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_sierra_config_updated_at
  BEFORE UPDATE ON sierra_config
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_behavior_profiles_updated_at
  BEFORE UPDATE ON sierra_behavior_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_kb_collections_updated_at
  BEFORE UPDATE ON sierra_kb_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_kb_articles_updated_at
  BEFORE UPDATE ON sierra_kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_kb_qapairs_updated_at
  BEFORE UPDATE ON sierra_kb_qapairs
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_channels_config_updated_at
  BEFORE UPDATE ON sierra_channels_config
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_sms_templates_updated_at
  BEFORE UPDATE ON sierra_sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_appointments_updated_at
  BEFORE UPDATE ON sierra_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

CREATE TRIGGER trigger_sierra_webchat_sessions_updated_at
  BEFORE UPDATE ON sierra_webchat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_updated_at();

-- Add comments for documentation
COMMENT ON TABLE sierra_config IS 'Main Sierra AI configuration per account';
COMMENT ON TABLE sierra_behavior_profiles IS 'AI agent personality and behavior rules';
COMMENT ON TABLE sierra_kb_collections IS 'Knowledge base content organization';
COMMENT ON TABLE sierra_kb_articles IS 'Full-text knowledge base articles';
COMMENT ON TABLE sierra_kb_qapairs IS 'Question-answer pairs with intent classification';
COMMENT ON TABLE sierra_kb_embeddings IS 'Vector embeddings for semantic search';
COMMENT ON TABLE sierra_channels_config IS 'Channel-specific configuration';
COMMENT ON TABLE sierra_sms_templates IS 'SMS message templates';
COMMENT ON TABLE sierra_appointments IS 'Appointments booked by Sierra AI';
COMMENT ON TABLE sierra_audit_logs IS 'Configuration change tracking';
COMMENT ON TABLE sierra_webchat_sessions IS 'Webchat visitor session tracking';