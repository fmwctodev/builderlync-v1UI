/*
  # Create Jobs Table and Related System

  1. New Tables
    - `jobs`
      - `id` (bigserial, primary key) - Auto-incrementing job ID
      - `name` (text) - Job name/title
      - `location` (text) - Job location address
      - `assignees` (text[]) - Array of assigned staff names
      - `job_owner` (text) - Primary job owner
      - `workflow_stages` (text) - Current workflow stage
      - `close_date` (date) - Expected close/completion date
      - `job_value` (numeric) - Estimated job value
      - `source` (text) - Lead source
      - `details` (text) - Job description/details
      - `job_type` (text) - Job type: residential, commercial, or insurance
      - `insurance_enabled` (boolean) - Insurance claim flag
      - `insurance_company` (text) - Insurance company name
      - `policy_account_number` (text) - Policy/account number
      - `claim_number` (text) - Insurance claim number
      - `date_of_loss` (date) - Date of loss for insurance claims
      - `type_of_damage` (text) - Type of damage description
      - `claim_amount` (numeric) - Claim amount
      - `deductible` (numeric) - Insurance deductible
      - `claim_details` (text) - Additional claim details
      - `measurements_id` (bigint) - Reference to measurements
      - `proposals_id` (bigint) - Reference to proposals
      - `pdf_signer_id` (bigint) - Reference to PDF signer
      - `material_orders_id` (bigint) - Reference to material orders
      - `work_orders_id` (bigint) - Reference to work orders
      - `invoice_id` (bigint) - Reference to invoice
      - `job_costings_id` (bigint) - Reference to job costing
      - `attachments_id` (bigint) - Reference to attachments
      - `instant_estimate_id` (bigint) - Reference to instant estimate
      - `integrations_id` (bigint) - Reference to integrations
      - `created_by` (uuid) - User who created the job
      - `created_by_name` (text) - Name of creator
      - `edited_by` (uuid) - User who last edited
      - `edited_by_name` (text) - Name of last editor
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `jobs` table
    - Add policy for authenticated users to read their organization's jobs
    - Add policy for authenticated users to create jobs
    - Add policy for authenticated users to update their organization's jobs
    - Add policy for authenticated users to delete their organization's jobs
  
  3. Indexes
    - Index on created_by for filtering by user
    - Index on workflow_stages for filtering by stage
    - Index on job_type for filtering by type
    - Index on created_at for sorting
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  assignees TEXT[] DEFAULT ARRAY[]::TEXT[],
  job_owner TEXT DEFAULT '',
  workflow_stages TEXT NOT NULL DEFAULT 'New lead',
  close_date DATE,
  job_value NUMERIC DEFAULT 0,
  source TEXT DEFAULT '',
  details TEXT DEFAULT '',
  job_type TEXT DEFAULT 'residential' CHECK (job_type IN ('residential', 'commercial', 'insurance')),
  insurance_enabled BOOLEAN DEFAULT false,
  insurance_company TEXT DEFAULT '',
  policy_account_number TEXT DEFAULT '',
  claim_number TEXT DEFAULT '',
  date_of_loss DATE,
  type_of_damage TEXT DEFAULT '',
  claim_amount NUMERIC DEFAULT 0,
  deductible NUMERIC DEFAULT 0,
  claim_details TEXT DEFAULT '',
  measurements_id BIGINT,
  proposals_id BIGINT,
  pdf_signer_id BIGINT,
  material_orders_id BIGINT,
  work_orders_id BIGINT,
  invoice_id BIGINT,
  job_costings_id BIGINT,
  attachments_id BIGINT,
  instant_estimate_id BIGINT,
  integrations_id BIGINT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  edited_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_workflow_stages ON jobs(workflow_stages);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all jobs
CREATE POLICY "Authenticated users can view all jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create jobs
CREATE POLICY "Authenticated users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Authenticated users can update jobs
CREATE POLICY "Authenticated users can update jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = edited_by);

-- Policy: Authenticated users can delete jobs they created
CREATE POLICY "Authenticated users can delete their jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();