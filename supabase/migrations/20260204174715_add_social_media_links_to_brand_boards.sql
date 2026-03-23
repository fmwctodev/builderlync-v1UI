/*
  # Add Social Media Links to Brand Boards

  ## Changes
  Adds social media link fields to the brand_boards table:
  - facebook_url
  - instagram_url
  - youtube_url
  - tiktok_url
  - twitter_url (X)
  - google_business_url (GBP)
  - pinterest_url

  ## Security
  - No RLS changes needed as brand_boards inherits existing policies
*/

-- Add social media link columns to brand_boards table
ALTER TABLE brand_boards
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS google_business_url TEXT,
ADD COLUMN IF NOT EXISTS pinterest_url TEXT;
