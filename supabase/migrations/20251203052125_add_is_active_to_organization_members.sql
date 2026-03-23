/*
  # Add is_active column to organization_members table

  1. Changes
    - Add `is_active` boolean column to organization_members table
    - Populate is_active based on existing status column
    - Add index for performance
    - Keep status column for backwards compatibility
  
  2. Reason
    - Multiple sync functions expect `is_active` column but table only has `status`
    - This was causing "column om.is_active does not exist" errors
    - Functions like sync_organization_members_to_platform_users() query is_active
    - Helper functions get_organization_owner() and get_organization_metrics() also use is_active
  
  3. Data Migration
    - Set is_active = true where status = 'active'
    - Set is_active = false for all other statuses
*/

-- Add is_active column to organization_members if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organization_members' 
    AND column_name = 'is_active'
  ) THEN
    -- Add the column
    ALTER TABLE organization_members 
    ADD COLUMN is_active boolean DEFAULT true;
    
    -- Populate based on existing status
    UPDATE organization_members 
    SET is_active = (status = 'active');
    
    -- Set NOT NULL constraint after populating data
    ALTER TABLE organization_members 
    ALTER COLUMN is_active SET NOT NULL;
    
    RAISE NOTICE 'Added is_active column to organization_members';
  ELSE
    RAISE NOTICE 'is_active column already exists in organization_members';
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_is_active 
ON organization_members(is_active);

-- Create index for combined queries (organization + is_active)
CREATE INDEX IF NOT EXISTS idx_organization_members_org_active 
ON organization_members(organization_id, is_active);

-- Update trigger to keep is_active in sync with status
CREATE OR REPLACE FUNCTION sync_organization_member_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep is_active in sync with status
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.is_active := (NEW.status = 'active');
  END IF;
  
  -- Keep status in sync with is_active
  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    NEW.status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS sync_organization_member_status_trigger ON organization_members;
CREATE TRIGGER sync_organization_member_status_trigger
  BEFORE UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_organization_member_status();