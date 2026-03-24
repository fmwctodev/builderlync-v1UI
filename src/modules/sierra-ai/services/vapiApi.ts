import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
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
  template?: string;
  industry?: string;
  use_case?: string;
  website?: string;
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
  [key: string]: any;
}

export interface CreatePhoneNumberPayload {
  organization_id: string;
  phone_number: string;
  label: string;
  sid: string;
  token: string;
}

export const vapiApi = {
  // Agents
  async createAgent(payload: CreateAgentPayload) {
    const response = await api.post('/ai-agents', payload);
    return response.data;
  },

  async getAgents(organizationId: string) {
    const response = await api.get('/ai-agents', {
      params: { organization_id: organizationId },
    });
    return response.data;
  },

  async getAgent(agentId: string) {
    const response = await api.get(`/ai-agents/${agentId}`);
    return response.data;
  },

  async updateAgent(agentId: string, payload: UpdateAgentPayload) {
    const response = await api.patch(`/ai-agents/${agentId}`, payload);
    return response.data;
  },

  async deleteAgent(agentId: string) {
    const response = await api.delete(`/ai-agents/${agentId}`);
    return response.data;
  },

  // Phone Numbers
  async createPhoneNumber(payload: CreatePhoneNumberPayload) {
    const response = await api.post('/ai-agents/phone-numbers', payload);
    return response.data;
  },

  async getPhoneNumbers() {
    const response = await api.get('/ai-agents/phone-numbers');
    return response.data;
  },

  async assignPhoneToAgent(payload: { phone_number_id: string; agent_id: string }) {
    const response = await api.post('/ai-agents/phone-numbers/assign', payload);
    return response.data;
  },

  async unassignPhoneFromAgent(payload: { phone_number_id: string }) {
    const response = await api.post('/ai-agents/phone-numbers/unassign', payload);
    return response.data;
  },

  async deletePhoneNumber(phoneNumberId: string) {
    const response = await api.delete(`/ai-agents/phone-numbers/${phoneNumberId}`);
    return response.data;
  },

  // Voices
  async listVoices() {
    const response = await api.get('/vapi/voices');
    return response.data;
  },

  async getAgentVoice(agentId: string) {
    const response = await api.get(`/ai-agents/${agentId}/voice`);
    return response.data;
  },

  async getAgentKnowledgeBase(agentId: string) {
    const response = await api.get(`/ai-agents/${agentId}/knowledge-base`);
    return response.data;
  },

  async addKnowledgeBaseUrl(agentId: string, url: string, name: string) {
    const response = await api.post(`/ai-agents/${agentId}/knowledge-base/url`, { url, name });
    return response.data;
  },

  async addKnowledgeBaseFile(agentId: string, file: File, name: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    const response = await api.post(`/ai-agents/${agentId}/knowledge-base/file`, formData);
    return response.data;
  },

  // Conversations
  async getConversations(agentId?: string) {
    const response = await api.get('/ai-agents/conversations', {
      params: agentId ? { agent_id: agentId } : {},
    });
    return response.data;
  },

  // Twilio Integration
  async checkTwilioIntegration() {
    const response = await api.get('/ai-agents/twilio/check');
    return response.data;
  },

  // Client Tools
  async getClientTools(agentId: string) {
    const response = await api.get(`/ai-agents/${agentId}/client-tools`);
    return response.data;
  },

  async createClientTool(agentId: string, toolData: any) {
    const response = await api.post(`/ai-agents/${agentId}/client-tools`, toolData);
    return response.data;
  },

  async updateClientTool(toolId: string, updates: any) {
    const response = await api.patch(`/ai-agents/client-tools/${toolId}`, updates);
    return response.data;
  },

  async deleteClientTool(toolId: string) {
    const response = await api.delete(`/ai-agents/client-tools/${toolId}`);
    return response.data;
  },
};
