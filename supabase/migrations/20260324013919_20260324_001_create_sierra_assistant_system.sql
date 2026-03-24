/*
  # Sierra Assistant System - Core Tables

  ## Summary
  Creates the core tables for the Sierra AI executive assistant (internal copilot),
  completely separate from the existing Sierra AI agents module.

  The database uses user_id for data scoping (no organizations table exists).
  RLS policies restrict access to the owning user only.

  ## New Tables

  ### assistant_profiles
  - Per-user settings: confirm_all_writes toggle, system_prompt_override, preferences

  ### assistant_threads
  - Conversation threads scoped to user_id
  - Tracks page context (context_module + context_record_id) for context-aware chats
  - title, is_archived, last_message_at

  ### assistant_messages
  - Individual messages per thread
  - role: user | assistant | system
  - message_type: text | plan | execution_result | draft_preview | error | report
  - tool_calls and metadata stored as JSONB

  ### assistant_user_memory
  - Short-term key-value memory per user
  - Categories: scheduling | communication | preferences | contacts | rules | general
  - UPSERT on (user_id, memory_key)

  ### sierra_memories
  - Long-term semantic vector memory using vector(1536)
  - IVFFlat index for cosine similarity search
  - importance_score for decay

  ### assistant_execution_requests
  - Pending/completed ITS action plans
  - Tracks approval workflow (awaiting_confirmation → confirmed/rejected)

  ### assistant_action_logs
  - Per-action audit trail with execution time and result

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data (auth.uid() = user_id)

  ## Functions
  - search_sierra_memories: cosine similarity vector search RPC
  - decrement_sierra_memory_score: daily importance decay
*/

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- assistant_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  confirm_all_writes boolean DEFAULT true,
  system_prompt_override text,
  preferred_name text,
  timezone text DEFAULT 'America/New_York',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assistant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own assistant profile"
  ON assistant_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistant profile"
  ON assistant_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assistant profile"
  ON assistant_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- assistant_threads
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  context_module text,
  context_record_id text,
  is_archived boolean DEFAULT false,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_threads_user ON assistant_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_threads_last_message ON assistant_threads(last_message_at DESC);

ALTER TABLE assistant_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own threads"
  ON assistant_threads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON assistant_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON assistant_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON assistant_threads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- assistant_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'plan', 'execution_result', 'draft_preview', 'error', 'report')),
  tool_calls jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_thread ON assistant_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_user ON assistant_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_created ON assistant_messages(created_at ASC);

ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own messages"
  ON assistant_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON assistant_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON assistant_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- assistant_user_memory
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_key text NOT NULL,
  memory_value text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('scheduling', 'communication', 'preferences', 'contacts', 'rules', 'general')),
  importance_score numeric(3,2) DEFAULT 1.0,
  last_accessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, memory_key)
);

CREATE INDEX IF NOT EXISTS idx_assistant_memory_user ON assistant_user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_category ON assistant_user_memory(category);

ALTER TABLE assistant_user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own memory"
  ON assistant_user_memory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memory"
  ON assistant_user_memory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memory"
  ON assistant_user_memory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memory"
  ON assistant_user_memory FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- sierra_memories (semantic vector memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS sierra_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  memory_type text DEFAULT 'general' CHECK (memory_type IN ('fact', 'preference', 'instruction', 'context', 'general')),
  importance_score numeric(3,2) DEFAULT 1.0,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sierra_memories_user ON sierra_memories(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sierra_memories_embedding'
  ) THEN
    CREATE INDEX idx_sierra_memories_embedding ON sierra_memories
      USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
END $$;

ALTER TABLE sierra_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own sierra memories"
  ON sierra_memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sierra memories"
  ON sierra_memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sierra memories"
  ON sierra_memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sierra memories"
  ON sierra_memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- assistant_execution_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_execution_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
  message_id uuid REFERENCES assistant_messages(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  results jsonb DEFAULT '[]'::jsonb,
  execution_status text DEFAULT 'pending' CHECK (execution_status IN ('pending', 'awaiting_confirmation', 'confirmed', 'rejected', 'executing', 'completed', 'failed', 'partial')),
  requires_confirmation boolean DEFAULT true,
  approved_action_ids jsonb DEFAULT '[]'::jsonb,
  rejected_action_ids jsonb DEFAULT '[]'::jsonb,
  response_to_user text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_execution_requests_thread ON assistant_execution_requests(thread_id);
CREATE INDEX IF NOT EXISTS idx_execution_requests_user ON assistant_execution_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_requests_status ON assistant_execution_requests(execution_status);

ALTER TABLE assistant_execution_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own execution requests"
  ON assistant_execution_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own execution requests"
  ON assistant_execution_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own execution requests"
  ON assistant_execution_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- assistant_action_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS assistant_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_request_id uuid REFERENCES assistant_execution_requests(id) ON DELETE SET NULL,
  thread_id uuid REFERENCES assistant_threads(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_module text,
  resource_id text,
  payload jsonb DEFAULT '{}'::jsonb,
  result jsonb DEFAULT '{}'::jsonb,
  execution_status text DEFAULT 'pending' CHECK (execution_status IN ('pending', 'success', 'failed', 'skipped')),
  execution_time_ms integer,
  error_message text,
  confirmed_by_user boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_logs_user ON assistant_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_thread ON assistant_action_logs(thread_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_created ON assistant_action_logs(created_at DESC);

ALTER TABLE assistant_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own action logs"
  ON assistant_action_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action logs"
  ON assistant_action_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RPC: search_sierra_memories
-- ============================================================
CREATE OR REPLACE FUNCTION search_sierra_memories(
  p_user_id uuid,
  p_embedding vector(1536),
  p_match_threshold float DEFAULT 0.7,
  p_match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  memory_type text,
  importance_score numeric,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sm.id,
    sm.content,
    sm.memory_type,
    sm.importance_score,
    (1 - (sm.embedding <=> p_embedding))::float AS similarity
  FROM sierra_memories sm
  WHERE sm.user_id = p_user_id
    AND sm.embedding IS NOT NULL
    AND (1 - (sm.embedding <=> p_embedding)) > p_match_threshold
  ORDER BY sm.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$;

-- ============================================================
-- RPC: decrement_sierra_memory_score (daily decay)
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_sierra_memory_score()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE sierra_memories
  SET importance_score = GREATEST(0.1, importance_score - 0.05),
      updated_at = now()
  WHERE importance_score > 0.1;

  UPDATE assistant_user_memory
  SET importance_score = GREATEST(0.1, importance_score - 0.02),
      updated_at = now()
  WHERE importance_score > 0.1;
END;
$$;
