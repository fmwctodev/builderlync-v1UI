-- Add is_read column to conversation_messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_messages' 
    AND column_name = 'is_read'
  ) THEN
    ALTER TABLE conversation_messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add index for faster unread queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_is_read 
  ON conversation_messages(conversation_id, is_read) 
  WHERE is_read = false;

-- Add read_at timestamp to track when message was read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversation_messages' 
    AND column_name = 'read_at'
  ) THEN
    ALTER TABLE conversation_messages ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- Update existing inbound messages to be unread
UPDATE conversation_messages 
SET is_read = false 
WHERE direction = 'inbound' AND is_read IS NULL;

-- Update existing outbound messages to be read
UPDATE conversation_messages 
SET is_read = true 
WHERE direction = 'outbound' AND is_read IS NULL;

COMMENT ON COLUMN conversation_messages.is_read IS 'Whether the message has been read by the recipient';
COMMENT ON COLUMN conversation_messages.read_at IS 'Timestamp when the message was marked as read';
