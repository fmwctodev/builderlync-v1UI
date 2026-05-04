import axios from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const api = axios.create({
  baseURL: `${SUPABASE_URL}/functions/v1`,
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  },
});

export const dashboardApiService = {
  async getWidgets() {
    const { data } = await api.get('/get-dashboard-widgets');
    return data.data || [];
  },

  async getUserPreferences(userId: string) {
    const { data } = await api.post('/get-user-preferences', { userId });
    return data.data || [];
  },

  async savePreferences(userId: string, preferences: any[]) {
    const { data } = await api.post('/save-dashboard-preferences', { 
      userId, 
      preferences 
    });
    return data;
  },

  async getWidgetStats(organizationId: string, widgetKeys: string[]) {
    const { data } = await api.post('/get-widget-stats', { 
      organizationId, 
      widgetKeys 
    });
    return data.data || {};
  },
};
