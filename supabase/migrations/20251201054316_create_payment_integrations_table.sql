/*
  # Create Payment Integrations Table

  ## Overview
  This migration creates the payment_integrations table for managing organization
  payment processor integrations (Stripe, Square, etc.).

  ## Changes

  1. New Tables
    - `payment_integrations`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, required) - Organization this integration belongs to
      - `provider` (text) - Payment provider (stripe, square, paypal, etc.)
      - `provider_account_id` (text) - External account ID
      - `api_key` (text) - Encrypted API key
      - `api_secret` (text) - Encrypted API secret
      - `webhook_secret` (text) - Webhook secret for verification
      - `is_live_mode` (boolean) - Live vs test mode
      - `is_active` (boolean) - Whether integration is active
      - `configuration` (jsonb) - Additional configuration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on table
    - Add policies for organization members to manage integrations

  3. Indexes
    - Index on organization_id for filtering
    - Index on provider for filtering
*/

-- Create payment_integrations table
CREATE TABLE IF NOT EXISTS payment_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_account_id text,
  api_key text,
  api_secret text,
  webhook_secret text,
  is_live_mode boolean DEFAULT false,
  is_active boolean DEFAULT true,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_integrations_organization_id ON payment_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_integrations_provider ON payment_integrations(provider);

-- Enable RLS
ALTER TABLE payment_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view payment integrations"
  ON payment_integrations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can create payment integrations"
  ON payment_integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can update payment integrations"
  ON payment_integrations FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can delete payment integrations"
  ON payment_integrations FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_integrations_updated_at
  BEFORE UPDATE ON payment_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_integrations_updated_at();
