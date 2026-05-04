import { supabase } from '../../lib/supabase';
import type { DashboardWidget, UserDashboardPreference, WidgetPreferenceUpdate, WidgetWithPreference } from '../../../modules/roof-runner/types/dashboard';
import { getMetricsForDashboard } from '../../constants/metricsData';

export const dashboardWidgetsApi = {
  async getAvailableWidgets(): Promise<DashboardWidget[]> {
    console.log('📊 [dashboardWidgetsApi] Getting available widgets...');
    
    const metricsCategories = getMetricsForDashboard();
    const allMetricWidgets: DashboardWidget[] = [];

    metricsCategories.forEach(category => {
      category.widgets.forEach(widget => {
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
      });
    });

    console.log(`✅ [dashboardWidgetsApi] Found ${allMetricWidgets.length} widgets`);
    return allMetricWidgets;
  },

  async getUserPreferences(userId: string): Promise<UserDashboardPreference[]> {
    console.log('👤 [dashboardWidgetsApi] Getting user preferences for:', userId);
    
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized, using localStorage');
      const stored = localStorage.getItem(`dashboard_prefs_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from('user_dashboard_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.warn('⚠️ DB error, using localStorage:', error.message);
        const stored = localStorage.getItem(`dashboard_prefs_${userId}`);
        return stored ? JSON.parse(stored) : [];
      }
      
      console.log(`✅ [dashboardWidgetsApi] Found ${data?.length || 0} preferences`);
      return data || [];
    } catch (err) {
      console.warn('⚠️ Error fetching preferences, using localStorage:', err);
      const stored = localStorage.getItem(`dashboard_prefs_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
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
    console.log('💾 [dashboardWidgetsApi] Updating preferences for:', userId, updates.length, 'widgets');
    
    const upsertData = updates.map((update, index) => ({
      id: `${userId}_${update.widget_key}`,
      user_id: userId,
      widget_key: update.widget_key,
      is_visible: update.is_visible,
      position: update.position !== undefined ? update.position : index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Save to localStorage as fallback
    localStorage.setItem(`dashboard_prefs_${userId}`, JSON.stringify(upsertData));
    console.log('✅ [dashboardWidgetsApi] Saved to localStorage');

    if (!supabase) {
      console.warn('⚠️ Supabase not initialized, only saved to localStorage');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_dashboard_preferences')
        .upsert(upsertData, {
          onConflict: 'user_id,widget_key'
        });

      if (error) {
        console.warn('⚠️ DB error, but saved to localStorage:', error.message);
      } else {
        console.log('✅ [dashboardWidgetsApi] Saved to database');
      }
    } catch (err) {
      console.warn('⚠️ Error saving to DB, but saved to localStorage:', err);
    }
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
