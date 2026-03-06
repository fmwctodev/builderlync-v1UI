import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface SupportTicket {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  image?: File | null;
}

export interface SupportTicketListItem {
  id: string;
  ticket_number: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  jira_issue_id?: string | null;
}

export interface TicketListQuery {
  page?: number;
  limit?: number;
  status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  search?: string;
}

export interface TicketListResponse {
  success: boolean;
  data: SupportTicketListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const supportApi = {
  async submitTicket(data: SupportTicket): Promise<{ success: boolean; message: string }> {
    let payload: any = data;
    const headers: any = getAuthHeaders();

    if (data.image) {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      formData.append('priority', data.priority);
      formData.append('image', data.image);
      payload = formData;
      // Remove Content-Type to let browser set it with boundary
      delete headers['Content-Type'];
    }

    const response = await axios.post(`${API_BASE_URL}/support`, payload, {
      headers,
    });
    return response.data;
  },

  async getMyTickets(query: TicketListQuery = {}): Promise<TicketListResponse> {
    const response = await axios.get(`${API_BASE_URL}/support`, {
      headers: getAuthHeaders(),
      params: query,
    });
    return response.data;
  },

  async getTicketById(ticketId: string): Promise<{ success: boolean; data: SupportTicketListItem }> {
    const response = await axios.get(`${API_BASE_URL}/support/${ticketId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
