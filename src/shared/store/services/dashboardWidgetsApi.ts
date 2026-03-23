import { supabase } from '../../lib/supabase';
import type { DashboardWidget, UserDashboardPreference, WidgetPreferenceUpdate, WidgetWithPreference } from '../../../modules/roof-runner/types/dashboard';
import { getMetricsForDashboard } from '../../constants/metricsData';

export const dashboardWidgetsApi = {
  async getAvailableWidgets(): Promise<DashboardWidget[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('name');

    if (error) throw error;

    const dbWidgets = data || [];
    const metricsCategories = getMetricsForDashboard();
    const allMetricWidgets: DashboardWidget[] = [];

    metricsCategories.forEach(category => {
      category.widgets.forEach(widget => {
        const existingWidget = dbWidgets.find(w => w.widget_key === widget.id || w.metric_id === widget.id);

        if (existingWidget) {
          allMetricWidgets.push(existingWidget);
        } else {
          allMetricWidgets.push({
            id: widget.id,
            widget_key: widget.id,
            name: widget.label,
            description: widget.description || null,
            category: category.dashboardCategory || 'reporting',
            icon_name: null,
            is_active: true,
            default_visible: widget.defaultVisible || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });
    });

    return allMetricWidgets;
  },

  async getUserPreferences(userId: string): Promise<UserDashboardPreference[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const { data, error } = await supabase
      .from('user_dashboard_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async getWidgetsWithPreferences(userId: string): Promise<WidgetWithPreference[]> {
    const [widgets, preferences] = await Promise.all([
      this.getAvailableWidgets(),
      this.getUserPreferences(userId)
    ]);

    const preferencesMap = new Map(
      preferences.map(pref => [pref.widget_key, pref])
    );

    return widgets.map(widget => {
      const userPref = preferencesMap.get(widget.widget_key);
      return {
        ...widget,
        is_visible: userPref ? userPref.is_visible : widget.default_visible,
        position: userPref ? userPref.position : 0
      };
    });
  },

  async updateUserPreferences(
    userId: string,
    updates: WidgetPreferenceUpdate[]
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const upsertData = updates.map((update, index) => ({
      user_id: userId,
      widget_key: update.widget_key,
      is_visible: update.is_visible,
      position: update.position !== undefined ? update.position : index,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('user_dashboard_preferences')
      .upsert(upsertData, {
        onConflict: 'user_id,widget_key'
      });

    if (error) throw error;
  },

  async toggleWidgetVisibility(
    userId: string,
    widgetKey: string,
    isVisible: boolean
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const { error } = await supabase
      .from('user_dashboard_preferences')
      .upsert({
        user_id: userId,
        widget_key: widgetKey,
        is_visible: isVisible,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,widget_key'
      });

    if (error) throw error;
  },

  async initializeDefaultPreferences(userId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const widgets = await this.getAvailableWidgets();
    const defaultWidgets = widgets
      .filter(w => w.default_visible)
      .map((widget, index) => ({
        user_id: userId,
        widget_key: widget.widget_key,
        is_visible: true,
        position: index
      }));

    if (defaultWidgets.length > 0) {
      const { error } = await supabase
        .from('user_dashboard_preferences')
        .insert(defaultWidgets);

      if (error && error.code !== '23505') {
        throw error;
      }
    }
  }
};
