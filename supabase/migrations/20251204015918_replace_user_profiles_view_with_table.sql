/*
  # Replace user_profiles VIEW with TABLE

  ## Problem
  The existing user_profiles is a VIEW that only contains:
  - id (from auth.users)
  - email
  - full_name (from user metadata)

  However, the profileService expects a full table with columns:
  - user_id, first_name, last_name, email, phone, extension, avatar_url,
    platform_language, timezone, calendar_name

  This mismatch causes profile loading to fail with "Failed to load profile".

  ## Solution
  1. Drop the existing user_profiles VIEW
  2. Create a proper user_profiles TABLE with all required columns
  3. Populate initial data from auth.users for existing users
  4. Add RLS policies for security
  5. Add trigger for updated_at timestamp

  ## Changes
  1. Drop existing view
  2. Create user_profiles table with complete schema
  3. Insert records for all existing users
  4. Enable RLS and create policies
  5. Add updated_at trigger
*/

-- Step 1: Drop the existing user_profiles view
DROP VIEW IF EXISTS user_profiles CASCADE;

-- Step 2: Create user_profiles table with complete schema
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  extension text NOT NULL DEFAULT '',
  avatar_url text,
  platform_language text NOT NULL DEFAULT 'en-US',
  timezone text NOT NULL DEFAULT 'America/New_York',
  calendar_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 3: Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Step 4: Populate initial data from auth.users for existing users
INSERT INTO user_profiles (user_id, first_name, last_name, email)
SELECT 
  au.id as user_id,
  COALESCE(au.raw_user_meta_data->>'first_name', 
           SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1),
           '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name',
           CASE 
             WHEN au.raw_user_meta_data->>'full_name' LIKE '% %' 
             THEN SUBSTRING(au.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN au.raw_user_meta_data->>'full_name') + 1)
             ELSE ''
           END,
           '') as last_name,
  COALESCE(au.email, '') as email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- Step 5: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- All authenticated users can view basic profile info (for team collaboration)
CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 7: Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Step 9: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- Step 10: Create function to auto-create profile on user signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 
             SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1),
             ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',
             CASE 
               WHEN NEW.raw_user_meta_data->>'full_name' LIKE '% %' 
               THEN SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1)
               ELSE ''
             END,
             ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create trigger on auth.users to auto-create profiles
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_profile();
