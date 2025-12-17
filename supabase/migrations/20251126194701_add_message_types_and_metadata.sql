/*
  # Add Message Types and Metadata to Team Messaging

  1. Changes
    - Add `message_type` column to team_messages table (sms, whatsapp, email, internal_comment)
    - Add `email_metadata` jsonb column for email-specific data (subject, cc, bcc, from_name, from_email)
    - Add `sms_metadata` jsonb column for SMS-specific data (from_number, to_number, character_count, segment_count)
    - Add `is_internal` boolean column to mark internal comments
    - Add indexes for performance
    - Update existing messages to have default type 'sms'

  2. Security
    - Internal comments should only be visible to authenticated organization members
    - Update RLS policies if needed
*/

-- Add message_type column with enum values
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_channel_type') THEN
    CREATE TYPE message_channel_type AS ENUM ('sms', 'whatsapp', 'email', 'internal_comment');
  END IF;
END $$;

-- Add columns to team_messages
ALTER TABLE team_messages 
  ADD COLUMN IF NOT EXISTS message_type message_channel_type DEFAULT 'sms',
  ADD COLUMN IF NOT EXISTS email_metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sms_metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_messages_type ON team_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_team_messages_internal ON team_messages(is_internal);
CREATE INDEX IF NOT EXISTS idx_team_messages_type_conversation ON team_messages(conversation_id, message_type);

-- Update existing messages to have default type
UPDATE team_messages 
SET message_type = 'sms', is_internal = false 
WHERE message_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN team_messages.message_type IS 'Type of message: sms, whatsapp, email, or internal_comment';
COMMENT ON COLUMN team_messages.email_metadata IS 'Email-specific data: {from_name, from_email, to_emails, cc_emails, bcc_emails, subject}';
COMMENT ON COLUMN team_messages.sms_metadata IS 'SMS-specific data: {from_number, to_number, character_count, segment_count}';
COMMENT ON COLUMN team_messages.is_internal IS 'Whether this is an internal comment not visible to contacts';