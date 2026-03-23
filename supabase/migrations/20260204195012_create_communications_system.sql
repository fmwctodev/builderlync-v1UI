/*
  # Create Communications System Tables
  
  1. New Tables
    - message_attachments: Message attachments
    - team_conversations: Team internal conversations
    - team_conversation_participants: Team conversation members
    - team_messages: Team messages
    - team_message_reads: Message read receipts
    - phone_numbers: Organization phone numbers
    - twilio_settings: Twilio configuration
    - twilio_phone_numbers: Twilio phone numbers
    - call_recordings: Call recordings
    - email_accounts: Connected email accounts
    - email_templates: Email templates
    - sms_templates: SMS templates
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Message Attachments Table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  thumbnail_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view message attachments in their org"
    ON message_attachments FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM messages
        JOIN user_organizations ON user_organizations.organization_id = messages.organization_id
        WHERE messages.id = message_attachments.message_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Team Conversations Table
CREATE TABLE IF NOT EXISTS team_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text,
  type text DEFAULT 'direct',
  description text,
  is_archived boolean DEFAULT false,
  last_message_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view team conversations in their org"
    ON team_conversations FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = team_conversations.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create team conversations in their org"
    ON team_conversations FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = team_conversations.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Team Conversation Participants Table
CREATE TABLE IF NOT EXISTS team_conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES team_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  is_muted boolean DEFAULT false,
  last_read_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE team_conversation_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their team conversation memberships"
    ON team_conversation_participants FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Team Messages Table
CREATE TABLE IF NOT EXISTS team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES team_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  reply_to_id uuid REFERENCES team_messages(id),
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view team messages they are part of"
    ON team_messages FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM team_conversation_participants
        WHERE team_conversation_participants.conversation_id = team_messages.conversation_id
        AND team_conversation_participants.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send team messages"
    ON team_messages FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM team_conversation_participants
        WHERE team_conversation_participants.conversation_id = team_messages.conversation_id
        AND team_conversation_participants.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Team Message Reads Table
CREATE TABLE IF NOT EXISTS team_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES team_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE team_message_reads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their message reads"
    ON team_message_reads FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Phone Numbers Table
CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  friendly_name text,
  type text DEFAULT 'local',
  capabilities jsonb DEFAULT '{"voice": true, "sms": true}'::jsonb,
  provider text DEFAULT 'twilio',
  provider_sid text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  assigned_to uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage phone numbers in their org"
    ON phone_numbers FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = phone_numbers.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Twilio Settings Table
CREATE TABLE IF NOT EXISTS twilio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  account_sid text,
  auth_token text,
  twiml_app_sid text,
  messaging_service_sid text,
  is_configured boolean DEFAULT false,
  last_verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE twilio_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage Twilio settings in their org"
    ON twilio_settings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = twilio_settings.organization_id
        AND user_organizations.user_id = auth.uid()
        AND user_organizations.role IN ('owner', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Twilio Phone Numbers Table
CREATE TABLE IF NOT EXISTS twilio_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  phone_number_sid text,
  friendly_name text,
  capabilities jsonb DEFAULT '{"voice": true, "sms": true, "mms": true}'::jsonb,
  voice_url text,
  sms_url text,
  status_callback_url text,
  is_active boolean DEFAULT true,
  monthly_cost numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, phone_number)
);

ALTER TABLE twilio_phone_numbers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage Twilio phone numbers in their org"
    ON twilio_phone_numbers FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = twilio_phone_numbers.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Call Recordings Table
CREATE TABLE IF NOT EXISTS call_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_log_id uuid NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE,
  recording_sid text,
  recording_url text NOT NULL,
  duration_seconds integer,
  file_size bigint,
  transcription text,
  transcription_status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view call recordings in their org"
    ON call_recordings FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM call_logs
        JOIN user_organizations ON user_organizations.organization_id = call_logs.organization_id
        WHERE call_logs.id = call_recordings.call_log_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Email Accounts Table
CREATE TABLE IF NOT EXISTS email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  display_name text,
  provider text,
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  imap_host text,
  imap_port integer,
  use_ssl boolean DEFAULT true,
  is_default boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage email accounts in their org"
    ON email_accounts FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = email_accounts.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  body_html text,
  body_text text,
  category text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage email templates in their org"
    ON email_templates FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = email_templates.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text NOT NULL,
  category text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage SMS templates in their org"
    ON sms_templates FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = sms_templates.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_team_conversations_org ON team_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_conversation_participants_conv ON team_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_team_conversation_participants_user ON team_conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_conv ON team_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_user ON team_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_team_message_reads_message ON team_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_org ON phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_twilio_phone_numbers_org ON twilio_phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_call ON call_recordings(call_log_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_org ON email_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_org ON sms_templates(organization_id);
