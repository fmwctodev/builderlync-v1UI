/*
  # Create Team Messaging System

  ## Overview
  This migration creates a comprehensive team messaging system that allows internal
  communication between staff and sub-contractor contacts. Supports both individual
  and group conversations with message threading.

  ## New Tables

  ### 1. team_conversations
  Stores conversation metadata for both individual and group conversations
  - `id` (uuid, primary key): Unique conversation identifier
  - `name` (text): Optional name for group conversations
  - `is_group` (boolean): Whether this is a group conversation
  - `created_by` (uuid): User who created the conversation
  - `created_at` (timestamptz): When conversation was created
  - `updated_at` (timestamptz): Last activity timestamp

  ### 2. team_conversation_participants
  Tracks who is part of each conversation
  - `id` (uuid, primary key): Unique participant record
  - `conversation_id` (uuid): Reference to team_conversations
  - `contact_id` (uuid): Reference to contacts table
  - `joined_at` (timestamptz): When participant was added
  - Unique constraint on (conversation_id, contact_id)

  ### 3. team_messages
  Stores all messages sent in team conversations
  - `id` (uuid, primary key): Unique message identifier
  - `conversation_id` (uuid): Reference to team_conversations
  - `sender_id` (uuid): User who sent the message
  - `content` (text): Message content
  - `created_at` (timestamptz): When message was sent
  - `updated_at` (timestamptz): Last edit timestamp

  ### 4. team_message_reads
  Tracks read status for each participant per message
  - `id` (uuid, primary key): Unique read record
  - `message_id` (uuid): Reference to team_messages
  - `contact_id` (uuid): Who read the message
  - `read_at` (timestamptz): When message was read
  - Unique constraint on (message_id, contact_id)

  ## Security
  - Row Level Security enabled on all tables
  - Users can only access conversations they're part of
  - Restrictive policies ensure data privacy

  ## Performance
  - Indexes on foreign keys and frequently queried fields
  - Index on conversation updated_at for sorting
  - Index on message created_at for threading
*/

-- Create team_conversations table
CREATE TABLE IF NOT EXISTS team_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  is_group boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_conversation_participants table
CREATE TABLE IF NOT EXISTS team_conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES team_conversations(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, contact_id)
);

-- Create team_messages table
CREATE TABLE IF NOT EXISTS team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES team_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_message_reads table
CREATE TABLE IF NOT EXISTS team_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES team_messages(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, contact_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_conversations_created_by ON team_conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_team_conversations_updated_at ON team_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_conversation_participants_conversation ON team_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_team_conversation_participants_contact ON team_conversation_participants(contact_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_conversation ON team_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_message_reads_message ON team_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_team_message_reads_contact ON team_message_reads(contact_id);

-- Enable Row Level Security
ALTER TABLE team_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_message_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_conversations
CREATE POLICY "Users can view conversations they are part of"
  ON team_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_conversation_participants tcp
      JOIN contacts c ON c.id = tcp.contact_id
      WHERE tcp.conversation_id = team_conversations.id
      AND c.user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create conversations"
  ON team_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own conversations"
  ON team_conversations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own conversations"
  ON team_conversations FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for team_conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON team_conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_conversation_participants tcp
      JOIN contacts c ON c.id = tcp.contact_id
      WHERE tcp.conversation_id = team_conversation_participants.conversation_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to their conversations"
  ON team_conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_conversations
      WHERE id = conversation_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can remove participants from their conversations"
  ON team_conversation_participants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_conversations
      WHERE id = conversation_id
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for team_messages
CREATE POLICY "Users can view messages in their conversations"
  ON team_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_conversation_participants tcp
      JOIN contacts c ON c.id = tcp.contact_id
      WHERE tcp.conversation_id = team_messages.conversation_id
      AND c.user_id = auth.uid()
    ) OR sender_id = auth.uid()
  );

CREATE POLICY "Users can send messages to their conversations"
  ON team_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM team_conversation_participants tcp
      JOIN contacts c ON c.id = tcp.contact_id
      WHERE tcp.conversation_id = team_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON team_messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON team_messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- RLS Policies for team_message_reads
CREATE POLICY "Users can view read status in their conversations"
  ON team_message_reads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_messages tm
      JOIN team_conversation_participants tcp ON tcp.conversation_id = tm.conversation_id
      JOIN contacts c ON c.id = tcp.contact_id
      WHERE tm.id = team_message_reads.message_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON team_message_reads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts c
      WHERE c.id = contact_id
      AND c.user_id = auth.uid()
    )
  );

-- Function to automatically update conversation updated_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE team_conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON team_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON team_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();