/*
  # Add template_id column to ai_agents table

  ## Overview
  Adds the missing template_id column to the ai_agents table.
  This column stores the template identifier used when creating an agent.

  ## Changes
  - Add `template_id` (text, nullable) column to ai_agents table
*/

-- Add template_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_agents' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE ai_agents ADD COLUMN template_id text;
  END IF;
END $$;
