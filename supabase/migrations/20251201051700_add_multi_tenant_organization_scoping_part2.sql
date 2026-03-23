/*
  # Multi-Tenant Organization Scoping - Part 2: Sales, Operations, and Marketing Tables

  ## Overview
  Continues adding organization_id to tenant-scoped tables for sales, operations, and marketing.

  ## Changes
  Add organization_id to:
  - Sales: opportunities, pipelines, pipeline_stages, invoices, proposal_templates
  - Operations: material_orders, work_orders, job_tasks, job_photos
  - Marketing: campaigns, reviews, gbp_insights, gbp_posts
*/

-- Add organization_id to opportunities table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_opportunities_organization_id ON opportunities(organization_id);
    CREATE INDEX idx_opportunities_org_created ON opportunities(organization_id, created_at DESC);
  END IF;
END $$;

-- Add organization_id to pipelines table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_pipelines_organization_id ON pipelines(organization_id);
  END IF;
END $$;

-- Add organization_id to pipeline_stages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_stages' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE pipeline_stages ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_pipeline_stages_organization_id ON pipeline_stages(organization_id);
  END IF;
END $$;

-- Add organization_id to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
    CREATE INDEX idx_invoices_org_created ON invoices(organization_id, created_at DESC);
  END IF;
END $$;

-- Add organization_id to proposal_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_templates' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE proposal_templates ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_proposal_templates_organization_id ON proposal_templates(organization_id);
  END IF;
END $$;

-- Add organization_id to material_orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'material_orders' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE material_orders ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_material_orders_organization_id ON material_orders(organization_id);
    CREATE INDEX idx_material_orders_org_created ON material_orders(organization_id, created_at DESC);
  END IF;
END $$;

-- Add organization_id to work_orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'work_orders' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE work_orders ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_work_orders_organization_id ON work_orders(organization_id);
    CREATE INDEX idx_work_orders_org_created ON work_orders(organization_id, created_at DESC);
  END IF;
END $$;

-- Add organization_id to job_tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_tasks' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE job_tasks ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_job_tasks_organization_id ON job_tasks(organization_id);
  END IF;
END $$;

-- Add organization_id to job_photos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_photos' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE job_photos ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_job_photos_organization_id ON job_photos(organization_id);
  END IF;
END $$;

-- Add organization_id to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_campaigns_organization_id ON campaigns(organization_id);
  END IF;
END $$;

-- Add organization_id to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_reviews_organization_id ON reviews(organization_id);
  END IF;
END $$;

-- Add organization_id to gbp_insights table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gbp_insights' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE gbp_insights ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_gbp_insights_organization_id ON gbp_insights(organization_id);
  END IF;
END $$;

-- Add organization_id to gbp_posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gbp_posts' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE gbp_posts ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_gbp_posts_organization_id ON gbp_posts(organization_id);
  END IF;
END $$;