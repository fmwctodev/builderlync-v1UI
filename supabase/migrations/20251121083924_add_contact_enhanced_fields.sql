/*
  # Add Enhanced Contact Fields Migration

  ## Overview
  This migration adds new fields to support enhanced contact management including:
  - Split name fields (first_name, last_name)
  - Timezone tracking
  - Phone type categorization
  - Do Not Disturb (DND) communication preferences

  ## Changes

  ### New Columns Added to contacts table (if it exists)

  1. **Name Fields**
     - `first_name` (text): Contact's first name
     - `last_name` (text): Contact's last name

  2. **Communication Fields**
     - `phone_type` (text): Type of phone (mobile, home, work, other)
     - `secondary_phone_type` (text): Type of secondary phone
     - `timezone` (text): Contact's timezone for scheduling

  3. **DND Preferences**
     - `dnd_all_channels` (boolean): Master DND flag for all communication
     - `dnd_preferences` (jsonb): Granular DND settings per channel
       - email: boolean
       - textMessages: boolean
       - callsVoicemail: boolean
       - inboundCallsSms: boolean

  ## Notes
  - All new fields are optional (nullable) to maintain backwards compatibility
  - Existing contacts will have null values for new fields
  - DND preferences use JSONB for flexibility
  - Phone type defaults to 'mobile' when not specified
*/

-- Check if contacts table exists, if not create it
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  type text NOT NULL DEFAULT 'customer',
  label_or_role text,
  company text,
  address text,
  latitude numeric,
  longitude numeric,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new name fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN last_name text;
  END IF;
END $$;

-- Add phone type fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'phone_type'
  ) THEN
    ALTER TABLE contacts ADD COLUMN phone_type text DEFAULT 'mobile';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'secondary_phone_type'
  ) THEN
    ALTER TABLE contacts ADD COLUMN secondary_phone_type text DEFAULT 'mobile';
  END IF;
END $$;

-- Add timezone field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE contacts ADD COLUMN timezone text;
  END IF;
END $$;

-- Add DND fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'dnd_all_channels'
  ) THEN
    ALTER TABLE contacts ADD COLUMN dnd_all_channels boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'dnd_preferences'
  ) THEN
    ALTER TABLE contacts ADD COLUMN dnd_preferences jsonb DEFAULT '{"email": false, "textMessages": false, "callsVoicemail": false, "inboundCallsSms": false}'::jsonb;
  END IF;
END $$;

-- Create index on phone_type for filtering
CREATE INDEX IF NOT EXISTS idx_contacts_phone_type ON contacts(phone_type);

-- Create index on timezone for scheduling queries
CREATE INDEX IF NOT EXISTS idx_contacts_timezone ON contacts(timezone);

-- Create index on dnd_all_channels for filtering
CREATE INDEX IF NOT EXISTS idx_contacts_dnd_all_channels ON contacts(dnd_all_channels);

-- Enable RLS if not already enabled
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contacts' AND policyname = 'Users can view own contacts'
  ) THEN
    CREATE POLICY "Users can view own contacts"
      ON contacts FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contacts' AND policyname = 'Users can create own contacts'
  ) THEN
    CREATE POLICY "Users can create own contacts"
      ON contacts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contacts' AND policyname = 'Users can update own contacts'
  ) THEN
    CREATE POLICY "Users can update own contacts"
      ON contacts FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contacts' AND policyname = 'Users can delete own contacts'
  ) THEN
    CREATE POLICY "Users can delete own contacts"
      ON contacts FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Update existing contacts to split full_name into first_name and last_name
UPDATE contacts
SET
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1) > 1
    THEN SUBSTRING(full_name FROM LENGTH(SPLIT_PART(full_name, ' ', 1)) + 2)
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;
