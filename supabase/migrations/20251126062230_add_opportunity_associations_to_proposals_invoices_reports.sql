/*
  # Add Opportunity Associations to Proposals, Invoices, and Reports

  1. Schema Changes
    - Add `opportunity_id` column to `documents_contracts` table
    - Add `opportunity_id` column to `invoices` table  
    - Add `opportunity_id` column to `instant_estimate_reports` table
    - Create `eagleview_measurement_reports` table for EagleView measurement data

  2. New Table: eagleview_measurement_reports
    - `id` (uuid, primary key) - Unique report identifier
    - `opportunity_id` (uuid) - Reference to opportunities table
    - `job_id` (bigint) - Reference to jobs table
    - `report_id` (text) - External EagleView report ID
    - `property_address` (text) - Property address for the report
    - `report_name` (text) - Name/title of the report
    - `measurement_data` (jsonb) - Roof measurements, pitch, area, etc.
    - `report_url` (text) - Link to view full report
    - `status` (text) - pending, completed, error
    - `created_by` (uuid) - User who created the report
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  3. Indexes
    - Add indexes on all new opportunity_id columns for performance
    - Add indexes on eagleview_measurement_reports table

  4. Security
    - Enable RLS on eagleview_measurement_reports
    - Add policies for authenticated users to manage reports
*/

-- Add opportunity_id to documents_contracts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents_contracts' AND column_name = 'opportunity_id'
  ) THEN
    ALTER TABLE documents_contracts ADD COLUMN opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add opportunity_id to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'opportunity_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add opportunity_id to instant_estimate_reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'instant_estimate_reports' AND column_name = 'opportunity_id'
  ) THEN
    ALTER TABLE instant_estimate_reports ADD COLUMN opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create eagleview_measurement_reports table
CREATE TABLE IF NOT EXISTS eagleview_measurement_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  job_id bigint,
  report_id text,
  property_address text NOT NULL,
  report_name text NOT NULL,
  measurement_data jsonb DEFAULT '{}'::jsonb,
  report_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'error')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for opportunity_id columns
CREATE INDEX IF NOT EXISTS idx_documents_contracts_opportunity_id ON documents_contracts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_invoices_opportunity_id ON invoices(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_reports_opportunity_id ON instant_estimate_reports(opportunity_id);

-- Create indexes for eagleview_measurement_reports table
CREATE INDEX IF NOT EXISTS idx_eagleview_reports_opportunity_id ON eagleview_measurement_reports(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_eagleview_reports_job_id ON eagleview_measurement_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_eagleview_reports_report_id ON eagleview_measurement_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_eagleview_reports_property_address ON eagleview_measurement_reports(property_address);
CREATE INDEX IF NOT EXISTS idx_eagleview_reports_created_at ON eagleview_measurement_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eagleview_reports_status ON eagleview_measurement_reports(status);

-- Enable RLS on eagleview_measurement_reports
ALTER TABLE eagleview_measurement_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for eagleview_measurement_reports
CREATE POLICY "Users can view all eagleview reports"
  ON eagleview_measurement_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create eagleview reports"
  ON eagleview_measurement_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update eagleview reports"
  ON eagleview_measurement_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete eagleview reports"
  ON eagleview_measurement_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_eagleview_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_eagleview_reports_updated_at
  BEFORE UPDATE ON eagleview_measurement_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_eagleview_reports_updated_at();
