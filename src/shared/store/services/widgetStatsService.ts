import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface WidgetStat {
  value: string | number;
  subtitle?: string;
  label?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const widgetStatsService = {
  async getWidgetStats(organizationId: string, widgetKey: string): Promise<WidgetStat | null> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dashboard/stats/${widgetKey}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Error fetching stat for ${widgetKey}:`, error);
      return this.getMockStat(widgetKey);
    }
  },

  async getBulkWidgetStats(widgetKeys: string[]): Promise<Record<string, WidgetStat>> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dashboard/stats/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ widgetKeys })
      });

      if (!response.ok) throw new Error('Failed to fetch bulk stats');
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching bulk stats:', error);
      const mockStats: Record<string, WidgetStat> = {};
      widgetKeys.forEach(key => {
        mockStats[key] = this.getMockStat(key);
      });
      return mockStats;
    }
  },

  getMockStat(widgetKey: string): WidgetStat {
    const mockData: Record<string, WidgetStat> = {
      'jobs-total': { value: 23, subtitle: 'Total jobs' },
      'jobs-created': { value: 8, subtitle: 'This month' },
      'jobs-completed': { value: 5, subtitle: 'This month' },
      'jobs-in-progress': { value: 15, subtitle: 'In progress' },
      'jobs_count': { value: 23, subtitle: 'Active jobs' },
      'completed_jobs': { value: 8, subtitle: 'This month' },
      'active_jobs': { value: 15, subtitle: 'In progress' },
      
      'opportunities-total': { value: '$45,230', subtitle: 'Pipeline value' },
      'opportunities-new': { value: 12, subtitle: 'This month' },
      'opportunities-closed-won': { value: 4, subtitle: 'This month' },
      'opportunities_pipeline': { value: '$45,230', subtitle: 'Pipeline value' },
      
      'general-total-contacts': { value: 1247, subtitle: 'Total contacts' },
      'general-new-contacts': { value: 34, subtitle: 'This month' },
      'contacts_total': { value: 1247, subtitle: 'Total contacts' },
      
      'payments-total-collected': { 
        value: '$12,450', 
        subtitle: 'This month',
        trend: { value: 12, isPositive: true }
      },
      'payments-pending': { value: '$8,200', subtitle: 'Awaiting payment' },
      'payments-overdue': { value: '$2,100', subtitle: 'Overdue' },
      'revenue_total': { 
        value: '$12,450', 
        subtitle: 'This month',
        trend: { value: 12, isPositive: true }
      },
      'pending_payments': { value: '$8,200', subtitle: 'Awaiting payment' },
      
      'appointments-total': { value: 12, subtitle: 'Next 7 days' },
      'appointments-booked': { value: 18, subtitle: 'This month' },
      'today_appointments': { value: 3, subtitle: 'Scheduled for today' },
      'upcoming_appointments': { value: 12, subtitle: 'Next 7 days' },
    };

    return mockData[widgetKey] || { value: 0, subtitle: 'No data' };
  },

  async refreshAllStats(organizationId: string, widgetKeys: string[]): Promise<void> {
    if (!supabase) return;

    const promises = widgetKeys.map(key => this.getWidgetStats(organizationId, key));
    await Promise.all(promises);
  }
};
