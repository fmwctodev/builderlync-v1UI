import { supabase } from '../lib/supabase';

export interface ClientToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  description: string;
  required: boolean;
}

export interface ClientTool {
  id: string;
  agent_id: string;
  organization_id: string;
  name: string;
  description: string;
  wait_for_response: boolean;
  disable_interruptions: boolean;
  pre_tool_speech: 'auto' | 'always' | 'never';
  execution_mode: 'immediately' | 'after_speech' | 'during_speech';
  parameters: ClientToolParameter[];
  webhook_url: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientToolInput {
  name: string;
  description?: string;
  wait_for_response?: boolean;
  disable_interruptions?: boolean;
  pre_tool_speech?: 'auto' | 'always' | 'never';
  execution_mode?: 'immediately' | 'after_speech' | 'during_speech';
  parameters?: ClientToolParameter[];
  webhook_url?: string | null;
  enabled?: boolean;
}

export interface UpdateClientToolInput extends Partial<CreateClientToolInput> {
  id: string;
}

export async function fetchClientTools(agentId: string): Promise<ClientTool[]> {
  const { data, error } = await supabase
    .from('ai_agent_client_tools')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client tools:', error);
    throw error;
  }

  return data || [];
}

export async function createClientTool(
  agentId: string,
  organizationId: string,
  input: CreateClientToolInput
): Promise<ClientTool> {
  const toolData = {
    agent_id: agentId,
    organization_id: organizationId,
    name: input.name,
    description: input.description || '',
    wait_for_response: input.wait_for_response ?? false,
    disable_interruptions: input.disable_interruptions ?? false,
    pre_tool_speech: input.pre_tool_speech || 'auto',
    execution_mode: input.execution_mode || 'after_speech',
    parameters: input.parameters || [],
    webhook_url: input.webhook_url || null,
    enabled: input.enabled ?? true,
  };

  const { data, error } = await supabase
    .from('ai_agent_client_tools')
    .insert(toolData)
    .select()
    .single();

  if (error) {
    console.error('Error creating client tool:', error);
    throw error;
  }

  return data;
}

export async function updateClientTool(
  input: UpdateClientToolInput
): Promise<ClientTool> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from('ai_agent_client_tools')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client tool:', error);
    throw error;
  }

  return data;
}

export async function deleteClientTool(toolId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_agent_client_tools')
    .delete()
    .eq('id', toolId);

  if (error) {
    console.error('Error deleting client tool:', error);
    throw error;
  }
}

export async function toggleClientTool(
  toolId: string,
  enabled: boolean
): Promise<ClientTool> {
  const { data, error } = await supabase
    .from('ai_agent_client_tools')
    .update({ enabled })
    .eq('id', toolId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling client tool:', error);
    throw error;
  }

  return data;
}
