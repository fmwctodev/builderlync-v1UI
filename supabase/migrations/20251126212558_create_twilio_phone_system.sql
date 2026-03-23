/*
  # Create Twilio Phone System Tables

  1. New Tables
    - `phone_numbers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `phone_number` (text) - E.164 formatted phone number
      - `friendly_name` (text) - User-friendly label
      - `phone_number_sid` (text) - Twilio phone number SID
      - `capabilities` (jsonb) - Voice, SMS, MMS capabilities
      - `is_default` (boolean) - Default number for outbound calls
      - `country_code` (text) - Country code
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `twilio_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `account_sid` (text) - Twilio Account SID
      - `api_key` (text) - Twilio API Key
      - `api_secret` (text) - Twilio API Secret (encrypted)
      - `twiml_app_sid` (text) - TwiML App SID for voice
      - `call_recording_enabled` (boolean) - Auto-record calls
      - `voicemail_enabled` (boolean) - Enable voicemail
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `call_recordings`
      - `id` (uuid, primary key)
      - `call_log_id` (uuid, foreign key to call_logs)
      - `recording_sid` (text) - Twilio recording SID
      - `recording_url` (text) - URL to recording
      - `duration` (integer) - Recording duration in seconds
      - `file_size` (bigint) - File size in bytes
      - `status` (text) - processing, completed, failed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  friendly_name text NOT NULL,
  phone_number_sid text,
  capabilities jsonb DEFAULT '{"voice": true, "sms": true, "mms": false}'::jsonb,
  is_default boolean DEFAULT false,
  country_code text DEFAULT 'US',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS twilio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  account_sid text,
  api_key text,
  api_secret text,
  twiml_app_sid text,
  call_recording_enabled boolean DEFAULT false,
  voicemail_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_log_id uuid NOT NULL REFERENCES call_logs(id) ON DELETE CASCADE,
  recording_sid text,
  recording_url text NOT NULL,
  duration integer DEFAULT 0,
  file_size bigint DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own phone numbers"
  ON phone_numbers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own phone numbers"
  ON phone_numbers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own phone numbers"
  ON phone_numbers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own phone numbers"
  ON phone_numbers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own Twilio settings"
  ON twilio_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own Twilio settings"
  ON twilio_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Twilio settings"
  ON twilio_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own Twilio settings"
  ON twilio_settings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own call recordings"
  ON call_recordings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM call_logs
      WHERE call_logs.id = call_recordings.call_log_id
      AND call_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create call recordings for their calls"
  ON call_recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_logs
      WHERE call_logs.id = call_recordings.call_log_id
      AND call_logs.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_is_default ON phone_numbers(is_default);
CREATE INDEX IF NOT EXISTS idx_twilio_settings_user_id ON twilio_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_call_log_id ON call_recordings(call_log_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_status ON call_recordings(status);
