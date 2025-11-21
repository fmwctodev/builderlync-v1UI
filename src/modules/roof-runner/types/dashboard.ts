export type WidgetCategory = 'reporting' | 'marketing' | 'jobs' | 'opportunities' | 'payments' | 'appointments';

export interface DashboardWidget {
  id: string;
  widget_key: string;
  name: string;
  description: string | null;
  category: WidgetCategory;
  icon_name: string | null;
  is_active: boolean;
  default_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDashboardPreference {
  id: string;
  user_id: string;
  widget_key: string;
  is_visible: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface WidgetPreferenceUpdate {
  widget_key: string;
  is_visible: boolean;
  position?: number;
}

export interface WidgetWithPreference extends DashboardWidget {
  is_visible: boolean;
  position: number;
}

export const WIDGET_CATEGORIES: Record<WidgetCategory, { label: string; icon: string }> = {
  reporting: { label: 'Reporting', icon: 'BarChart3' },
  marketing: { label: 'Marketing Analytics', icon: 'TrendingUp' },
  jobs: { label: 'Jobs', icon: 'Briefcase' },
  opportunities: { label: 'Opportunities', icon: 'Target' },
  payments: { label: 'Payments', icon: 'CreditCard' },
  appointments: { label: 'Appointments', icon: 'Calendar' }
};
