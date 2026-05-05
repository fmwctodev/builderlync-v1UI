import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const knowledgeBaseApi = {
  async getKnowledgeBaseByAgent(agentId: string, organizationId: string) {
    const { data } = await api.get(`/knowledge-base/agent/${agentId}?organization_id=${organizationId}`);
    return data;
  },

  async getArticles(organizationId: string) {
    const { data } = await api.get(`/knowledge-base/articles?organization_id=${organizationId}`);
    return data;
  },

  async createArticle(article: {
    organization_id: string;
    title: string;
    content: string;
    source_url?: string;
    status?: string;
    collection_id?: string;
  }) {
    const { data } = await api.post('/knowledge-base/articles', article);
    return data;
  },

  async deleteArticle(id: string) {
    await api.delete(`/knowledge-base/articles/${id}`);
  },

  async getQAPairs(organizationId: string) {
    const { data } = await api.get(`/knowledge-base/qapairs?organization_id=${organizationId}`);
    return data;
  },

  async createQAPair(qapair: {
    organization_id: string;
    question_pattern: string;
    answer: string;
    intent?: string;
    priority?: string;
    status?: string;
    offer_to_book?: boolean;
    allow_ranges?: boolean;
    collection_id?: string;
    agent_id?: string;
  }) {
    const { data } = await api.post('/knowledge-base/qapairs', qapair);
    return data;
  },

  async deleteQAPair(id: string) {
    await api.delete(`/knowledge-base/qapairs/${id}`);
  },

  async getTables(organizationId: string) {
    const { data } = await api.get(`/knowledge-base/tables?organization_id=${organizationId}`);
    return data;
  },

  async createTable(table: {
    organization_id: string;
    name: string;
    description?: string;
    columns: string[];
    rows: Record<string, any>[];
    collection_id?: string;
    agent_id?: string;
  }) {
    const { data } = await api.post('/knowledge-base/tables', table);
    return data;
  },

  async deleteTable(id: string) {
    await api.delete(`/knowledge-base/tables/${id}`);
  },

  async getDocuments(organizationId: string) {
    const { data } = await api.get(`/knowledge-base/documents?organization_id=${organizationId}`);
    return data;
  },

  async uploadDocument(formData: FormData) {
    const { data } = await api.post('/knowledge-base/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async deleteDocument(id: string) {
    await api.delete(`/knowledge-base/documents/${id}`);
  },

  async getScrapedWebsites(organizationId: string) {
    const { data } = await api.get(`/knowledge-base/scraped-websites?organization_id=${organizationId}`);
    return data;
  },

  async deleteScrapedWebsite(id: string) {
    await api.delete(`/knowledge-base/scraped-websites/${id}`);
  },

  async scrapeWebsite(website: {
    url: string;
    organization_id: string;
    collection_id?: string;
    agent_id?: string;
  }) {
    const { data } = await api.post('/knowledge-base/scrape-website', website);
    return data;
  },

  async syncAllToVapi(payload: {
    organization_id: string;
    agent_id: string;
  }) {
    const { data } = await api.post('/knowledge-base/sync-to-Vapi', payload);
    return data;
  },
};
