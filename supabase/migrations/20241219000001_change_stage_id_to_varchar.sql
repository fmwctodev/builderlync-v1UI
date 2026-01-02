-- Change stage_id from INTEGER to VARCHAR to support default stages
ALTER TABLE opportunities 
ALTER COLUMN stage_id TYPE VARCHAR(50);

-- Update any NULL values to a default stage
UPDATE opportunities 
SET stage_id = 'default-1' 
WHERE stage_id IS NULL;
