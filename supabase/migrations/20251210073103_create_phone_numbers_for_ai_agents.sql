/*
  # Create Phone Numbers Table for AI Agent Integration

  ## Overview
  This migration creates a phone_numbers table to support:
  - Organization-level phone number management (multi-tenant)
  - Exclusive assignment to AI agents
  - Phone number type classification
  - Status tracking synced from Twilio
  - Complete Twilio integration

  ## New Table

  ### `phone_numbers`
  Stores phone numbers imported from Twilio and their assignments
  - `id` (uuid, primary key)
  - `organization_id` (uuid, references organizations) - Multi-tenant isolation
  - `user_id` (uuid, references auth.users) - Legacy user reference
  - `phone_number` (text) - E.164 formatted phone number
  - `friendly_name` (text) - User-friendly label
  - `twilio_sid` (text) - Twilio phone number SID
  - `phone_number_type` (text) - Type classification (local, toll-free, mobile, short-code)
  - `capabilities` (jsonb) - Voice, SMS, MMS capabilities synced from Twilio
  - `status` (text) - active or inactive status synced from Twilio
  - `assigned_agent_id` (uuid, references ai_agents) - Exclusive agent assignment
  - `is_default` (boolean) - Default number for outbound calls
  - `country_code` (text) - Country code
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS with organization-level isolation
  - Only organization members can manage their organization's phone numbers
  - UNIQUE constraint on assigned_agent_id for exclusive assignment

  ## Performance
  - Indexes on organization_id, assigned_agent_id, phone_number_type, status
  - Index on twilio_sid for lookups
*/

-- Create phone_numbers table
CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  friendly_name text NOT NULL,
  twilio_sid text,
  phone_number_type text DEFAULT 'local' CHECK (phone_number_type IN ('local', 'toll-free', 'mobile', 'short-code')),
  capabilities jsonb DEFAULT '{"voice": true, "sms": true, "mms": false}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  is_default boolean DEFAULT false,
  country_code text DEFAULT 'US',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, phone_number),
  UNIQUE(assigned_agent_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_organization_id ON phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_assigned_agent_id ON phone_numbers(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_type ON phone_numbers(phone_number_type);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_twilio_sid ON phone_numbers(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);

-- Enable RLS
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create organization-scoped RLS policies
CREATE POLICY "Users can view phone numbers in their organization"
  ON phone_numbers FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create phone numbers in their organization"
  ON phone_numbers FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update phone numbers in their organization"
  ON phone_numbers FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete phone numbers in their organization"
  ON phone_numbers FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
