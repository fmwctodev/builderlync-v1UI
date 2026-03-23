/*
  # Create Proposals & Estimates System Tables
  
  1. New Tables
    - proposal_templates: Proposal templates
    - proposal_line_items: Proposal line items
    - proposal_signatures: E-signatures
    - proposal_sharing_links: Shareable links
    - proposal_versions: Version tracking
    - estimate_snapshots: Instant estimate snapshots
    - instant_estimators: Instant estimator widgets
    - instant_estimate_templates: Estimate templates
    - instant_estimate_line_items: Template line items
    - instant_estimate_materials_library: Materials library
    - org_pricing_catalog: Pricing catalog
    - instant_estimator_settings: Estimator settings
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Proposal Templates Table
CREATE TABLE IF NOT EXISTS proposal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  header_html text,
  footer_html text,
  terms_html text,
  css_styles text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  category text,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage proposal templates in their org"
    ON proposal_templates FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = proposal_templates.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proposal Line Items Table
CREATE TABLE IF NOT EXISTS proposal_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'each',
  unit_price numeric NOT NULL,
  total_price numeric,
  tax_rate numeric DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  display_order integer DEFAULT 0,
  is_optional boolean DEFAULT false,
  is_selected boolean DEFAULT true,
  category text,
  sku text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage proposal line items"
    ON proposal_line_items FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM proposals
        JOIN user_organizations ON user_organizations.organization_id = proposals.organization_id
        WHERE proposals.id = proposal_line_items.proposal_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proposal Signatures Table
CREATE TABLE IF NOT EXISTS proposal_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text,
  signer_title text,
  signature_data text,
  signature_type text DEFAULT 'drawn',
  ip_address inet,
  user_agent text,
  signed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE proposal_signatures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view proposal signatures"
    ON proposal_signatures FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM proposals
        JOIN user_organizations ON user_organizations.organization_id = proposals.organization_id
        WHERE proposals.id = proposal_signatures.proposal_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proposal Sharing Links Table
CREATE TABLE IF NOT EXISTS proposal_sharing_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  share_token text NOT NULL UNIQUE,
  password_hash text,
  expires_at timestamptz,
  max_views integer,
  view_count integer DEFAULT 0,
  allow_download boolean DEFAULT true,
  allow_signature boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz
);

ALTER TABLE proposal_sharing_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage proposal sharing links"
    ON proposal_sharing_links FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM proposals
        JOIN user_organizations ON user_organizations.organization_id = proposals.organization_id
        WHERE proposals.id = proposal_sharing_links.proposal_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proposal Versions Table
CREATE TABLE IF NOT EXISTS proposal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content_snapshot jsonb NOT NULL,
  change_summary text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, version_number)
);

ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view proposal versions"
    ON proposal_versions FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM proposals
        JOIN user_organizations ON user_organizations.organization_id = proposals.organization_id
        WHERE proposals.id = proposal_versions.proposal_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Estimate Snapshots Table
CREATE TABLE IF NOT EXISTS estimate_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_address text NOT NULL,
  property_data jsonb DEFAULT '{}'::jsonb,
  materials_calc_outputs jsonb DEFAULT '{}'::jsonb,
  pricing_snapshot jsonb DEFAULT '{}'::jsonb,
  total_estimate numeric,
  contact_id uuid REFERENCES contacts(id),
  opportunity_id uuid REFERENCES opportunities(id),
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE estimate_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage estimate snapshots in their org"
    ON estimate_snapshots FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = estimate_snapshots.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Instant Estimators Table
CREATE TABLE IF NOT EXISTS instant_estimators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  settings jsonb DEFAULT '{}'::jsonb,
  branding jsonb DEFAULT '{}'::jsonb,
  questions jsonb DEFAULT '[]'::jsonb,
  pricing_rules jsonb DEFAULT '{}'::jsonb,
  materials_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

ALTER TABLE instant_estimators ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage instant estimators in their org"
    ON instant_estimators FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = instant_estimators.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view active instant estimators"
    ON instant_estimators FOR SELECT
    TO anon
    USING (is_active = true AND is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Instant Estimate Templates Table
CREATE TABLE IF NOT EXISTS instant_estimate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  line_items jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instant_estimate_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage instant estimate templates in their org"
    ON instant_estimate_templates FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = instant_estimate_templates.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Instant Estimate Materials Library Table
CREATE TABLE IF NOT EXISTS instant_estimate_materials_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  material_name text NOT NULL,
  material_sku text,
  description text,
  category text,
  unit text DEFAULT 'each',
  unit_price numeric,
  coverage_per_unit numeric,
  coverage_unit text,
  supplier text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instant_estimate_materials_library ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage materials library in their org"
    ON instant_estimate_materials_library FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = instant_estimate_materials_library.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Org Pricing Catalog Table
CREATE TABLE IF NOT EXISTS org_pricing_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  unit text DEFAULT 'each',
  default_unit_price numeric NOT NULL,
  cost_price numeric,
  markup_percent numeric,
  tax_rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, sku)
);

ALTER TABLE org_pricing_catalog ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage pricing catalog in their org"
    ON org_pricing_catalog FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = org_pricing_catalog.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Instant Estimator Settings Table
CREATE TABLE IF NOT EXISTS instant_estimator_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  default_estimator_id uuid REFERENCES instant_estimators(id),
  global_settings jsonb DEFAULT '{}'::jsonb,
  pricing_settings jsonb DEFAULT '{}'::jsonb,
  notification_settings jsonb DEFAULT '{}'::jsonb,
  lead_routing_settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instant_estimator_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage instant estimator settings in their org"
    ON instant_estimator_settings FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = instant_estimator_settings.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Instant Estimator Drafts Table
CREATE TABLE IF NOT EXISTS instant_estimator_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  estimator_id uuid REFERENCES instant_estimators(id),
  session_id text,
  property_address text,
  draft_data jsonb DEFAULT '{}'::jsonb,
  contact_info jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instant_estimator_drafts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage instant estimator drafts in their org"
    ON instant_estimator_drafts FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = instant_estimator_drafts.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposal_templates_org ON proposal_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposal_line_items_proposal ON proposal_line_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_proposal ON proposal_signatures(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sharing_links_proposal ON proposal_sharing_links(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sharing_links_token ON proposal_sharing_links(share_token);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal ON proposal_versions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_estimate_snapshots_org ON estimate_snapshots(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimators_org ON instant_estimators(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimators_slug ON instant_estimators(slug);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_templates_org ON instant_estimate_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimate_materials_org ON instant_estimate_materials_library(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_pricing_catalog_org ON org_pricing_catalog(organization_id);
CREATE INDEX IF NOT EXISTS idx_instant_estimator_drafts_org ON instant_estimator_drafts(organization_id);
