/*
  # Add Web Sources to Sierra AI Knowledge Base

  1. New Table
    - `sierra_kb_web_sources`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `url` (text, the website URL)
      - `title` (text, extracted page title)
      - `collection_id` (uuid, references sierra_kb_collections)
      - `status` (text, scraping status: pending, processing, completed, failed)
      - `last_scraped_at` (timestamptz)
      - `error_message` (text, if scraping failed)
      - `metadata` (jsonb, additional metadata)
      - `auto_refresh` (boolean, whether to auto-refresh)
      - `refresh_frequency` (text, how often to refresh: daily, weekly, monthly)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `source_url` field to `sierra_kb_articles`
    - Add `web_source_id` field to `sierra_kb_articles`

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users to manage their web sources

  4. Indexes
    - Index on user_id and status for fast filtering
    - Index on url for deduplication
*/

-- Create web sources table
CREATE TABLE IF NOT EXISTS sierra_kb_web_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  collection_id uuid REFERENCES sierra_kb_collections(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  last_scraped_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  auto_refresh boolean DEFAULT false,
  refresh_frequency text DEFAULT 'weekly' CHECK (refresh_frequency IN ('daily', 'weekly', 'monthly', 'never')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add source tracking to articles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sierra_kb_articles' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE sierra_kb_articles ADD COLUMN source_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sierra_kb_articles' AND column_name = 'web_source_id'
  ) THEN
    ALTER TABLE sierra_kb_articles ADD COLUMN web_source_id uuid REFERENCES sierra_kb_web_sources(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sierra_web_sources_user_id ON sierra_kb_web_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_sierra_web_sources_status ON sierra_kb_web_sources(status);
CREATE INDEX IF NOT EXISTS idx_sierra_web_sources_url ON sierra_kb_web_sources(url);
CREATE INDEX IF NOT EXISTS idx_sierra_kb_articles_web_source_id ON sierra_kb_articles(web_source_id);

-- Enable RLS
ALTER TABLE sierra_kb_web_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sierra_kb_web_sources
CREATE POLICY "Users can view own web sources"
  ON sierra_kb_web_sources FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own web sources"
  ON sierra_kb_web_sources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own web sources"
  ON sierra_kb_web_sources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own web sources"
  ON sierra_kb_web_sources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_sierra_web_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sierra_web_sources_updated_at
  BEFORE UPDATE ON sierra_kb_web_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_sierra_web_sources_updated_at();