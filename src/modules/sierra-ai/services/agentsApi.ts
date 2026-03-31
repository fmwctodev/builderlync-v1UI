

export interface VoiceConfig {
  id: string;
  name: string;
  isPrimary: boolean;
  provider?: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  isDefault: boolean;
}

export interface SystemTool {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export const DEFAULT_SYSTEM_TOOLS: SystemTool[] = [
  { id: 'end_conversation', name: 'End conversation', enabled: false },
  { id: 'detect_language', name: 'Detect language', enabled: false },
  { id: 'skip_turn', name: 'Skip turn', enabled: false },
  { id: 'transfer_to_agent', name: 'Transfer to agent', enabled: false },
  { id: 'transfer_to_number', name: 'Transfer to number', enabled: false },
  { id: 'play_keypad_tone', name: 'Play keypad touch tone', enabled: false },
  { id: 'voicemail_detection', name: 'Voicemail detection', enabled: false },
  { id: 'send_sms', name: 'Send SMS', enabled: false },
];

export interface SecurityOverrides {
  agent_language: boolean;
  first_message: boolean;
  system_prompt: boolean;
  llm: boolean;
  voice: boolean;
  voice_speed: boolean;
  voice_stability: boolean;
  voice_similarity: boolean;
  text_only: boolean;
}

export interface WebhookConfig {
  url: string | null;
  enabled: boolean;
}

export const DEFAULT_SECURITY_OVERRIDES: SecurityOverrides = {
  agent_language: false,
  first_message: false,
  system_prompt: false,
  llm: false,
  voice: false,
  voice_speed: false,
  voice_stability: false,
  voice_similarity: false,
  text_only: false,
};

export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  url: null,
  enabled: false,
};

export interface AIAgent {
  agent_id: string;
  organization_id: string;
  name: string;
  description: string;
  agent_type: 'voice' | 'chat' | 'email' | 'sms';
  status: 'active' | 'paused' | 'draft';
  template_id?: string;
  template_type?: string;
  industry?: string;
  use_case?: string;
  website?: string;
  main_goal?: string;
  chat_only?: boolean;
  voice_id?: string;
  phone_number?: string;
  channels: {
    voice?: { enabled: boolean; configured: boolean };
    sms?: { enabled: boolean; configured: boolean };
    webchat?: { enabled: boolean; configured: boolean };
    email?: { enabled: boolean; configured: boolean };
  };
  personality?: Record<string, unknown>;
  knowledge_base_ids?: string[];
  script?: string;
  settings?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  system_prompt?: string;
  voices?: VoiceConfig[];
  languages?: LanguageConfig[];
  first_message?: string;
  first_message_interruptible?: boolean;
  system_tools?: SystemTool[];
  llm_model?: string;
  default_personality?: boolean;
  timezone?: string;
  authentication_enabled?: boolean;
  allowlist?: string[];
  overrides?: SecurityOverrides;
  conversation_initiation_webhook?: WebhookConfig;
  post_call_webhook?: WebhookConfig;
  daily_call_limit?: number;
  concurrent_call_limit?: number;
  bursting_enabled?: boolean;
  stats: {
    callsHandled?: number;
    messagesHandled?: number;
    appointmentsBooked?: number;
    calls?: number;
    messages?: number;
    successRate?: number;
    avgDuration?: number;
  };
  id: string;
  Vapi_data?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  data?: any;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  agent_type: 'voice' | 'chat' | 'email' | 'sms';
  status?: 'active' | 'paused' | 'draft';
  template_id?: string;
  template_type?: string;
  industry?: string;
  use_case?: string;
  website?: string;
  main_goal?: string;
  chat_only?: boolean;
  voice_id?: string;
  phone_number?: string;
  channels?: AIAgent['channels'];
  personality?: Record<string, unknown>;
  knowledge_base_ids?: string[];
  script?: string;
  settings?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  system_prompt?: string;
  voices?: VoiceConfig[];
  languages?: LanguageConfig[];
  first_message?: string;
  first_message_interruptible?: boolean;
  system_tools?: SystemTool[];
  llm_model?: string;
  default_personality?: boolean;
  timezone?: string;
  authentication_enabled?: boolean;
  allowlist?: string[];
  overrides?: SecurityOverrides;
  conversation_initiation_webhook?: WebhookConfig;
  post_call_webhook?: WebhookConfig;
  daily_call_limit?: number;
  concurrent_call_limit?: number;
  bursting_enabled?: boolean;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  id: string;
  stats?: {
    callsHandled?: number;
    messagesHandled?: number;
    appointmentsBooked?: number;
    calls?: number;
    messages?: number;
    successRate?: number;
    avgDuration?: number;
  };
}

import { vapiApi } from './vapiApi';

export async function fetchAgents(organizationId: string): Promise<AIAgent[]> {
  const response = await vapiApi.getAgents(organizationId);
  return response.data || [];
}

export async function fetchAgentById(id: string): Promise<AIAgent | null> {
  console.log('fetchAgentById called with id:', id);
  const response = await vapiApi.getAgent(id);
  console.log('fetchAgentById response:', response);
  return response.data || response;
}

export async function createAgent(
  organizationId: string,
  input: CreateAgentInput,
  userId?: string
): Promise<AIAgent> {
  // ... (keeping the same logic for defaultChannels and defaultStats)
  const defaultChannels = {
    voice: { enabled: false, configured: false },
    sms: { enabled: false, configured: false },
    webchat: { enabled: false, configured: false },
    email: { enabled: false, configured: false },
  };

  const defaultStats = {
    callsHandled: 0,
    messagesHandled: 0,
    appointmentsBooked: 0,
    calls: 0,
    messages: 0,
    successRate: 0,
    avgDuration: 0,
  };

  const agentData = {
    organization_id: organizationId,
    name: input.name,
    description: input.description || '',
    agent_type: input.agent_type,
    status: input.status || 'draft',
    template_id: input.template_id,
    template_type: input.template_type,
    industry: input.industry,
    use_case: input.use_case,
    website: input.website,
    main_goal: input.main_goal,
    chat_only: input.chat_only || false,
    voice_id: input.voice_id,
    phone_number: input.phone_number,
    channels: { ...defaultChannels, ...input.channels },
    personality: input.personality || {},
    knowledge_base_ids: input.knowledge_base_ids || [],
    script: input.script || '',
    settings: input.settings || {},
    configuration: input.configuration || {},
    system_tools: input.system_tools || DEFAULT_SYSTEM_TOOLS,
    authentication_enabled: input.authentication_enabled ?? false,
    allowlist: input.allowlist || [],
    overrides: input.overrides || DEFAULT_SECURITY_OVERRIDES,
    conversation_initiation_webhook: input.conversation_initiation_webhook || DEFAULT_WEBHOOK_CONFIG,
    post_call_webhook: input.post_call_webhook || DEFAULT_WEBHOOK_CONFIG,
    daily_call_limit: input.daily_call_limit ?? 100000,
    concurrent_call_limit: input.concurrent_call_limit ?? -1,
    bursting_enabled: input.bursting_enabled ?? true,
    stats: defaultStats,
    created_by: userId,
    updated_by: userId,
  };

  const response = await vapiApi.createAgent(agentData as any);
  return response.data || response;
}

export async function updateAgent(
  input: UpdateAgentInput,
  userId?: string
): Promise<AIAgent> {
  const { id, ...updates } = input;
  console.log("input", input);
  const response = await vapiApi.updateAgent(id, updates);
  return response.data || response;
}

export async function deleteAgent(id: string): Promise<void> {
  await vapiApi.deleteAgent(id);
}

/**
 * Duplicate an agent
 */
export async function duplicateAgent(
  id: string,
  organizationId: string,
  userId?: string
): Promise<AIAgent> {
  // Fetch the original agent
  const original = await fetchAgentById(id);
  if (!original) {
    throw new Error('Agent not found');
  }

  // Create a copy with a new name
  const copyInput: CreateAgentInput = {
    name: `${original.name} (Copy)`,
    description: original.description,
    agent_type: original.agent_type,
    status: 'draft', // New copies start as draft
    template_id: original.template_id,
    template_type: original.template_type,
    industry: original.industry,
    use_case: original.use_case,
    website: original.website,
    main_goal: original.main_goal,
    chat_only: original.chat_only,
    voice_id: original.voice_id,
    phone_number: original.phone_number,
    channels: original.channels,
    personality: original.personality,
    knowledge_base_ids: original.knowledge_base_ids,
    script: original.script,
    settings: original.settings,
    configuration: original.configuration,
  };

  return createAgent(organizationId, copyInput, userId);
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  id: string,
  status: 'active' | 'paused' | 'draft',
  userId?: string
): Promise<AIAgent> {
  return updateAgent({ id, status }, userId);
}

/**
 * Update agent stats
 */
export async function updateAgentStats(
  id: string,
  stats: Partial<AIAgent['stats']>
): Promise<AIAgent> {
  const agent = await fetchAgentById(id);
  if (!agent) {
    throw new Error('Agent not found');
  }

  const updatedStats = {
    ...agent.stats,
    ...stats,
  };

  return updateAgent({ id, stats: updatedStats });
}
