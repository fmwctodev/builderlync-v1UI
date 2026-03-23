/*
  # Enhance ABC Supply Integration Tables
  
  1. Updates to existing tables
    - Add branch_number to abc_supply_branches (maps to ABC API branchNumber)
    - Add account/branch tracking to material_orders
    - Add pricing metadata to material_order_items
    
  2. New Table
    - abc_supply_api_logs for API interaction auditing
*/

-- Add branch_number to existing abc_supply_branches table
ALTER TABLE abc_supply_branches ADD COLUMN IF NOT EXISTS branch_number text;

-- Update existing rows to use branch_code as branch_number if not set
UPDATE abc_supply_branches 
SET branch_number = branch_code 
WHERE branch_number IS NULL AND branch_code IS NOT NULL;

-- Create index on branch_number
CREATE INDEX IF NOT EXISTS idx_abc_branches_branch_number ON abc_supply_branches(branch_number);

-- Add ABC Supply specific fields to material_orders
ALTER TABLE material_orders ADD COLUMN IF NOT EXISTS abc_supply_account_number text;
ALTER TABLE material_orders ADD COLUMN IF NOT EXISTS abc_supply_branch_number text;
ALTER TABLE material_orders ADD COLUMN IF NOT EXISTS delivery_method text;
ALTER TABLE material_orders ADD COLUMN IF NOT EXISTS requested_delivery_date date;
ALTER TABLE material_orders ADD COLUMN IF NOT EXISTS delivery_time_window text;
ALTER TABLE material_orders ADD COLUMN IF NOT EXISTS api_environment text DEFAULT 'production';

-- Create indexes for material_orders ABC fields
CREATE INDEX IF NOT EXISTS idx_material_orders_abc_account ON material_orders(abc_supply_account_number);
CREATE INDEX IF NOT EXISTS idx_material_orders_abc_branch ON material_orders(abc_supply_branch_number);

-- Add pricing and availability fields to material_order_items
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS item_branch_number text;
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS stocking_uom text;
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS pricing_fetched_at timestamptz;
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS is_available_at_branch boolean DEFAULT true;
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS available_branches text[] DEFAULT '{}';
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS requires_contact_for_price boolean DEFAULT false;
ALTER TABLE material_order_items ADD COLUMN IF NOT EXISTS pricing_metadata jsonb DEFAULT '{}';

-- Create abc_supply_api_logs table for API interaction auditing
CREATE TABLE IF NOT EXISTS abc_supply_api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  
  endpoint text NOT NULL,
  method text NOT NULL,
  request_body jsonb,
  request_headers jsonb,
  
  response_status integer,
  response_body jsonb,
  response_time_ms integer,
  
  account_number text,
  branch_number text,
  order_id uuid,
  
  is_error boolean DEFAULT false,
  error_message text,
  error_code text,
  
  environment text DEFAULT 'production',
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_abc_supply_api_logs_org ON abc_supply_api_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_abc_supply_api_logs_created ON abc_supply_api_logs(created_at DESC);

ALTER TABLE abc_supply_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view API logs"
  ON abc_supply_api_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can insert API logs"
  ON abc_supply_api_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
