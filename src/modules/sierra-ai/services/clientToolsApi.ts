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
  const { vapiApi } = await import('./vapiApi');
  const response = await vapiApi.getClientTools(agentId);
  return response.data || [];
}

export async function createClientTool(
  agentId: string,
  input: CreateClientToolInput
): Promise<ClientTool> {
  const toolData = {
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

  const { vapiApi } = await import('./vapiApi');
  const response = await vapiApi.createClientTool(agentId, toolData);
  return response.data;
}

export async function updateClientTool(
  input: UpdateClientToolInput
): Promise<ClientTool> {
  const { id, ...updates } = input;
  const { vapiApi } = await import('./vapiApi');
  const response = await vapiApi.updateClientTool(id, updates);
  return response.data;
}

export async function deleteClientTool(toolId: string): Promise<void> {
  const { vapiApi } = await import('./vapiApi');
  await vapiApi.deleteClientTool(toolId);
}

export async function toggleClientTool(
  toolId: string,
  enabled: boolean
): Promise<ClientTool> {
  const { vapiApi } = await import('./vapiApi');
  const response = await vapiApi.updateClientTool(toolId, { enabled });
  return response.data;
}
