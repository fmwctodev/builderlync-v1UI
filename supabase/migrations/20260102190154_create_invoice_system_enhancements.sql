/*
  # Enhanced Invoice System with QuickBooks Integration

  1. New Tables
    - `invoice_templates`
      - Stores reusable product/service templates
      - Includes pricing, descriptions, and tax settings
    - `invoice_items`
      - Stores line items for invoices
      - Links to invoices with detailed pricing breakdown
    - `invoice_attachments`
      - Links invoices to uploaded files
      - Tracks attachment metadata
    - `recurring_invoice_schedules`
      - Manages recurring invoice configuration
      - Tracks next generation dates and occurrences

  2. Updates to Existing Tables
    - Add QuickBooks sync fields to invoices table
    - Add recurring invoice fields to invoices table
    - Add template support fields

  3. Security
    - Enable RLS on all new tables
    - Add policies for organization-scoped access
*/

-- Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  default_price decimal(10,2) DEFAULT 0,
  default_quantity decimal(10,2) DEFAULT 1,
  unit_type text DEFAULT 'unit',
  tax_rate decimal(5,2) DEFAULT 0,
  is_taxable boolean DEFAULT true,
  quickbooks_item_id text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number integer NOT NULL DEFAULT 1,
  description text NOT NULL,
  quantity decimal(10,2) NOT NULL DEFAULT 1,
  rate decimal(10,2) NOT NULL DEFAULT 0,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_percentage decimal(5,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  tax_rate decimal(5,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  template_id uuid REFERENCES invoice_templates(id),
  quickbooks_item_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_attachments table
CREATE TABLE IF NOT EXISTS invoice_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  quickbooks_attachment_id text,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now(),
  UNIQUE(invoice_id, file_id)
);

-- Create recurring_invoice_schedules table
CREATE TABLE IF NOT EXISTS recurring_invoice_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_template_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month integer CHECK (day_of_month BETWEEN 1 AND 31),
  start_date date NOT NULL,
  end_date date,
  next_invoice_date date NOT NULL,
  total_occurrences integer,
  occurrences_completed integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_paused boolean DEFAULT false,
  last_generated_at timestamptz,
  quickbooks_recurring_id text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to invoices table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'quickbooks_invoice_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN quickbooks_invoice_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'quickbooks_sync_status'
  ) THEN
    ALTER TABLE invoices ADD COLUMN quickbooks_sync_status text DEFAULT 'not_synced' CHECK (quickbooks_sync_status IN ('not_synced', 'pending', 'synced', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'quickbooks_sync_error'
  ) THEN
    ALTER TABLE invoices ADD COLUMN quickbooks_sync_error text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE invoices ADD COLUMN last_synced_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE invoices ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'recurring_schedule_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN recurring_schedule_id uuid REFERENCES recurring_invoice_schedules(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE invoices ADD COLUMN subtotal decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE invoices ADD COLUMN discount_amount decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'tax_amount'
  ) THEN
    ALTER TABLE invoices ADD COLUMN tax_amount decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'shipping_amount'
  ) THEN
    ALTER TABLE invoices ADD COLUMN shipping_amount decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'customer_message'
  ) THEN
    ALTER TABLE invoices ADD COLUMN customer_message text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_terms text DEFAULT 'Net 30';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'po_number'
  ) THEN
    ALTER TABLE invoices ADD COLUMN po_number text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_templates
CREATE POLICY "Users can view templates in their organization"
  ON invoice_templates FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create templates in their organization"
  ON invoice_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update templates in their organization"
  ON invoice_templates FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete templates in their organization"
  ON invoice_templates FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items for their organization invoices"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can create invoice items for their organization invoices"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can update invoice items for their organization invoices"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can delete invoice items for their organization invoices"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- RLS Policies for invoice_attachments
CREATE POLICY "Users can view attachments for their organization invoices"
  ON invoice_attachments FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can create attachments for their organization invoices"
  ON invoice_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Users can delete attachments for their organization invoices"
  ON invoice_attachments FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- RLS Policies for recurring_invoice_schedules
CREATE POLICY "Users can view recurring schedules in their organization"
  ON recurring_invoice_schedules FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create recurring schedules in their organization"
  ON recurring_invoice_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update recurring schedules in their organization"
  ON recurring_invoice_schedules FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can delete recurring schedules in their organization"
  ON recurring_invoice_schedules FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_templates_organization ON invoice_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_category ON invoice_templates(category);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_active ON invoice_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_template ON invoice_items(template_id);

CREATE INDEX IF NOT EXISTS idx_invoice_attachments_invoice ON invoice_attachments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_attachments_file ON invoice_attachments(file_id);

CREATE INDEX IF NOT EXISTS idx_recurring_schedules_organization ON recurring_invoice_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_next_date ON recurring_invoice_schedules(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_active ON recurring_invoice_schedules(is_active);

CREATE INDEX IF NOT EXISTS idx_invoices_quickbooks_id ON invoices(quickbooks_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON invoices(is_recurring);
CREATE INDEX IF NOT EXISTS idx_invoices_sync_status ON invoices(quickbooks_sync_status);

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_uuid uuid)
RETURNS void AS $$
DECLARE
  item_subtotal decimal(10,2);
  invoice_discount decimal(10,2);
  invoice_tax decimal(10,2);
  invoice_shipping decimal(10,2);
  invoice_total decimal(10,2);
BEGIN
  SELECT COALESCE(SUM(total_amount), 0) INTO item_subtotal
  FROM invoice_items
  WHERE invoice_id = invoice_uuid;

  SELECT
    COALESCE(discount_amount, 0),
    COALESCE(tax_amount, 0),
    COALESCE(shipping_amount, 0)
  INTO invoice_discount, invoice_tax, invoice_shipping
  FROM invoices
  WHERE id = invoice_uuid;

  invoice_total := item_subtotal - invoice_discount + invoice_tax + invoice_shipping;

  UPDATE invoices
  SET
    subtotal = item_subtotal,
    amount = invoice_total,
    updated_at = now()
  WHERE id = invoice_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate totals when invoice items change
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalculate_invoice_totals_on_item_change ON invoice_items;
CREATE TRIGGER recalculate_invoice_totals_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_invoice_totals();