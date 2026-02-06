-- Add user_name column to email_connections table

ALTER TABLE email_connections
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Add comment to describe the column
COMMENT ON COLUMN email_connections.user_name IS 'Display name of the connected email account user';
