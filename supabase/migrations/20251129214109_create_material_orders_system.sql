/*
  # Create Material Orders Management System

  1. New Tables
    - `material_orders`
      - Purchase orders for materials from suppliers
      - Links to jobs and suppliers
      - Tracks order status through lifecycle (draft → sent → confirmed → delivered)
      - Integrates with ABC Supply API for order submission
    
    - `material_order_items`
      - Line items in material orders
      - Individual products with quantities and pricing
      - Links to ABC Supply product catalog
    
    - `material_order_history`
      - Audit trail of all status changes and events
      - Track who made changes and when
      - Store order lifecycle events

  2. Security
    - Enable RLS on all tables
    - Users can view orders in their organization
    - Sales/managers can create and edit orders
    - Admins can manage all aspects

  3. Indexes
    - Order lookup by job, supplier, status
    - Item lookup by order and product
    - History tracking by order

  4. Features
    - Full order lifecycle management
    - ABC Supply API integration ready
    - Multi-supplier support
    - Order status tracking
    - Delivery management
    - Cost tracking and totals
*/

-- Create material_orders table
CREATE TABLE IF NOT EXISTS material_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
  
  -- Order Numbers
  po_number text, -- Internal PO number
  order_number text, -- Supplier's order number (e.g., ABC Supply order #)
  
  -- Order Status
  status text DEFAULT 'draft' CHECK (status IN (
    'draft',
    'ready_to_send',
    'sent',
    'confirmed',
    'in_transit',
    'delivered',
    'cancelled',
    'rejected'
  )),
  
  -- Delivery Information
  job_address text,
  delivery_address text, -- If different from job address
  delivery_contact_name text,
  delivery_contact_phone text,
  delivery_date date,
  actual_delivery_date date,
  delivery_notes text,
  
  -- Financial Information
  subtotal numeric(12, 2) DEFAULT 0,
  tax_amount numeric(12, 2) DEFAULT 0,
  shipping_cost numeric(12, 2) DEFAULT 0,
  total_amount numeric(12, 2) DEFAULT 0,
  currency text DEFAULT 'USD',
  
  -- Payment Information
  payment_method text, -- check, credit_card, account, etc.
  payment_status text DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'paid',
    'partial',
    'overdue'
  )),
  payment_due_date date,
  
  -- Notes and Documentation
  notes text, -- Customer-facing notes
  internal_notes text, -- Internal team notes
  special_instructions text,
  
  -- ABC Supply Integration
  abc_supply_order_id text, -- External ABC Supply order ID
  abc_supply_sync_status text DEFAULT 'pending' CHECK (abc_supply_sync_status IN (
    'pending',
    'synced',
    'failed',
    'not_applicable'
  )),
  abc_supply_last_sync timestamptz,
  abc_supply_error_message text,
  
  -- Tracking
  tracking_number text,
  tracking_url text,
  
  -- User Assignments
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  sent_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  confirmed_at timestamptz,
  delivered_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create material_order_items table
CREATE TABLE IF NOT EXISTS material_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_order_id uuid REFERENCES material_orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Product Information
  product_id uuid, -- Reference to internal product catalog (if exists)
  abc_supply_product_id text, -- External ABC Supply product ID
  product_name text NOT NULL,
  product_sku text,
  product_description text,
  
  -- Quantity and Pricing
  quantity numeric(10, 2) NOT NULL,
  unit_of_measure text DEFAULT 'EA', -- Each, SQ (square), BX (box), etc.
  unit_price numeric(12, 4) NOT NULL,
  total_price numeric(12, 2) NOT NULL,
  
  -- Discount Information
  discount_percentage numeric(5, 2) DEFAULT 0,
  discount_amount numeric(12, 2) DEFAULT 0,
  
  -- Product Details
  manufacturer text,
  manufacturer_part_number text,
  color text,
  size text,
  
  -- Notes
  notes text,
  special_order boolean DEFAULT false,
  
  -- Status
  item_status text DEFAULT 'pending' CHECK (item_status IN (
    'pending',
    'confirmed',
    'backordered',
    'cancelled',
    'delivered'
  )),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create material_order_history table
CREATE TABLE IF NOT EXISTS material_order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_order_id uuid REFERENCES material_orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Event Information
  event_type text NOT NULL CHECK (event_type IN (
    'created',
    'status_changed',
    'sent_to_supplier',
    'confirmed_by_supplier',
    'item_added',
    'item_removed',
    'item_modified',
    'shipped',
    'delivered',
    'cancelled',
    'payment_updated',
    'note_added'
  )),
  
  -- Status Tracking
  old_status text,
  new_status text,
  
  -- Event Details
  description text,
  metadata jsonb, -- Store additional event data
  
  -- User Tracking
  changed_by uuid REFERENCES auth.users(id),
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_material_orders_organization ON material_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_job ON material_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_supplier ON material_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_status ON material_orders(status);
CREATE INDEX IF NOT EXISTS idx_material_orders_po_number ON material_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_material_orders_order_number ON material_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_material_orders_created_by ON material_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_material_orders_delivery_date ON material_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_material_orders_abc_order_id ON material_orders(abc_supply_order_id);

CREATE INDEX IF NOT EXISTS idx_material_order_items_order ON material_order_items(material_order_id);
CREATE INDEX IF NOT EXISTS idx_material_order_items_sku ON material_order_items(product_sku);
CREATE INDEX IF NOT EXISTS idx_material_order_items_abc_product ON material_order_items(abc_supply_product_id);

CREATE INDEX IF NOT EXISTS idx_material_order_history_order ON material_order_history(material_order_id);
CREATE INDEX IF NOT EXISTS idx_material_order_history_event_type ON material_order_history(event_type);
CREATE INDEX IF NOT EXISTS idx_material_order_history_created_at ON material_order_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for material_orders
CREATE POLICY "Users can view material orders in their organization"
  ON material_orders FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sales and managers can create material orders"
  ON material_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'sales', 'project_manager')
    )
  );

CREATE POLICY "Sales and managers can update material orders"
  ON material_orders FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'sales', 'project_manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'sales', 'project_manager')
    )
  );

CREATE POLICY "Admins can delete material orders"
  ON material_orders FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for material_order_items
CREATE POLICY "Users can view items in their organization orders"
  ON material_order_items FOR SELECT
  TO authenticated
  USING (
    material_order_id IN (
      SELECT id FROM material_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Sales and managers can manage order items"
  ON material_order_items FOR ALL
  TO authenticated
  USING (
    material_order_id IN (
      SELECT mo.id FROM material_orders mo
      JOIN organization_members om ON mo.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'manager', 'sales', 'project_manager')
    )
  );

-- RLS Policies for material_order_history
CREATE POLICY "Users can view order history in their organization"
  ON material_order_history FOR SELECT
  TO authenticated
  USING (
    material_order_id IN (
      SELECT id FROM material_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert order history"
  ON material_order_history FOR INSERT
  TO authenticated
  WITH CHECK (
    material_order_id IN (
      SELECT id FROM material_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to auto-generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.po_number IS NULL THEN
    NEW.po_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                     LPAD(NEXTVAL('po_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for PO numbers
CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

-- Create trigger to auto-generate PO numbers
DROP TRIGGER IF EXISTS trigger_generate_po_number ON material_orders;
CREATE TRIGGER trigger_generate_po_number
  BEFORE INSERT ON material_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_po_number();

-- Function to update material_orders updated_at timestamp
CREATE OR REPLACE FUNCTION update_material_order_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
DROP TRIGGER IF EXISTS trigger_update_material_order_timestamp ON material_orders;
CREATE TRIGGER trigger_update_material_order_timestamp
  BEFORE UPDATE ON material_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_material_order_timestamp();

-- Function to log material order changes to history
CREATE OR REPLACE FUNCTION log_material_order_change()
RETURNS trigger AS $$
BEGIN
  -- Log status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO material_order_history (
      material_order_id,
      event_type,
      old_status,
      new_status,
      description,
      changed_by
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      auth.uid()
    );
  END IF;
  
  -- Log order creation
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO material_order_history (
      material_order_id,
      event_type,
      new_status,
      description,
      changed_by
    ) VALUES (
      NEW.id,
      'created',
      NEW.status,
      'Material order created',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log order changes
DROP TRIGGER IF EXISTS trigger_log_material_order_change ON material_orders;
CREATE TRIGGER trigger_log_material_order_change
  AFTER INSERT OR UPDATE ON material_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_material_order_change();