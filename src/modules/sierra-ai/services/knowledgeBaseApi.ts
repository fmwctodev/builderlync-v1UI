import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3200';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const knowledgeBaseApi = {
  async getArticles(organizationId: string) {
    const { data } = await api.get(`/api/knowledge-base/articles?organization_id=${organizationId}`);
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
    const { data } = await api.post('/api/knowledge-base/articles', article);
    return data;
  },

  async deleteArticle(id: string) {
    await api.delete(`/api/knowledge-base/articles/${id}`);
  },

  async getQAPairs(organizationId: string) {
    const { data } = await api.get(`/api/knowledge-base/qapairs?organization_id=${organizationId}`);
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
  }) {
    const { data } = await api.post('/api/knowledge-base/qapairs', qapair);
    return data;
  },

  async deleteQAPair(id: string) {
    await api.delete(`/api/knowledge-base/qapairs/${id}`);
  },

  async getTables(organizationId: string) {
    const { data } = await api.get(`/api/knowledge-base/tables?organization_id=${organizationId}`);
    return data;
  },

  async createTable(table: {
    organization_id: string;
    name: string;
    description?: string;
    columns: string[];
    rows: Record<string, any>[];
    collection_id?: string;
  }) {
    const { data } = await api.post('/api/knowledge-base/tables', table);
    return data;
  },

  async deleteTable(id: string) {
    await api.delete(`/api/knowledge-base/tables/${id}`);
  },
};
