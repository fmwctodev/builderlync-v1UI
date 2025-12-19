const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

export interface WidgetConfig {
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  show_avatar: boolean;
  show_typing_indicator: boolean;
  welcome_message: string;
  placeholder: string;
  button_text: string;
}

class WidgetApi {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Organization-Slug': localStorage.getItem('currentOrganizationSlug') || ''
    };
  }

  async getWidgetConfig(agentId: string): Promise<WidgetConfig> {
    const response = await fetch(`${API_BASE_URL}/widget/config/${agentId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch widget config');
    }

    const result = await response.json();
    return result.data;
  }

  async updateWidgetConfig(agentId: string, config: WidgetConfig): Promise<WidgetConfig> {
    const response = await fetch(`${API_BASE_URL}/widget/config/${agentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update widget config');
    }

    const result = await response.json();
    return result.data;
  }

  async getPublicWidgetConfig(agentId: string): Promise<WidgetConfig> {
    const response = await fetch(`${API_BASE_URL}/widget/public/${agentId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch public widget config');
    }

    const result = await response.json();
    return result.data;
  }

  async syncFromElevenLabs(agentId: string): Promise<WidgetConfig> {
    const response = await fetch(`${API_BASE_URL}/widget/sync/${agentId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync from ElevenLabs');
    }

    const result = await response.json();
    return result.data;
  }
}

export const widgetApi = new WidgetApi();