/*
  # Multi-Tenant Organization Scoping - Part 3: Automation, AI, Files, and Settings

  ## Overview
  Continues adding organization_id to automation, AI, file management, and settings tables.

  ## Changes
  Add organization_id to:
  - Automation: automation_rules, workflow_templates, email_templates, sms_templates
  - AI: si_sierra_config, si_kb_articles
  - Files: files, photo_albums
  - Settings: telecom_settings, measurement_business_info, measurement_orders
  - Support: support_tickets
  - Templates: instant_estimate_templates
*/

-- Add organization_id to automation_rules table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'automation_rules' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE automation_rules ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_automation_rules_organization_id ON automation_rules(organization_id);
  END IF;
END $$;

-- Add organization_id to workflow_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_templates' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE workflow_templates ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_workflow_templates_organization_id ON workflow_templates(organization_id);
  END IF;
END $$;

-- Add organization_id to email_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_email_templates_organization_id ON email_templates(organization_id);
  END IF;
END $$;

-- Add organization_id to sms_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_templates' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE sms_templates ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_sms_templates_organization_id ON sms_templates(organization_id);
  END IF;
END $$;

-- Add organization_id to si_sierra_config table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'si_sierra_config' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE si_sierra_config ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_si_sierra_config_organization_id ON si_sierra_config(organization_id);
  END IF;
END $$;

-- Add organization_id to si_kb_articles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'si_kb_articles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE si_kb_articles ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_si_kb_articles_organization_id ON si_kb_articles(organization_id);
  END IF;
END $$;

-- Add organization_id to files table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE files ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_files_organization_id ON files(organization_id);
  END IF;
END $$;

-- Add organization_id to photo_albums table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photo_albums' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE photo_albums ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_photo_albums_organization_id ON photo_albums(organization_id);
  END IF;
END $$;

-- Add organization_id to telecom_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telecom_settings' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE telecom_settings ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_telecom_settings_organization_id ON telecom_settings(organization_id);
  END IF;
END $$;

-- Add organization_id to measurement_business_info table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_business_info' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE measurement_business_info ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_measurement_business_info_organization_id ON measurement_business_info(organization_id);
  END IF;
END $$;

-- Add organization_id to measurement_orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_orders' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE measurement_orders ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_measurement_orders_organization_id ON measurement_orders(organization_id);
  END IF;
END $$;

-- Add organization_id to support_tickets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_support_tickets_organization_id ON support_tickets(organization_id);
  END IF;
END $$;

-- Add organization_id to instant_estimate_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instant_estimate_templates' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE instant_estimate_templates ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_instant_estimate_templates_organization_id ON instant_estimate_templates(organization_id);
  END IF;
END $$;

-- Add organization_id to dashboard_widgets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dashboard_widgets' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE dashboard_widgets ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_dashboard_widgets_organization_id ON dashboard_widgets(organization_id);
  END IF;
END $$;

-- Add organization_id to payment_methods table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_methods' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE payment_methods ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_payment_methods_organization_id ON payment_methods(organization_id);
  END IF;
END $$;

-- Add organization_id to subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
  END IF;
END $$;