/*
  # Add Security Settings to AI Agents

  1. New Columns
    - `authentication_enabled` (boolean) - Require users to authenticate before connecting
    - `allowlist` (text[]) - Array of allowed host domains
    - `overrides` (jsonb) - Client-overrideable configuration settings
    - `conversation_initiation_webhook` (jsonb) - Webhook for fetching conversation initiation client data
    - `post_call_webhook` (jsonb) - Webhook URL for post-call automation
    - `daily_call_limit` (integer) - Maximum number of calls allowed per day
    - `concurrent_call_limit` (integer) - Maximum concurrent calls (-1 = use subscription limit)
    - `bursting_enabled` (boolean) - Allow exceeding subscription limit with double rate

  2. Default Values
    - Authentication disabled by default
    - Empty allowlist by default
    - All overrides disabled by default
    - Webhooks disabled/null by default
    - Daily limit: 100000 calls per day
    - Concurrent limit: -1 (use subscription limit)
    - Bursting enabled by default

  3. Security
    - Fields are optional and backward compatible
    - Proper validation constraints added
    - RLS policies already cover these columns through existing table policies
*/

-- Add authentication_enabled column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'authentication_enabled'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN authentication_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Add allowlist column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'allowlist'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN allowlist text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Add overrides column with default structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'overrides'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN overrides jsonb DEFAULT '{
      "agent_language": false,
      "first_message": false,
      "system_prompt": false,
      "llm": false,
      "voice": false,
      "voice_speed": false,
      "voice_stability": false,
      "voice_similarity": false,
      "text_only": false
    }'::jsonb;
  END IF;
END $$;

-- Add conversation_initiation_webhook column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'conversation_initiation_webhook'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN conversation_initiation_webhook jsonb DEFAULT '{
      "url": null,
      "enabled": false
    }'::jsonb;
  END IF;
END $$;

-- Add post_call_webhook column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'post_call_webhook'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN post_call_webhook jsonb DEFAULT '{
      "url": null,
      "enabled": false
    }'::jsonb;
  END IF;
END $$;

-- Add daily_call_limit column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'daily_call_limit'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN daily_call_limit integer DEFAULT 100000;
  END IF;
END $$;

-- Add concurrent_call_limit column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'concurrent_call_limit'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN concurrent_call_limit integer DEFAULT -1;
  END IF;
END $$;

-- Add bursting_enabled column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'bursting_enabled'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN bursting_enabled boolean DEFAULT true;
  END IF;
END $$;

-- Add check constraint for daily_call_limit (must be positive or -1)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'ai_agents' AND constraint_name = 'ai_agents_daily_call_limit_check'
  ) THEN
    ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_daily_call_limit_check
      CHECK (daily_call_limit >= -1);
  END IF;
END $$;

-- Add check constraint for concurrent_call_limit (must be positive or -1)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'ai_agents' AND constraint_name = 'ai_agents_concurrent_call_limit_check'
  ) THEN
    ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_concurrent_call_limit_check
      CHECK (concurrent_call_limit >= -1);
  END IF;
END $$;

-- Create index on authentication_enabled for performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_authentication_enabled ON ai_agents(authentication_enabled);

-- Create index on daily_call_limit for usage queries
CREATE INDEX IF NOT EXISTS idx_ai_agents_daily_call_limit ON ai_agents(daily_call_limit);