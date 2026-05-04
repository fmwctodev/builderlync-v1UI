-- Add ElevenLabs integration fields to ai_agents table
ALTER TABLE ai_agents
ADD COLUMN IF NOT EXISTS elevenlabs_agent_id TEXT,
ADD COLUMN IF NOT EXISTS voice_id TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS temperature DECIMAL(3,2) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 500;

-- Add ElevenLabs integration fields to phone_numbers table
ALTER TABLE phone_numbers
ADD COLUMN IF NOT EXISTS elevenlabs_phone_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_agents_elevenlabs_agent_id ON ai_agents(elevenlabs_agent_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_elevenlabs_phone_id ON phone_numbers(elevenlabs_phone_id);

-- Add comments
COMMENT ON COLUMN ai_agents.elevenlabs_agent_id IS 'ElevenLabs agent ID for voice AI integration';
COMMENT ON COLUMN ai_agents.voice_id IS 'ElevenLabs voice ID for the agent';
COMMENT ON COLUMN ai_agents.language IS 'Primary language for the agent (ISO 639-1 code)';
COMMENT ON COLUMN ai_agents.temperature IS 'LLM temperature setting (0.0 to 1.0)';
COMMENT ON COLUMN ai_agents.max_tokens IS 'Maximum tokens for LLM responses';
COMMENT ON COLUMN phone_numbers.elevenlabs_phone_id IS 'ElevenLabs phone number ID';
