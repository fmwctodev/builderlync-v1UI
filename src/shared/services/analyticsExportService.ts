import { DateRange } from '../components/DateRangePicker';

export interface AnalyticsData {
  platform: string;
  metricType: string;
  metricValue: number;
  metricLabel?: string;
  date: string;
}

export const analyticsExportService = {
  exportToCSV(data: AnalyticsData[], platform: string, dateRange: DateRange): void {
    const headers = ['Date', 'Metric', 'Value', 'Label'];
    const rows = data.map(item => [
      item.date,
      item.metricType,
      item.metricValue.toString(),
      item.metricLabel || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `${platform}-analytics-${dateRange.startDate}-to-${dateRange.endDate}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToPDF(data: AnalyticsData[], platform: string, dateRange: DateRange): void {
    console.log('PDF export not yet implemented. Data:', data);
    alert('PDF export coming soon! For now, please use CSV export.');
  },

  formatPlatformName(platformId: string): string {
    const names: Record<string, string> = {
      all: 'All Platforms',
      'google-analytics': 'Google Analytics',
      meta: 'Meta/Facebook',
      'google-ads': 'Google Ads',
      tiktok: 'TikTok Ads',
      'google-business': 'Google Business',
    };
    return names[platformId] || platformId;
  },

  generateMockData(platform: string, dateRange: DateRange): AnalyticsData[] {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const data: AnalyticsData[] = [];

    const metricsByPlatform: Record<string, string[]> = {
      'google-analytics': ['sessions', 'pageviews', 'bounce_rate', 'avg_session_duration'],
      'meta': ['impressions', 'reach', 'engagement_rate', 'ctr'],
      'google-ads': ['clicks', 'cost', 'conversions', 'cpc'],
      'tiktok': ['views', 'engagement', 'completion_rate', 'cpv'],
      'google-business': ['profile_views', 'search_queries', 'direction_requests', 'phone_calls'],
    };

    const metrics = metricsByPlatform[platform] || metricsByPlatform['google-analytics'];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      metrics.forEach(metric => {
        data.push({
          platform,
          metricType: metric,
          metricValue: Math.floor(Math.random() * 1000) + 100,
          metricLabel: metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          date: dateStr,
        });
      });
    }

    return data;
  },

  aggregateMetrics(data: AnalyticsData[]): Record<string, number> {
    const aggregated: Record<string, number> = {};

    data.forEach(item => {
      if (!aggregated[item.metricType]) {
        aggregated[item.metricType] = 0;
      }
      aggregated[item.metricType] += item.metricValue;
    });

    return aggregated;
  },

  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },
};
