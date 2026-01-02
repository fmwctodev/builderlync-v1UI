import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ChatResponse {
  message: string;
  sessionId: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const chatterMateApi = {
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const payload: { message: string; sessionId?: string } = { message };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    
    const response = await axios.post(
      `${API_URL}/api/chattermate/chat`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  }
};
