/*
  # Create AI Agent Client Tools Table

  1. New Table
    - `ai_agent_client_tools`
      - `id` (uuid, primary key) - Unique identifier for the client tool
      - `agent_id` (uuid, foreign key) - References ai_agents table
      - `organization_id` (uuid, foreign key) - References organizations table for isolation
      - `name` (text) - Name of the custom tool
      - `description` (text) - Description of what the tool does
      - `wait_for_response` (boolean) - Whether agent should wait for tool to finish
      - `disable_interruptions` (boolean) - Whether to disable interruptions during execution
      - `pre_tool_speech` (text) - When to speak before tool execution: 'auto', 'always', 'never'
      - `execution_mode` (text) - When/how tool executes: 'immediately', 'after_speech', 'during_speech'
      - `parameters` (jsonb) - Array of parameter definitions with name, type, description, required
      - `webhook_url` (text) - URL to call when tool is triggered
      - `enabled` (boolean) - Whether the tool is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage tools in their organization
    - Add policies to read tools associated with their organization's agents

  3. Indexes
    - Index on agent_id for fast lookup
    - Index on organization_id for organization filtering
    - Index on enabled for filtering active tools
*/

-- Create the client tools table
CREATE TABLE IF NOT EXISTS ai_agent_client_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  wait_for_response boolean DEFAULT false,
  disable_interruptions boolean DEFAULT false,
  pre_tool_speech text DEFAULT 'auto' CHECK (pre_tool_speech IN ('auto', 'always', 'never')),
  execution_mode text DEFAULT 'after_speech' CHECK (execution_mode IN ('immediately', 'after_speech', 'during_speech')),
  parameters jsonb DEFAULT '[]'::jsonb,
  webhook_url text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_tools_agent_id ON ai_agent_client_tools(agent_id);
CREATE INDEX IF NOT EXISTS idx_client_tools_organization_id ON ai_agent_client_tools(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_tools_enabled ON ai_agent_client_tools(enabled);

-- Enable RLS
ALTER TABLE ai_agent_client_tools ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tools in their organization
CREATE POLICY "Users can view client tools in their organization"
  ON ai_agent_client_tools FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy: Users can create tools for agents in their organization
CREATE POLICY "Users can create client tools in their organization"
  ON ai_agent_client_tools FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy: Users can update tools in their organization
CREATE POLICY "Users can update client tools in their organization"
  ON ai_agent_client_tools FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy: Users can delete tools in their organization
CREATE POLICY "Users can delete client tools in their organization"
  ON ai_agent_client_tools FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_tools_updated_at_trigger
  BEFORE UPDATE ON ai_agent_client_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_client_tools_updated_at();