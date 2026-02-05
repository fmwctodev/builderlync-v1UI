import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/ai-agents`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateAgentPayload {
  organization_id: string;
  name: string;
  description?: string;
  agent_type: 'voice' | 'chat' | 'email' | 'sms';
  system_prompt?: string;
  first_message?: string;
  voice_id?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface UpdateAgentPayload {
  name?: string;
  description?: string;
  status?: 'active' | 'paused' | 'draft';
  system_prompt?: string;
  first_message?: string;
  first_message_interruptible?: boolean;
  voice_id?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
  voices?: any[];
  languages?: any[];
  system_tools?: any[];
  authentication_enabled?: boolean;
  allowlist?: string[];
  overrides?: any;
  conversation_initiation_webhook?: any;
  post_call_webhook?: any;
  daily_call_limit?: number;
  concurrent_call_limit?: number;
  bursting_enabled?: boolean;
  [key: string]: any;
}

export interface CreatePhoneNumberPayload {
  organization_id: string;
  phone_number: string;
  label: string;
  sid: string;
  token: string;
}

export interface AssignPhonePayload {
  phone_number_id: string;
  agent_id: string;
}

export interface UnassignPhonePayload {
  phone_number_id: string;
}

// Agent APIs
export const elevenlabsApi = {
  // Agents
  async createAgent(payload: CreateAgentPayload) {
    const response = await api.post('/', payload);
    return response.data;
  },

  async getAgents(organizationId: string) {
    const response = await api.get('/', {
      params: { organization_id: organizationId },
    });
    return response.data;
  },

  async getAgent(agentId: string) {
    const response = await api.get(`/${agentId}`);
    return response.data;
  },

  async updateAgent(agentId: string, payload: UpdateAgentPayload) {
    const response = await api.patch(`/${agentId}`, payload);
    return response.data;
  },

  async deleteAgent(agentId: string) {
    const response = await api.delete(`/${agentId}`);
    return response.data;
  },

  // Phone Numbers
  async createPhoneNumber(payload: CreatePhoneNumberPayload) {
    const response = await api.post('/phone-numbers', payload);
    return response.data;
  },

  async getPhoneNumbers() {
    const response = await api.get('/phone-numbers');
    return response.data;
  },

  async assignPhoneToAgent(payload: AssignPhonePayload) {
    const response = await api.post('/phone-numbers/assign', payload);
    return response.data;
  },

  async unassignPhoneFromAgent(payload: UnassignPhonePayload) {
    const response = await api.post('/phone-numbers/unassign', payload);
    return response.data;
  },

  async deletePhoneNumber(phoneNumberId: string) {
    const response = await api.delete(`/phone-numbers/${phoneNumberId}`);
    return response.data;
  },

  // Voices
  async listVoices() {
    const response = await api.get('/voices');
    return response.data;
  },

  async getAgentVoice(agentId: string) {
    const response = await api.get(`/${agentId}/voice`);
    return response.data;
  },

  async getAgentKnowledgeBase(agentId: string) {
    const response = await api.get(`/${agentId}/knowledge-base`);
    return response.data;
  },

  async addKnowledgeBaseUrl(agentId: string, url: string, name: string) {
    const response = await api.post(`/${agentId}/knowledge-base/url`, { url, name });
    return response.data;
  },

  async addKnowledgeBaseFile(agentId: string, file: File, name: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    const response = await api.post(`/${agentId}/knowledge-base/file`, formData);
    return response.data;
  },

  // Conversations
  async getConversations(agentId?: string) {
    const response = await api.get('/conversations', {
      params: agentId ? { agent_id: agentId } : {},
    });
    return response.data;
  },

  // Twilio Integration
  async checkTwilioIntegration() {
    const response = await api.get('/twilio/check');
    return response.data;
  },

  // Client Tools
  async getClientTools(agentId: string) {
    const response = await api.get(`/${agentId}/client-tools`);
    return response.data;
  },

  async createClientTool(agentId: string, toolData: any) {
    const response = await api.post(`/${agentId}/client-tools`, toolData);
    return response.data;
  },

  async updateClientTool(toolId: string, updates: any) {
    const response = await api.patch(`/client-tools/${toolId}`, updates);
    return response.data;
  },

  async deleteClientTool(toolId: string) {
    const response = await api.delete(`/client-tools/${toolId}`);
    return response.data;
  },
};
