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
};
