/*
  # Add Outputs and Upgrade Tracking to Measurement Orders

  ## Summary
  This migration extends the measurement_orders table to support:
  - Order source tracking (credits vs customer EagleView account)
  - Multiple output formats (PDF, JSON, XML) with URL and body storage
  - Upgrade order tracking with reference to source orders

  ## Changes

  1. New Columns on `measurement_orders`:
    - `ordered_via` - tracks if order was placed via BuilderLynk credits or customer EagleView account
    - `pdf_url` - URL for PDF report download
    - `json_url` - URL for JSON output
    - `json_body` - Inline JSON data storage
    - `xml_url` - URL for XML output
    - `xml_body` - Inline XML data storage
    - `is_upgrade_order` - Flag indicating this is an upgrade from a previous order
    - `upgrade_from_order_id` - Reference to the source order being upgraded

  2. Indexes:
    - Index on ordered_via for filtering
    - Index on is_upgrade_order for filtering upgrade orders
    - Index on upgrade_from_order_id for finding related orders

  ## Notes
  - Existing orders will have NULL for new columns
  - ordered_via can be inferred from order_type for existing records
  - pdf_url falls back to eagleview_report_url if not set
*/

-- Add ordered_via column to track order source
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'ordered_via'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN ordered_via text CHECK (ordered_via IN ('credits', 'eagleview'));
  END IF;
END $$;

-- Add PDF output URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN pdf_url text;
  END IF;
END $$;

-- Add JSON output URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'json_url'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN json_url text;
  END IF;
END $$;

-- Add JSON body storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'json_body'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN json_body jsonb;
  END IF;
END $$;

-- Add XML output URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'xml_url'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN xml_url text;
  END IF;
END $$;

-- Add XML body storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'xml_body'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN xml_body text;
  END IF;
END $$;

-- Add upgrade order flag
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'is_upgrade_order'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN is_upgrade_order boolean DEFAULT false;
  END IF;
END $$;

-- Add upgrade source reference
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'upgrade_from_order_id'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN upgrade_from_order_id uuid REFERENCES measurement_orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_measurement_orders_ordered_via ON measurement_orders(ordered_via);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_is_upgrade ON measurement_orders(is_upgrade_order) WHERE is_upgrade_order = true;
CREATE INDEX IF NOT EXISTS idx_measurement_orders_upgrade_from ON measurement_orders(upgrade_from_order_id) WHERE upgrade_from_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_measurement_orders_pdf_url ON measurement_orders(pdf_url) WHERE pdf_url IS NOT NULL;

-- Backfill ordered_via for existing records based on order_type
UPDATE measurement_orders
SET ordered_via = CASE
  WHEN order_type IN ('eagleview', 'hover') THEN 'eagleview'
  ELSE 'credits'
END
WHERE ordered_via IS NULL;
