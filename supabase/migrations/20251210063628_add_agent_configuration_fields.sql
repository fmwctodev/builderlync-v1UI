/*
  # Add AI Agent Configuration Fields

  1. New Columns
    - `system_prompt` (text) - Stores the agent's system instructions/prompt
    - `voices` (jsonb) - Array of voice configurations with primary/secondary designations
    - `languages` (jsonb) - Array of supported languages with default language designation
    - `first_message` (text) - Initial greeting message the agent will say
    - `first_message_interruptible` (boolean) - Whether the first message can be interrupted
    - `llm_model` (text) - LLM provider and model to use (e.g., "Gemini 2.5 Flash")
    - `default_personality` (boolean) - Whether to use default personality settings
    - `timezone` (text) - Timezone for the agent

  2. Changes
    - All fields are optional and have sensible defaults
    - Voices and languages stored as JSONB arrays for flexibility
    - Backward compatible with existing agent records

  3. Notes
    - System prompt provides instructions for agent behavior
    - Multiple voices can be configured with one marked as primary
    - Multiple languages can be supported with one marked as default
    - First message can be customized per agent
*/

-- Add system_prompt column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'system_prompt'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN system_prompt text;
  END IF;
END $$;

-- Add voices column (stores array of voice objects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'voices'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN voices jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add languages column (stores array of language objects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'languages'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN languages jsonb DEFAULT '[{"code": "en", "name": "English", "isDefault": true}]'::jsonb;
  END IF;
END $$;

-- Add first_message column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'first_message'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN first_message text;
  END IF;
END $$;

-- Add first_message_interruptible column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'first_message_interruptible'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN first_message_interruptible boolean DEFAULT false;
  END IF;
END $$;

-- Add llm_model column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'llm_model'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN llm_model text DEFAULT 'Gemini 2.5 Flash';
  END IF;
END $$;

-- Add default_personality column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'default_personality'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN default_personality boolean DEFAULT true;
  END IF;
END $$;

-- Add timezone column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN timezone text DEFAULT 'America/New_York';
  END IF;
END $$;