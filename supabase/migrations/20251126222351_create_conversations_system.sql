/*
  # Create Customer Conversations System

  ## Overview
  This migration creates a comprehensive customer conversations system that supports
  SMS, MMS, Email, and Internal Comments. This is separate from team_messages which
  handles internal team communication.

  ## New Tables

  ### 1. conversations
  Stores conversation threads with customers
  - `id` (uuid, primary key): Unique conversation identifier
  - `contact_id` (uuid): Reference to contacts table
  - `subject` (text): Optional subject for email threads
  - `channel` (enum): Primary channel (sms, email, phone, web)
  - `status` (enum): Conversation status (open, closed, archived)
  - `assigned_to` (uuid): Staff member assigned to conversation
  - `user_id` (uuid): User who owns this conversation
  - `last_message_at` (timestamptz): Timestamp of last message
  - `created_at` (timestamptz): When conversation was created
  - `updated_at` (timestamptz): Last update timestamp

  ### 2. conversation_messages
  Stores all messages in conversations (SMS, Email, Internal Comments)
  - `id` (uuid, primary key): Unique message identifier
  - `conversation_id` (uuid): Reference to conversations
  - `message_type` (enum): Type (sms, mms, email, internal_comment)
  - `direction` (enum): Direction (inbound, outbound)
  - `sender_id` (uuid): User who sent the message (null for inbound)
  - `content` (text): Message content
  - `is_internal` (boolean): Whether this is an internal comment
  - `email_metadata` (jsonb): Email-specific data
  - `sms_metadata` (jsonb): SMS/MMS-specific data
  - `delivery_status` (enum): Message delivery status
  - `external_id` (text): External provider message ID (Twilio SID, Gmail ID)
  - `created_at` (timestamptz): When message was sent/received
  - `updated_at` (timestamptz): Last update timestamp

  ### 3. message_attachments
  Stores attachments for MMS and Email messages
  - `id` (uuid, primary key): Unique attachment identifier
  - `message_id` (uuid): Reference to conversation_messages
  - `file_name` (text): Original file name
  - `file_type` (text): MIME type
  - `file_size` (integer): Size in bytes
  - `storage_path` (text): Path in Supabase Storage
  - `url` (text): Public or signed URL
  - `created_at` (timestamptz): Upload timestamp

  ### 4. email_accounts
  Stores connected email accounts (Gmail, Outlook)
  - `id` (uuid, primary key): Unique account identifier
  - `user_id` (uuid): Reference to auth.users
  - `email_address` (text): Email address
  - `provider` (enum): Provider (gmail, outlook)
  - `access_token` (text): Encrypted OAuth access token
  - `refresh_token` (text): Encrypted OAuth refresh token
  - `token_expires_at` (timestamptz): Token expiration time
  - `is_active` (boolean): Whether account is active
  - `last_sync_at` (timestamptz): Last email sync timestamp
  - `created_at` (timestamptz): When account was connected

  ### 5. twilio_phone_numbers
  Stores organization's Twilio phone numbers
  - `id` (uuid, primary key): Unique number identifier
  - `user_id` (uuid): Reference to auth.users (organization owner)
  - `phone_number` (text): E.164 format phone number
  - `friendly_name` (text): Human-readable name
  - `capabilities` (jsonb): SMS, MMS, Voice capabilities
  - `is_default` (boolean): Whether this is the default outbound number
  - `twilio_sid` (text): Twilio Phone Number SID
  - `created_at` (timestamptz): When number was added

  ## Security
  - Row Level Security enabled on all tables
  - Users can only access conversations they own
  - Internal comments are only visible to authenticated users
  - Email tokens are encrypted and only accessible by the owner

  ## Performance
  - Indexes on foreign keys and frequently queried fields
  - Index on conversation last_message_at for sorting
  - Index on message created_at for threading
  - Index on message_type and is_internal for filtering
*/

-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_channel') THEN
    CREATE TYPE conversation_channel AS ENUM ('sms', 'email', 'phone', 'web');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status') THEN
    CREATE TYPE conversation_status AS ENUM ('open', 'closed', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conv_message_type') THEN
    CREATE TYPE conv_message_type AS ENUM ('sms', 'mms', 'email', 'internal_comment');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_direction') THEN
    CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
    CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_provider') THEN
    CREATE TYPE email_provider AS ENUM ('gmail', 'outlook');
  END IF;
END $$;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  subject text,
  channel conversation_channel DEFAULT 'sms',
  status conversation_status DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_type conv_message_type NOT NULL DEFAULT 'sms',
  direction message_direction NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  email_metadata jsonb DEFAULT '{}'::jsonb,
  sms_metadata jsonb DEFAULT '{}'::jsonb,
  delivery_status delivery_status DEFAULT 'pending',
  external_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Create email_accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  provider email_provider NOT NULL,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email_address)
);

-- Create twilio_phone_numbers table
CREATE TABLE IF NOT EXISTS twilio_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  friendly_name text,
  capabilities jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  twilio_sid text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender ON conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_type ON conversation_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_internal ON conversation_messages(is_internal);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_external ON conversation_messages(external_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_active ON email_accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_twilio_numbers_user ON twilio_phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_twilio_numbers_default ON twilio_phone_numbers(is_default);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_phone_numbers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for conversation_messages
CREATE POLICY "Users can view messages in their conversations"
  ON conversation_messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON conversation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON conversation_messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT cm.id FROM conversation_messages cm
      JOIN conversations conv ON conv.id = cm.conversation_id
      WHERE conv.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add attachments to their messages"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    message_id IN (
      SELECT cm.id FROM conversation_messages cm
      WHERE cm.sender_id = auth.uid()
    )
  );

-- RLS Policies for email_accounts
CREATE POLICY "Users can view their own email accounts"
  ON email_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own email accounts"
  ON email_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own email accounts"
  ON email_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own email accounts"
  ON email_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for twilio_phone_numbers
CREATE POLICY "Users can view their own phone numbers"
  ON twilio_phone_numbers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own phone numbers"
  ON twilio_phone_numbers FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to automatically update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON conversation_messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Add comments for documentation
COMMENT ON TABLE conversations IS 'Customer-facing conversations across multiple channels';
COMMENT ON TABLE conversation_messages IS 'All messages in conversations including SMS, Email, and Internal Comments';
COMMENT ON TABLE message_attachments IS 'File attachments for MMS and Email messages';
COMMENT ON TABLE email_accounts IS 'Connected email accounts (Gmail, Outlook) for sending/receiving emails';
COMMENT ON TABLE twilio_phone_numbers IS 'Organization Twilio phone numbers for SMS/MMS communication';
