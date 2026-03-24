/*
  # Create Job Cam Files and Activity Events Tables

  1. New Tables
    - `job_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (integer, references jobs)
      - `file_url` (text)
      - `storage_path` (text)
      - `file_name` (text)
      - `file_size` (bigint)
      - `mime_type` (text)
      - `category` (text: contract, permit, invoice, inspection, insurance, warranty, other)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `job_activity_events`
      - `id` (uuid, primary key)
      - `job_id` (integer, references jobs)
      - `event_type` (text)
      - `user_id` (uuid, references auth.users)
      - `entity_id` (text)
      - `entity_type` (text)
      - `summary` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Modified Tables
    - `job_photos`: Added `is_hidden_from_timeline` boolean column

  3. Security
    - Enable RLS on both new tables
    - Policies for authenticated users to manage their own data

  4. Indexes
    - job_files: index on job_id
    - job_activity_events: index on job_id, created_at
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_photos' AND column_name = 'is_hidden_from_timeline'
  ) THEN
    ALTER TABLE job_photos ADD COLUMN is_hidden_from_timeline boolean DEFAULT false;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS job_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  job_id integer NOT NULL,
  file_url text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  category text NOT NULL DEFAULT 'other',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_files' AND policyname = 'Authenticated users can view job files'
  ) THEN
    CREATE POLICY "Authenticated users can view job files"
      ON job_files FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_files' AND policyname = 'Authenticated users can insert job files'
  ) THEN
    CREATE POLICY "Authenticated users can insert job files"
      ON job_files FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_files' AND policyname = 'Authenticated users can update own job files'
  ) THEN
    CREATE POLICY "Authenticated users can update own job files"
      ON job_files FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_files' AND policyname = 'Authenticated users can delete own job files'
  ) THEN
    CREATE POLICY "Authenticated users can delete own job files"
      ON job_files FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_files_job_id ON job_files(job_id);

CREATE TABLE IF NOT EXISTS job_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id integer NOT NULL,
  event_type text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  entity_id text,
  entity_type text,
  summary text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_activity_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_activity_events' AND policyname = 'Authenticated users can view job activity'
  ) THEN
    CREATE POLICY "Authenticated users can view job activity"
      ON job_activity_events FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_activity_events' AND policyname = 'Authenticated users can insert job activity'
  ) THEN
    CREATE POLICY "Authenticated users can insert job activity"
      ON job_activity_events FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_activity_events_job_id ON job_activity_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_activity_events_created_at ON job_activity_events(created_at DESC);