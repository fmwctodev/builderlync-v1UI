const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface Snippet {
  id: number;
  user_id: number;
  folder_id?: number;
  name: string;
  type: 'text' | 'email';
  subject?: string;
  body: string;
  created_at: string;
  updated_at: string;
  folder?: { id: number; name: string };
}

export interface SnippetFolder {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  snippets?: { count: number }[];
}

export const snippetsApi = {
  async getFolders(): Promise<SnippetFolder[]> {
    const response = await fetch(`${API_BASE_URL}/snippets/folders`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch folders');
    const data = await response.json();
    return data.data;
  },

  async createFolder(name: string): Promise<SnippetFolder> {
    const response = await fetch(`${API_BASE_URL}/snippets/folders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create folder');
    const data = await response.json();
    return data.data;
  },

  async deleteFolder(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/snippets/folders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete folder');
  },

  async getSnippets(): Promise<Snippet[]> {
    const response = await fetch(`${API_BASE_URL}/snippets`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch snippets');
    const data = await response.json();
    return data.data;
  },

  async createSnippet(snippet: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Snippet> {
    const response = await fetch(`${API_BASE_URL}/snippets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(snippet)
    });
    if (!response.ok) throw new Error('Failed to create snippet');
    const data = await response.json();
    return data.data;
  },

  async deleteSnippet(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete snippet');
  }
};
