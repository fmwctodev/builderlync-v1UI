/*
  # Create ABC Supply Accounts Table
  
  1. New Table
    - `abc_supply_accounts` - Stores ship-to accounts for ABC Supply integration
    - Links accounts to organizations
    - Tracks accessible branches per account
    
  2. Security
    - Enable RLS
    - Organization-scoped access policies
*/

CREATE TABLE IF NOT EXISTS abc_supply_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  account_number text NOT NULL,
  account_name text,
  account_type text DEFAULT 'ship_to',
  
  contact_name text,
  contact_email text,
  contact_phone text,
  
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'US',
  
  accessible_branch_numbers text[] DEFAULT '{}',
  
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  last_synced_at timestamptz,
  sync_status text DEFAULT 'pending',
  sync_error text,
  
  api_metadata jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, account_number)
);

CREATE INDEX IF NOT EXISTS idx_abc_supply_accounts_org ON abc_supply_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_abc_supply_accounts_number ON abc_supply_accounts(account_number);

ALTER TABLE abc_supply_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ABC Supply accounts in their organization"
  ON abc_supply_accounts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage ABC Supply accounts"
  ON abc_supply_accounts FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
