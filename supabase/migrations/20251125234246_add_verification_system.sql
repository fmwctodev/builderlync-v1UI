/*
  # Add Contact Verification System

  ## Overview
  This migration adds a comprehensive verification system for contact phone numbers
  and email addresses, similar to HubSpot and Go HighLevel functionality.

  ## New Tables

  ### 1. verification_codes
  Stores verification codes sent to contacts for phone and email verification
  - `id` (uuid, primary key): Unique verification record identifier
  - `contact_id` (uuid): Reference to contacts table
  - `verification_type` (text): Type of verification (phone or email)
  - `code` (text): The verification code sent to the contact
  - `expires_at` (timestamptz): When the code expires
  - `verified_at` (timestamptz): When the verification was completed
  - `attempts` (integer): Number of verification attempts
  - `created_at` (timestamptz): When the code was generated

  ## Updated Tables

  ### contacts table additions
  - `phone_verified` (boolean): Whether the phone number has been verified
  - `email_verified` (boolean): Whether the email has been verified
  - `phone_verified_at` (timestamptz): When phone was verified
  - `email_verified_at` (timestamptz): When email was verified

  ## Security
  - Row Level Security enabled on all tables
  - Users can only access their own verification codes
  - Restrictive policies ensure data privacy

  ## Performance
  - Indexes on foreign keys and verification status fields
  - Index on expires_at for cleanup queries
*/

-- Add verification status fields to contacts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE contacts ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE contacts ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'phone_verified_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN phone_verified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN email_verified_at timestamptz;
  END IF;
END $$;

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('phone', 'email')),
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_phone_verified ON contacts(phone_verified);
CREATE INDEX IF NOT EXISTS idx_contacts_email_verified ON contacts(email_verified);
CREATE INDEX IF NOT EXISTS idx_verification_codes_contact ON verification_codes(contact_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user ON verification_codes(user_id);

-- Enable Row Level Security
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_codes
CREATE POLICY "Users can view their own verification codes"
  ON verification_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification codes for their contacts"
  ON verification_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = verification_codes.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own verification codes"
  ON verification_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verification codes"
  ON verification_codes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW()
  AND verified_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a 6-digit verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS text AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;