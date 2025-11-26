/*
  # Create Call Logs System

  1. New Tables
    - `call_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - User who initiated/received the call
      - `contact_id` (uuid, foreign key to contacts) - Contact associated with the call
      - `from_number` (text) - The number the call was made from
      - `to_number` (text) - The number the call was made to
      - `direction` (text) - 'inbound' or 'outbound'
      - `status` (text) - 'completed', 'missed', 'busy', 'no-answer', 'failed'
      - `duration` (integer) - Call duration in seconds
      - `recording_url` (text) - URL to call recording if available
      - `notes` (text) - Call notes
      - `call_sid` (text) - Twilio call SID or other provider ID
      - `started_at` (timestamptz) - When the call started
      - `ended_at` (timestamptz) - When the call ended
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `call_logs` table
    - Add policies for users to read their own call logs
    - Add policies for users to create their own call logs
    - Add policies for users to update their own call logs
*/

CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  from_number text NOT NULL,
  to_number text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status text NOT NULL CHECK (status IN ('completed', 'missed', 'busy', 'no-answer', 'failed', 'in-progress')),
  duration integer DEFAULT 0,
  recording_url text,
  notes text,
  call_sid text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call logs"
  ON call_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own call logs"
  ON call_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own call logs"
  ON call_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own call logs"
  ON call_logs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact_id ON call_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_direction ON call_logs(direction);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_from_number ON call_logs(from_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_to_number ON call_logs(to_number);
