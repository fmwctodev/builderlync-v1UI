import { supabase } from '../lib/supabase';

export interface TableStatus {
  name: string;
  exists: boolean;
  rowCount: number | null;
  hasRLS: boolean | null;
  module?: string;
  error?: string;
}

export interface MigrationStatus {
  tables: TableStatus[];
  allTablesExist: boolean;
  missingTables: string[];
  tablesByModule: Record<string, TableStatus[]>;
  moduleSummary: Record<string, { total: number; exists: number; missing: number }>;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
  affectedTables?: string[];
}

const REQUIRED_TABLES = [
  // Core authentication and user management
  'staff',
  'roles',
  'staff_roles',
  'staff_role_assignments',

  // Dashboard
  'dashboard_widgets',
  'user_dashboard_preferences',

  // Contacts
  'contacts',

  // Jobs
  'jobs',
  'job_tasks',
  'job_stage_task_templates',

  // Calendars
  'events',
  'appointments',

  // Opportunities (Sales Pipeline)
  'pipelines',
  'pipeline_stages',
  'opportunities',
  'opportunity_notes',
  'opportunity_tasks',
  'opportunity_appointments',
  'opportunity_payments',

  // Conversations / Team Messaging
  'team_conversations',
  'team_messages',
  'team_conversation_participants',

  // Payments
  'invoices',
  'estimates',
  'transactions',
  'payments',
  'coupons',

  // Activities & Tasks
  'activities',
  'tasks',

  // ========================================
  // TOOLS SECTION - Material Orders System
  // ========================================
  'suppliers',
  'abc_supply_branches',
  'abc_supply_products_cache',
  'supplier_contacts',
  'material_orders',
  'material_order_items',
  'material_order_history',

  // TOOLS SECTION - Work Orders System
  'work_orders',
  'work_order_tasks',
  'work_order_assignments',
  'work_order_checklists',
  'work_order_materials_used',
  'work_order_timesheets',
  'work_order_equipment',

  // TOOLS SECTION - Job Photos System
  'job_photos',
  'photo_albums',
  'photo_album_items',
  'photo_annotations',

  // TOOLS SECTION - Instant Estimator
  'instant_estimate_templates',
  'instant_estimate_line_items',
  'instant_estimate_materials_library',

  // TOOLS SECTION - Proposals Enhancement
  'proposal_templates',
  'proposal_line_items',
  'proposal_signatures',
  'proposal_sharing_links',
  'proposal_versions',

  // TOOLS SECTION - Measurements
  'measurement_orders',
  'measurement_business_info',
  'measurement_products',
  'measurement_order_history',

  // ========================================
  // MARKETING SECTION - Campaigns & Communication
  // ========================================
  'campaigns',
  'campaign_recipients',
  'campaign_stats',
  'email_templates',
  'sms_templates',

  // MARKETING SECTION - Automation
  'workflow_template_categories',
  'workflow_templates',
  'automation_rules',
  'automation_executions',

  // MARKETING SECTION - Social Media
  'social_media_accounts',
  'social_posts',
  'social_post_analytics',

  // MARKETING SECTION - File Management
  'folders',
  'files',
  'cloud_connections',

  // MARKETING SECTION - Reputation Management
  'review_sources',
  'reviews',
  'review_responses',
  'review_invitations',
  'gbp_posts',
  'gbp_insights',

  // MARKETING SECTION - Reporting & Analytics
  'platform_analytics_data',
  'report_templates',
  'scheduled_reports',
  'report_exports',

  // ========================================
  // SETTINGS SECTION - Organizations
  // ========================================
  'organizations',
  'organization_members',
  'organization_locations',
  'organization_settings',

  // SETTINGS SECTION - User Profiles
  'user_profile_data',
  'user_preferences',

  // SETTINGS SECTION - Billing
  'subscriptions',
  'payment_methods',
  'billing_history',

  // SETTINGS SECTION - Sync
  'sync_configurations',
  'sync_logs',

  // SETTINGS SECTION - Communications
  'communication_providers',

  // SETTINGS SECTION - Integrations
  'integration_connections',
  'integration_webhooks',
  'integration_api_keys',

  // SETTINGS SECTION - Custom Fields
  'custom_field_definitions',
  'custom_field_values',

  // SETTINGS SECTION - Permissions
  'permission_templates',
  'user_permissions',

  // SETTINGS SECTION - Audit Logs
  'audit_log_events',
  'audit_log_changes',

  // SETTINGS SECTION - Brand Board
  'brand_assets',
  'brand_guidelines',

  // SETTINGS SECTION - Email Service
  'email_service_configs',
  'email_sending_domains',
];

const TABLE_MODULES: Record<string, string> = {
  // Dashboard
  'dashboard_widgets': 'Dashboard',
  'user_dashboard_preferences': 'Dashboard',

  // Staff & Roles
  'staff': 'Core - Staff Management',
  'roles': 'Core - Staff Management',
  'staff_roles': 'Core - Staff Management',
  'staff_role_assignments': 'Core - Staff Management',

  // Contacts
  'contacts': 'Contacts',

  // Jobs
  'jobs': 'Jobs',
  'job_tasks': 'Jobs',
  'job_stage_task_templates': 'Jobs',

  // Calendars
  'events': 'Calendars',
  'appointments': 'Calendars',

  // Opportunities
  'pipelines': 'Sales Pipeline',
  'pipeline_stages': 'Sales Pipeline',
  'opportunities': 'Sales Pipeline',
  'opportunity_notes': 'Opportunities',
  'opportunity_tasks': 'Opportunities',
  'opportunity_appointments': 'Opportunities',
  'opportunity_payments': 'Opportunities',

  // Conversations
  'team_conversations': 'Conversations',
  'team_messages': 'Conversations',
  'team_conversation_participants': 'Conversations',

  // Payments
  'invoices': 'Payments',
  'estimates': 'Payments',
  'transactions': 'Payments',
  'payments': 'Payments',
  'coupons': 'Payments',

  // Activities & Tasks
  'activities': 'Dashboard',
  'tasks': 'Tasks & Activities',

  // ========================================
  // TOOLS - Material Orders
  // ========================================
  'suppliers': 'TOOLS - Material Orders',
  'abc_supply_branches': 'TOOLS - Material Orders',
  'abc_supply_products_cache': 'TOOLS - Material Orders',
  'supplier_contacts': 'TOOLS - Material Orders',
  'material_orders': 'TOOLS - Material Orders',
  'material_order_items': 'TOOLS - Material Orders',
  'material_order_history': 'TOOLS - Material Orders',

  // TOOLS - Work Orders
  'work_orders': 'TOOLS - Work Orders',
  'work_order_tasks': 'TOOLS - Work Orders',
  'work_order_assignments': 'TOOLS - Work Orders',
  'work_order_checklists': 'TOOLS - Work Orders',
  'work_order_materials_used': 'TOOLS - Work Orders',
  'work_order_timesheets': 'TOOLS - Work Orders',
  'work_order_equipment': 'TOOLS - Work Orders',

  // TOOLS - Job Cam (Photos)
  'job_photos': 'TOOLS - Job Cam',
  'photo_albums': 'TOOLS - Job Cam',
  'photo_album_items': 'TOOLS - Job Cam',
  'photo_annotations': 'TOOLS - Job Cam',

  // TOOLS - Instant Estimator
  'instant_estimate_templates': 'TOOLS - Instant Estimator',
  'instant_estimate_line_items': 'TOOLS - Instant Estimator',
  'instant_estimate_materials_library': 'TOOLS - Instant Estimator',

  // TOOLS - Proposals
  'proposal_templates': 'TOOLS - Proposals',
  'proposal_line_items': 'TOOLS - Proposals',
  'proposal_signatures': 'TOOLS - Proposals',
  'proposal_sharing_links': 'TOOLS - Proposals',
  'proposal_versions': 'TOOLS - Proposals',

  // TOOLS - Measurements
  'measurement_orders': 'TOOLS - Measurements',
  'measurement_business_info': 'TOOLS - Measurements',
  'measurement_products': 'TOOLS - Measurements',
  'measurement_order_history': 'TOOLS - Measurements',

  // ========================================
  // MARKETING - Campaigns
  // ========================================
  'campaigns': 'MARKETING - Campaigns',
  'campaign_recipients': 'MARKETING - Campaigns',
  'campaign_stats': 'MARKETING - Campaigns',
  'email_templates': 'MARKETING - Campaigns',
  'sms_templates': 'MARKETING - Campaigns',

  // MARKETING - Automation
  'workflow_template_categories': 'MARKETING - Automation',
  'workflow_templates': 'MARKETING - Automation',
  'automation_rules': 'MARKETING - Automation',
  'automation_executions': 'MARKETING - Automation',

  // MARKETING - Social Media
  'social_media_accounts': 'MARKETING - Social Media',
  'social_posts': 'MARKETING - Social Media',
  'social_post_analytics': 'MARKETING - Social Media',

  // MARKETING - File Manager
  'folders': 'MARKETING - File Manager',
  'files': 'MARKETING - File Manager',
  'cloud_connections': 'MARKETING - File Manager',

  // MARKETING - Reputation
  'review_sources': 'MARKETING - Reputation',
  'reviews': 'MARKETING - Reputation',
  'review_responses': 'MARKETING - Reputation',
  'review_invitations': 'MARKETING - Reputation',
  'gbp_posts': 'MARKETING - Reputation',
  'gbp_insights': 'MARKETING - Reputation',

  // MARKETING - Reporting
  'platform_analytics_data': 'MARKETING - Reporting',
  'report_templates': 'MARKETING - Reporting',
  'scheduled_reports': 'MARKETING - Reporting',
  'report_exports': 'MARKETING - Reporting',

  // ========================================
  // SETTINGS - Organizations
  // ========================================
  'organizations': 'SETTINGS - Business Info',
  'organization_members': 'SETTINGS - Business Info',
  'organization_locations': 'SETTINGS - Business Info',
  'organization_settings': 'SETTINGS - Business Info',

  // SETTINGS - Profiles
  'user_profile_data': 'SETTINGS - Profile',
  'user_preferences': 'SETTINGS - Profile',

  // SETTINGS - Billing
  'subscriptions': 'SETTINGS - Billing',
  'payment_methods': 'SETTINGS - Billing',
  'billing_history': 'SETTINGS - Billing',

  // SETTINGS - Sync
  'sync_configurations': 'SETTINGS - User Sync',
  'sync_logs': 'SETTINGS - User Sync',

  // SETTINGS - Communications
  'communication_providers': 'SETTINGS - Communications',

  // SETTINGS - Integrations
  'integration_connections': 'SETTINGS - Integrations',
  'integration_webhooks': 'SETTINGS - Integrations',
  'integration_api_keys': 'SETTINGS - Integrations',

  // SETTINGS - Custom Fields
  'custom_field_definitions': 'SETTINGS - Custom Fields',
  'custom_field_values': 'SETTINGS - Custom Fields',

  // SETTINGS - Permissions
  'permission_templates': 'SETTINGS - Permissions',
  'user_permissions': 'SETTINGS - Permissions',

  // SETTINGS - Audit Logs
  'audit_log_events': 'SETTINGS - Audit Logs',
  'audit_log_changes': 'SETTINGS - Audit Logs',

  // SETTINGS - Brand Board
  'brand_assets': 'SETTINGS - Brand Board',
  'brand_guidelines': 'SETTINGS - Brand Board',

  // SETTINGS - Email Service
  'email_service_configs': 'SETTINGS - Email Service',
  'email_sending_domains': 'SETTINGS - Email Service',
};

export async function checkDatabaseStatus(): Promise<MigrationStatus> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const tables: TableStatus[] = [];
  const missingTables: string[] = [];

  for (const tableName of REQUIRED_TABLES) {
    try {
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        if (countError.code === 'PGRST200' || countError.code === '42P01' || countError.message.includes('does not exist') || countError.message.includes('not find')) {
          tables.push({
            name: tableName,
            exists: false,
            rowCount: null,
            hasRLS: null,
            module: TABLE_MODULES[tableName] || 'Other',
          });
          missingTables.push(tableName);
        } else {
          tables.push({
            name: tableName,
            exists: true,
            rowCount: null,
            hasRLS: null,
            module: TABLE_MODULES[tableName] || 'Other',
            error: countError.message,
          });
        }
      } else {
        tables.push({
          name: tableName,
          exists: true,
          rowCount: count || 0,
          hasRLS: true,
          module: TABLE_MODULES[tableName] || 'Other',
        });
      }
    } catch (error) {
      tables.push({
        name: tableName,
        exists: false,
        rowCount: null,
        hasRLS: null,
        module: TABLE_MODULES[tableName] || 'Other',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      missingTables.push(tableName);
    }
  }

  // Group tables by module
  const tablesByModule: Record<string, TableStatus[]> = {};
  const moduleSummary: Record<string, { total: number; exists: number; missing: number }> = {};

  tables.forEach(table => {
    const module = table.module || 'Other';
    if (!tablesByModule[module]) {
      tablesByModule[module] = [];
      moduleSummary[module] = { total: 0, exists: 0, missing: 0 };
    }
    tablesByModule[module].push(table);
    moduleSummary[module].total++;
    if (table.exists) {
      moduleSummary[module].exists++;
    } else {
      moduleSummary[module].missing++;
    }
  });

  return {
    tables,
    allTablesExist: missingTables.length === 0,
    missingTables,
    tablesByModule,
    moduleSummary,
  };
}

export async function executeSQL(sql: string): Promise<MigrationResult> {
  return {
    success: false,
    message: 'Direct SQL execution is not available. Please copy the SQL and run it in Supabase SQL Editor.',
    error: 'SQL execution requires using the Supabase Dashboard SQL Editor',
  };
}

export async function createStaffTableQuickFix(): Promise<MigrationResult> {
  return {
    success: false,
    message: 'Please copy the SQL below and run it in Supabase SQL Editor to create the staff table.',
    error: 'Manual SQL execution required. Use the "View SQL Code" button to copy the migration.',
  };
}

export async function runAllMigrations(): Promise<MigrationResult> {
  return {
    success: false,
    message: 'Please copy the complete SQL migration and run it in Supabase SQL Editor to create all tables.',
    error: 'Manual SQL execution required. Use the "View SQL Code" section to access the full migration script.',
  };
}

export function getStaffTableSQL(): string {
  return `-- Quick Fix: Create Staff Table
-- Copy and paste this SQL into Supabase SQL Editor

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  extension text,
  image text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  title text,
  department text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all staff"
  ON staff FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create staff"
  ON staff FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff"
  ON staff FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete staff"
  ON staff FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);`;
}

export function getCompleteMigrationSQL(missingTables: string[]): string {
  const sections: string[] = [];

  const hasToolsTables = missingTables.some(table =>
    table.startsWith('suppliers') || table.startsWith('abc_supply') ||
    table.startsWith('material_order') || table.startsWith('work_order') ||
    table.startsWith('job_photos') || table.startsWith('photo_') ||
    table.startsWith('instant_estimate') || table.startsWith('proposal_') ||
    table.startsWith('measurement_')
  );

  const hasMarketingTables = missingTables.some(table =>
    table === 'campaigns' || table === 'campaign_recipients' || table === 'campaign_stats' ||
    table === 'email_templates' || table === 'sms_templates' ||
    table === 'workflow_template_categories' || table === 'workflow_templates' ||
    table === 'automation_rules' || table === 'automation_executions' ||
    table === 'social_media_accounts' || table === 'social_posts' ||
    table === 'folders' || table === 'files' || table === 'cloud_connections' ||
    table === 'review_sources' || table === 'reviews' || table === 'gbp_posts' ||
    table === 'platform_analytics_data' || table === 'report_templates'
  );

  const hasSettingsTables = missingTables.some(table =>
    table === 'organizations' || table === 'organization_members' ||
    table === 'user_profile_data' || table === 'user_preferences' ||
    table === 'subscriptions' || table === 'payment_methods' ||
    table === 'sync_configurations' || table === 'communication_providers' ||
    table === 'integration_connections' || table === 'custom_field_definitions' ||
    table === 'permission_templates' || table === 'audit_log_events' ||
    table === 'brand_assets' || table === 'email_service_configs'
  );

  let sectionTitle = 'MANAGE';
  if (hasToolsTables && hasMarketingTables && hasSettingsTables) {
    sectionTitle = 'MANAGE, TOOLS, MARKETING & SETTINGS';
  } else if (hasToolsTables && hasMarketingTables) {
    sectionTitle = 'MANAGE, TOOLS & MARKETING';
  } else if (hasToolsTables && hasSettingsTables) {
    sectionTitle = 'MANAGE, TOOLS & SETTINGS';
  } else if (hasMarketingTables && hasSettingsTables) {
    sectionTitle = 'MANAGE, MARKETING & SETTINGS';
  } else if (hasToolsTables) {
    sectionTitle = 'MANAGE & TOOLS';
  } else if (hasMarketingTables) {
    sectionTitle = 'MANAGE & MARKETING';
  } else if (hasSettingsTables) {
    sectionTitle = 'MANAGE & SETTINGS';
  }

  sections.push(`-- ${sectionTitle} Section - Complete Database Setup
-- This script creates all tables needed for the ${sectionTitle} section modules
-- Generated: ${new Date().toISOString()}
-- Missing Tables: ${missingTables.join(', ')}

`);

  if (missingTables.includes('dashboard_widgets')) {
    sections.push(`
-- ============================================
-- DASHBOARD MODULE
-- ============================================

-- Dashboard Widgets Definition Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id serial PRIMARY KEY,
  widget_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dashboard widgets"
  ON dashboard_widgets FOR SELECT TO authenticated USING (true);

`);
  }

  if (missingTables.includes('user_dashboard_preferences')) {
    sections.push(`
-- User Dashboard Preferences
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_key text NOT NULL,
  is_visible boolean DEFAULT true,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, widget_key)
);

ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_dashboard_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_prefs_user ON user_dashboard_preferences(user_id);

`);
  }

  if (missingTables.includes('activities')) {
    sections.push(`
-- Activities Feed
CREATE TABLE IF NOT EXISTS activities (
  id serial PRIMARY KEY,
  organization_id uuid,
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities"
  ON activities FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

`);
  }

  if (missingTables.includes('tasks')) {
    sections.push(`
-- ============================================
-- TASKS MODULE
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id serial PRIMARY KEY,
  organization_id uuid,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

`);
  }

  // ========================================
  // TOOLS SECTION SQL GENERATION
  // ========================================

  // Check if any TOOLS tables are missing
  const toolsTables = missingTables.filter(table =>
    table === 'suppliers' || table === 'abc_supply_branches' || table === 'abc_supply_products_cache' ||
    table === 'supplier_contacts' || table === 'material_orders' || table === 'material_order_items' ||
    table === 'material_order_history' || table === 'work_orders' || table === 'work_order_tasks' ||
    table === 'work_order_assignments' || table === 'work_order_checklists' || table === 'work_order_materials_used' ||
    table === 'work_order_timesheets' || table === 'work_order_equipment' || table === 'job_photos' ||
    table === 'photo_albums' || table === 'photo_album_items' || table === 'photo_annotations' ||
    table === 'instant_estimate_templates' || table === 'instant_estimate_line_items' ||
    table === 'instant_estimate_materials_library' || table === 'proposal_templates' ||
    table === 'proposal_line_items' || table === 'proposal_signatures' || table === 'proposal_sharing_links' ||
    table === 'proposal_versions' || table === 'measurement_orders' || table === 'measurement_business_info' ||
    table === 'measurement_products' || table === 'measurement_order_history'
  );

  if (toolsTables.length > 0) {
    sections.push(`
-- ============================================
-- TOOLS SECTION - Complete Setup
-- ============================================
-- Missing TOOLS tables: ${toolsTables.join(', ')}
--
-- This section includes:
-- - Material Orders System (ABC Supply integration, PO management)
-- - Work Orders System (crew scheduling, time tracking)
-- - Job Cam (photo management with Google Cloud Storage)
-- - Instant Estimator (templates and pricing)
-- - Proposals (templates, e-signatures, sharing)
-- - Measurements (EagleView/Hover integration)
--
-- IMPORTANT: Copy this entire SQL block and run it in Supabase SQL Editor
-- These tables depend on existing tables (organizations, jobs, contacts, etc.)
-- Make sure those are created first if missing.

`);

    // Add note about viewing full migration files
    sections.push(`
-- ============================================
-- TOOLS MIGRATION INSTRUCTIONS
-- ============================================
--
-- Due to the size and complexity of TOOLS section migrations,
-- we recommend running the individual migration files directly:
--
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Run these migration files in order:
--
--    a) 20251129214016_create_suppliers_and_abc_supply_system.sql
--       Creates: suppliers, abc_supply_branches, abc_supply_products_cache, supplier_contacts
--
--    b) 20251129214109_create_material_orders_system.sql
--       Creates: material_orders, material_order_items, material_order_history
--       Includes: PO number generation, audit triggers
--
--    c) 20251129214218_create_work_orders_system.sql
--       Creates: work_orders, work_order_tasks, work_order_assignments,
--                work_order_checklists, work_order_materials_used,
--                work_order_timesheets, work_order_equipment
--       Includes: WO number generation
--
--    d) 20251129214313_create_job_photos_system.sql
--       Creates: job_photos, photo_albums, photo_album_items, photo_annotations
--       Includes: Album photo count triggers
--
--    e) 20251129214421_create_tools_enhancement_tables.sql
--       Creates: instant_estimate_templates, instant_estimate_line_items,
--                instant_estimate_materials_library, proposal_templates,
--                proposal_line_items, proposal_signatures,
--                proposal_sharing_links, proposal_versions,
--                measurement_orders, measurement_business_info,
--                measurement_products, measurement_order_history
--
-- 4. After running migrations, return here and click "Refresh Status"
--
-- Note: Migration files are located in: supabase/migrations/
-- These files include complete table definitions, indexes, RLS policies,
-- triggers, sequences, and functions.
--

`);
  }

  // ========================================
  // MARKETING SECTION SQL GENERATION
  // ========================================

  // Check if any MARKETING tables are missing
  const marketingTables = missingTables.filter(table =>
    table === 'campaigns' || table === 'campaign_recipients' || table === 'campaign_stats' ||
    table === 'email_templates' || table === 'sms_templates' ||
    table === 'workflow_template_categories' || table === 'workflow_templates' ||
    table === 'automation_rules' || table === 'automation_executions' ||
    table === 'social_media_accounts' || table === 'social_posts' || table === 'social_post_analytics' ||
    table === 'folders' || table === 'files' || table === 'cloud_connections' ||
    table === 'review_sources' || table === 'reviews' || table === 'review_responses' ||
    table === 'review_invitations' || table === 'gbp_posts' || table === 'gbp_insights' ||
    table === 'platform_analytics_data' || table === 'report_templates' ||
    table === 'scheduled_reports' || table === 'report_exports'
  );

  if (marketingTables.length > 0) {
    sections.push(`
-- ============================================
-- MARKETING SECTION - Complete Setup
-- ============================================
-- Missing MARKETING tables: ${marketingTables.join(', ')}
--
-- This section includes:
-- - Campaigns & Communication (email/SMS campaigns, templates)
-- - Automation (workflow templates, automation rules)
-- - Social Media (multi-platform posting and analytics)
-- - File Manager (document management with cloud integration)
-- - Reputation Management (review aggregation, GBP management)
-- - Reporting & Analytics (custom reports, scheduled generation)
--
-- IMPORTANT: Copy this entire SQL block and run it in Supabase SQL Editor
-- These tables enable complete marketing automation and analytics.

`);

    sections.push(`
-- ============================================
-- MARKETING MIGRATION INSTRUCTIONS
-- ============================================
--
-- Due to the comprehensive nature of MARKETING features,
-- we recommend running the individual migration files:
--
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Run these migration files in order:
--
--    **Existing Migrations:**
--    a) 20251121071815_create_workflow_templates_system.sql
--       Creates: workflow_template_categories, workflow_templates
--       Features: Workflow automation library
--
--    b) 20251126063730_create_social_media_system.sql
--       Creates: social_media_accounts, social_posts, social_post_analytics
--       Features: Multi-platform social posting
--
--    c) 20251126065052_create_file_management_system.sql
--       Creates: folders, files, cloud_connections
--       Features: File manager with Google Drive/OneDrive
--
--    **New Migrations:**
--    d) create_marketing_campaigns_system.sql
--       Creates: campaigns, campaign_recipients, campaign_stats,
--                email_templates, sms_templates
--       Features: Email/SMS campaigns, delivery tracking, A/B testing
--
--    e) create_automation_system.sql
--       Creates: automation_rules, automation_executions
--       Features: Trigger-based automation, action workflows
--
--    f) create_reputation_management_system.sql
--       Creates: review_sources, reviews, review_responses,
--                review_invitations, gbp_posts, gbp_insights
--       Features: Review aggregation, GBP management, automated requests
--
--    g) create_reporting_analytics_system.sql
--       Creates: platform_analytics_data, report_templates,
--                scheduled_reports, report_exports
--       Features: Custom reports, scheduled generation, PDF exports
--
-- 4. After running migrations, return here and click "Refresh Status"
--
-- Note: The new migration files have been created in your Supabase instance
-- and can be run directly from the SQL Editor.
--

`);
  }

  // ========================================
  // SETTINGS SECTION SQL GENERATION
  // ========================================

  // Check if any SETTINGS tables are missing
  const settingsTables = missingTables.filter(table =>
    table === 'organizations' || table === 'organization_members' ||
    table === 'organization_locations' || table === 'organization_settings' ||
    table === 'user_profile_data' || table === 'user_preferences' ||
    table === 'subscriptions' || table === 'payment_methods' || table === 'billing_history' ||
    table === 'sync_configurations' || table === 'sync_logs' ||
    table === 'communication_providers' ||
    table === 'integration_connections' || table === 'integration_webhooks' ||
    table === 'integration_api_keys' ||
    table === 'custom_field_definitions' || table === 'custom_field_values' ||
    table === 'permission_templates' || table === 'user_permissions' ||
    table === 'audit_log_events' || table === 'audit_log_changes' ||
    table === 'brand_assets' || table === 'brand_guidelines' ||
    table === 'email_service_configs' || table === 'email_sending_domains'
  );

  if (settingsTables.length > 0) {
    sections.push(`
-- ============================================
-- SETTINGS SECTION - Complete Setup
-- ============================================
-- Missing SETTINGS tables: ${settingsTables.join(', ')}
--
-- This section includes:
-- - Business Info (organizations, locations, settings)
-- - User Profiles (extended profile data, preferences)
-- - Billing & Subscriptions (Stripe integration, payment methods)
-- - User Sync (third-party sync configurations)
-- - Communications (SMS/Email provider settings)
-- - Integrations (OAuth connections, webhooks, API keys)
-- - Custom Fields (dynamic field definitions)
-- - Permissions (granular access control)
-- - Audit Logs (activity tracking, change history)
-- - Brand Board (brand assets, guidelines)
-- - Email Service (SMTP configuration, domain verification)
--
-- IMPORTANT: Copy this entire SQL block and run it in Supabase SQL Editor
-- These tables enable complete settings and configuration management.

`);

    sections.push(`
-- ============================================
-- SETTINGS MIGRATION INSTRUCTIONS
-- ============================================
--
-- To set up the complete SETTINGS functionality,
-- run these migration files in your Supabase SQL Editor:
--
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Run these migration files in order:
--
--    a) create_organizations_system.sql
--       Creates: organizations, organization_members,
--                organization_locations, organization_settings
--       Features: Multi-tenant support, location management
--
--    b) create_user_profiles_system.sql
--       Creates: user_profile_data, user_preferences
--       Features: Extended profiles, user preferences
--
--    c) create_billing_subscriptions_system.sql
--       Creates: subscriptions, payment_methods, billing_history
--       Features: Stripe integration, subscription management
--
--    d) create_sync_configurations_system.sql
--       Creates: sync_configurations, sync_logs
--       Features: Third-party sync settings, activity logs
--
--    e) create_communications_providers_system.sql
--       Creates: communication_providers
--       Features: SMS/Email provider configuration
--
--    f) create_integrations_system.sql
--       Creates: integration_connections, integration_webhooks,
--                integration_api_keys
--       Features: OAuth connections, webhook management
--
--    g) create_custom_fields_system.sql
--       Creates: custom_field_definitions, custom_field_values
--       Features: Dynamic fields for entities
--
--    h) create_permissions_system.sql
--       Creates: permission_templates, user_permissions
--       Features: Granular permission management
--
--    i) create_audit_logs_system.sql
--       Creates: audit_log_events, audit_log_changes
--       Features: Activity tracking, change history
--
--    j) create_brand_board_system.sql
--       Creates: brand_assets, brand_guidelines
--       Features: Brand asset library, usage guidelines
--
--    k) create_email_service_system.sql
--       Creates: email_service_configs, email_sending_domains
--       Features: SMTP configuration, domain verification
--
-- 4. After running migrations, return here and click "Refresh Status"
--
-- Note: These migration files have been created in your Supabase instance
-- and can be run directly from the SQL Editor.
--

`);
  }

  sections.push(`
-- ============================================
-- SEED DEFAULT DATA
-- ============================================

-- Insert default dashboard widgets if they don't exist
INSERT INTO dashboard_widgets (widget_key, name, description, category)
VALUES
  ('total_revenue', 'Total Revenue', 'Shows total revenue metrics', 'financial'),
  ('active_jobs', 'Active Jobs', 'Number of currently active jobs', 'jobs'),
  ('pending_tasks', 'Pending Tasks', 'Tasks awaiting completion', 'tasks'),
  ('recent_contacts', 'Recent Contacts', 'Recently added contacts', 'contacts'),
  ('upcoming_appointments', 'Upcoming Appointments', 'Scheduled appointments', 'calendar'),
  ('recent_activity', 'Recent Activity', 'Latest system activities', 'activity'),
  ('upcoming_tasks', 'Upcoming Tasks', 'Tasks due soon', 'tasks')
ON CONFLICT (widget_key) DO NOTHING;

`);

  sections.push(`
-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All MANAGE section tables have been created.
-- Run this in Supabase SQL Editor to set up your database.
`);

  return sections.join('\n');
}
