-- Add social media URL columns to brand_boards table

ALTER TABLE brand_boards
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS google_business_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS pinterest_url VARCHAR(500);

-- Add foreign key constraint for user_id if users table exists
ALTER TABLE brand_boards
ADD CONSTRAINT fk_brand_boards_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add comments to describe the columns
COMMENT ON COLUMN brand_boards.user_id IS 'User ID who owns this brand board';
COMMENT ON COLUMN brand_boards.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN brand_boards.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN brand_boards.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN brand_boards.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN brand_boards.twitter_url IS 'X (Twitter) profile URL';
COMMENT ON COLUMN brand_boards.google_business_url IS 'Google Business Profile URL';
COMMENT ON COLUMN brand_boards.pinterest_url IS 'Pinterest profile URL';
