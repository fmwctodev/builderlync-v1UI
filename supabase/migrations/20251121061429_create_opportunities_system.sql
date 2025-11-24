/*
  # Create Opportunities and Pipelines System

  1. New Tables
    - `pipelines` - Stores sales pipelines
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text, nullable)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `pipeline_stages` - Stores stages for each pipeline
      - `id` (uuid, primary key)
      - `pipeline_id` (uuid, foreign key to pipelines)
      - `name` (text)
      - `order_position` (integer)
      - `color` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `opportunities` - Stores sales opportunities
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `pipeline_id` (uuid, foreign key to pipelines)
      - `stage_id` (uuid, foreign key to pipeline_stages)
      - `opportunity_name` (text)
      - `status` (text with check constraint)
      - `value` (numeric)
      - `owner_id` (uuid, foreign key to auth.users, nullable)
      - `business_name` (text, nullable)
      - `source` (text, nullable)
      - `tags` (text array, nullable)
      - `appointment_time` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `opportunity_contacts` - Stores contacts for opportunities
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `contact_name` (text, nullable)
      - `contact_email` (text, nullable)
      - `contact_phone` (text, nullable)
      - `is_primary` (boolean)
      - `created_at` (timestamptz)
    
    - `opportunity_followers` - Junction table for opportunity followers
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for related table access based on ownership
*/

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
