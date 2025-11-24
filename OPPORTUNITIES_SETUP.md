# Opportunities System Setup Guide

This guide explains how to set up the opportunities and pipelines system in your Supabase database.

## Database Setup

### Step 1: Run the Migration

Copy and run the following SQL in your Supabase SQL Editor:

```sql
-- Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pipeline_stages table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  order_position integer NOT NULL,
  color text DEFAULT '#dc2626',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
  stage_id uuid REFERENCES pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  opportunity_name text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'abandoned')),
  value numeric DEFAULT 0,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name text,
  source text,
  tags text[],
  appointment_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity_contacts table
CREATE TABLE IF NOT EXISTS opportunity_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_primary boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create opportunity_followers table
CREATE TABLE IF NOT EXISTS opportunity_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(opportunity_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline_id ON opportunities(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage_id ON opportunities(stage_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_contacts_opportunity_id ON opportunity_contacts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_followers_opportunity_id ON opportunity_followers(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_followers_user_id ON opportunity_followers(user_id);

-- Enable RLS
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipelines
CREATE POLICY "Users can view own pipelines" ON pipelines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pipelines" ON pipelines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipelines" ON pipelines FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipelines" ON pipelines FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for pipeline_stages
CREATE POLICY "Users can view stages of own pipelines" ON pipeline_stages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM pipelines WHERE pipelines.id = pipeline_stages.pipeline_id AND pipelines.user_id = auth.uid()));
CREATE POLICY "Users can create stages in own pipelines" ON pipeline_stages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM pipelines WHERE pipelines.id = pipeline_stages.pipeline_id AND pipelines.user_id = auth.uid()));
CREATE POLICY "Users can update stages in own pipelines" ON pipeline_stages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM pipelines WHERE pipelines.id = pipeline_stages.pipeline_id AND pipelines.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM pipelines WHERE pipelines.id = pipeline_stages.pipeline_id AND pipelines.user_id = auth.uid()));
CREATE POLICY "Users can delete stages from own pipelines" ON pipeline_stages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM pipelines WHERE pipelines.id = pipeline_stages.pipeline_id AND pipelines.user_id = auth.uid()));

-- RLS Policies for opportunities
CREATE POLICY "Users can view own opportunities" ON opportunities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own opportunities" ON opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON opportunities FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own opportunities" ON opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for opportunity_contacts
CREATE POLICY "Users can view contacts of own opportunities" ON opportunity_contacts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_contacts.opportunity_id AND opportunities.user_id = auth.uid()));
CREATE POLICY "Users can create contacts for own opportunities" ON opportunity_contacts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_contacts.opportunity_id AND opportunities.user_id = auth.uid()));
CREATE POLICY "Users can update contacts of own opportunities" ON opportunity_contacts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_contacts.opportunity_id AND opportunities.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_contacts.opportunity_id AND opportunities.user_id = auth.uid()));
CREATE POLICY "Users can delete contacts from own opportunities" ON opportunity_contacts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_contacts.opportunity_id AND opportunities.user_id = auth.uid()));

-- RLS Policies for opportunity_followers
CREATE POLICY "Users can view followers of own opportunities" ON opportunity_followers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_followers.opportunity_id AND opportunities.user_id = auth.uid()));
CREATE POLICY "Users can add followers to own opportunities" ON opportunity_followers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_followers.opportunity_id AND opportunities.user_id = auth.uid()));
CREATE POLICY "Users can remove followers from own opportunities" ON opportunity_followers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = opportunity_followers.opportunity_id AND opportunities.user_id = auth.uid()));
```

### Step 2: Verify Tables Created

After running the migration, verify that the following tables exist in your Supabase database:

- `pipelines`
- `pipeline_stages`
- `opportunities`
- `opportunity_contacts`
- `opportunity_followers`

## Features Implemented

### Add Opportunity Modal

The "Add Opportunity" button opens a modal with two tabs:

#### Opportunity Details Tab
- **Opportunity Name** (required) - Name of the opportunity
- **Pipeline** - Select which pipeline this opportunity belongs to
- **Stage** - Select the current stage (dynamically loaded based on selected pipeline)
- **Status** - Open, Won, Lost, or Abandoned
- **Opportunity Value** - Monetary value with $ prefix
- **Owner** - Assign to a staff member (Unassigned by default)
- **Followers** - Add team members to follow this opportunity
- **Business Name** - Associated company or business
- **Opportunity Source** - Lead source with autocomplete suggestions
- **Tags** - Add multiple tags to categorize
- **Appointment Time** - Schedule an appointment date/time

#### Contact Details Tab
- **Primary Contact Name** - Main contact person
- **Primary Email** - Contact's email address (validated)
- **Primary Phone** - Contact's phone number

### Kanban Board

The opportunities Kanban board now:
- Loads opportunities from the Supabase database
- Displays opportunities in their respective pipeline stages
- Supports drag-and-drop to move opportunities between stages
- Shows real-time opportunity counts and values per stage
- Automatically creates default pipeline on first use

### Default Pipeline

On first use, the system automatically creates a default pipeline named "001a.Commercial Leads" with these stages:

1. New Lead
2. Follow-up 1
3. Follow-up 2
4. Follow-up 3
5. Long Term Follow Up
6. In Convo
7. Inspection/Estimate Booked
8. Job Qualified
9. Job Unqualified

## Usage

1. Navigate to the Opportunities page
2. Click "Add opportunity" button
3. Fill in the opportunity details
4. Switch to "Contact details" tab to add contact information
5. Click "Create" to save the opportunity
6. The opportunity will appear in the Kanban board
7. Drag and drop opportunities between stages to update their status

## API Services

Two new API services have been created:

### opportunitiesApi
- `getOpportunities()` - Fetch all opportunities with filters
- `getOpportunityById()` - Get single opportunity details
- `createOpportunity()` - Create new opportunity
- `updateOpportunity()` - Update existing opportunity
- `moveOpportunityToStage()` - Move opportunity to different stage
- `deleteOpportunity()` - Delete opportunity
- `addFollower()` - Add follower to opportunity
- `removeFollower()` - Remove follower from opportunity

### pipelinesApi
- `getPipelines()` - Fetch all pipelines
- `getPipelineById()` - Get single pipeline with stages
- `getPipelineStages()` - Get stages for a pipeline
- `createPipeline()` - Create new pipeline with stages
- `updatePipeline()` - Update pipeline details
- `deletePipeline()` - Delete pipeline
- `createDefaultPipeline()` - Create default pipeline
- `getOrCreateDefaultPipeline()` - Get existing or create default

## Notes

- All data is secured with Row Level Security (RLS)
- Users can only access their own opportunities and pipelines
- The system automatically assigns the authenticated user as the owner
- Pipelines can be marked as default for quick access
- Opportunities track creation and update timestamps
