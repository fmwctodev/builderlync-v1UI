const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const smtpApi = {
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/smtp/settings`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch SMTP settings');
    return response.json();
  },

  async saveSettings(settings: any) {
    const response = await fetch(`${API_BASE_URL}/smtp/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to save SMTP settings');
    return response.json();
  },

  async testConnection(settings: any) {
    const response = await fetch(`${API_BASE_URL}/smtp/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to test SMTP connection');
    return response.json();
  },

  async sendEmailMessage(contactId: string, subject: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/conversations/send-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        contact_id: contactId,
        subject,
        message
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  },

  async sendSMSMessage(contactId: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/conversations/send-sms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        contact_id: contactId,
        message
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  },

  async createTeam(name: string, description: string, members: any[]) {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        description,
        members
      })
    });
    if (!response.ok) throw new Error('Failed to create team');
    return response.json();
  },

  async getTeams() {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get teams');
    return response.json();
  },

  async sendTeamMessage(teamId: string, subject: string, message: string, messageType: 'email' | 'sms') {
    const response = await fetch(`${API_BASE_URL}/teams/send-message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        team_id: teamId,
        subject,
        message,
        message_type: messageType
      })
    });
    if (!response.ok) {
      const error = await response.json();
      if (error.error && error.error.includes('Twilio account not configured')) {
        const shouldRedirect = confirm(`${error.error}\n\nWould you like to configure SMS service now?`);
        if (shouldRedirect) {
          window.location.href = '/settings/integrations';
        }
      }
      throw error;
    }
    return response.json();
  },

  async deleteTeam(teamId: string) {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete team');
    return response.json();
  },

  // Twilio SMS Configuration
  async connectTwilio(accountSid: string, authToken: string) {
    const response = await fetch(`${API_BASE_URL}/twilio/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        accountSid,
        authToken
      })
    });
    if (!response.ok) throw new Error('Failed to connect Twilio account');
    return response.json();
  },

  async getTwilioStatus() {
    const response = await fetch(`${API_BASE_URL}/twilio/status`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get Twilio status');
    return response.json();
  },

  async disconnectTwilio() {
    const response = await fetch(`${API_BASE_URL}/twilio/disconnect`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to disconnect Twilio');
    return response.json();
  },

  async getTwilioPhoneNumbers() {
    const response = await fetch(`${API_BASE_URL}/twilio/phone-numbers`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get phone numbers');
    return response.json();
  }
};