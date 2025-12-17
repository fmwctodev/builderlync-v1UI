/*
  # Create Instant Estimate Reports Table

  1. New Tables
    - `instant_estimate_reports`
      - `id` (uuid, primary key) - Unique report identifier
      - `job_id` (bigint) - Reference to jobs table
      - `job_address` (text) - Property address for the report
      - `report_name` (text) - Name/title of the report
      - `report_data` (jsonb) - Structured report data and calculations
      - `status` (text) - Report status: draft, completed, processing, archived
      - `created_by` (uuid) - User who created the report
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `instant_estimate_reports` table
    - Add policy for authenticated users to read reports
    - Add policy for authenticated users to create reports
    - Add policy for authenticated users to update their reports
    - Add policy for authenticated users to delete their reports

  3. Indexes
    - Index on job_id for efficient job-based queries
    - Index on job_address for address-based queries
    - Index on created_at for sorting by date
    - Index on created_by for filtering by user

  4. Important Notes
    - Reports are linked to jobs via job_id
    - Reports can be queried by address to show all estimates for a property
    - Report data stored as JSONB for flexibility as estimator develops
    - Status workflow: draft → processing → completed → archived
*/

-- Create instant_estimate_reports table
CREATE TABLE IF NOT EXISTS instant_estimate_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id BIGINT,
  job_address TEXT NOT NULL,
  report_name TEXT NOT NULL,
  report_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'processing', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_instant_estimate_reports_job_id ON instant_estimate_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_reports_job_address ON instant_estimate_reports(job_address);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_reports_created_at ON instant_estimate_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_reports_created_by ON instant_estimate_reports(created_by);

-- Enable RLS
ALTER TABLE instant_estimate_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all reports
CREATE POLICY "Authenticated users can view instant estimate reports"
  ON instant_estimate_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create reports
CREATE POLICY "Authenticated users can create instant estimate reports"
  ON instant_estimate_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Authenticated users can update reports they created
CREATE POLICY "Authenticated users can update their instant estimate reports"
  ON instant_estimate_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Authenticated users can delete reports they created
CREATE POLICY "Authenticated users can delete their instant estimate reports"
  ON instant_estimate_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_instant_estimate_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_instant_estimate_reports_updated_at
  BEFORE UPDATE ON instant_estimate_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_instant_estimate_reports_updated_at();
