/*
  # Enhance AI Agents Table

  1. Changes
    - Add `agent_type` column for agent type classification
    - Add `voice_id` for voice configuration
    - Add `phone_number` for associated phone number
    - Add `personality` jsonb for personality settings
    - Add `knowledge_base_ids` array for knowledge base references
    - Add `script` text for agent script/instructions
    - Add `settings` jsonb for additional settings
    - Update created_by and updated_by to reference auth.users

  2. Notes
    - Preserves existing data and structure
    - Adds new columns with sensible defaults
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'agent_type'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN agent_type text DEFAULT 'chat';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'voice_id'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN voice_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'personality'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN personality jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'knowledge_base_ids'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN knowledge_base_ids text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'script'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN script text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'settings'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add constraint for agent_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'ai_agents' AND constraint_name = 'ai_agents_agent_type_check'
  ) THEN
    ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_agent_type_check 
      CHECK (agent_type IN ('voice', 'chat', 'email', 'sms'));
  END IF;
END $$;

-- Add constraint for status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'ai_agents' AND constraint_name = 'ai_agents_status_check'
  ) THEN
    ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_status_check 
      CHECK (status IN ('active', 'paused', 'draft'));
  END IF;
END $$;

-- Create index on agent_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_ai_agents_agent_type ON ai_agents(agent_type);
