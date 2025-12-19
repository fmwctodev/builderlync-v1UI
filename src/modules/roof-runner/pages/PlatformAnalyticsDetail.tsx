import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { DateRangePicker, DateRange } from '../../../shared/components/DateRangePicker';
import { analyticsExportService, AnalyticsData } from '../../../shared/services/analyticsExportService';

const PlatformAnalyticsDetail: React.FC = () => {
  const { platform = 'all', orgSlug } = useParams<{ platform: string; orgSlug?: string }>();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });

  const platformName = analyticsExportService.formatPlatformName(platform);

  useEffect(() => {
    const mockData = analyticsExportService.generateMockData(platform, dateRange);
    setAnalyticsData(mockData);
  }, [platform, dateRange]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        analyticsExportService.exportToCSV(analyticsData, platform, dateRange);
      } else {
        analyticsExportService.exportToPDF(analyticsData, platform, dateRange);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const aggregatedMetrics = analyticsExportService.aggregateMetrics(analyticsData);

  const getMetricCards = () => {
    const metricConfigs: Record<string, Array<{ key: string; label: string; format?: string }>> = {
      'google-analytics': [
        { key: 'sessions', label: 'Total Sessions' },
        { key: 'pageviews', label: 'Page Views' },
        { key: 'bounce_rate', label: 'Bounce Rate', format: '%' },
        { key: 'avg_session_duration', label: 'Avg. Session Duration', format: 's' },
      ],
      'meta': [
        { key: 'impressions', label: 'Impressions' },
        { key: 'reach', label: 'Reach' },
        { key: 'engagement_rate', label: 'Engagement Rate', format: '%' },
        { key: 'ctr', label: 'Click-through Rate', format: '%' },
      ],
      'google-ads': [
        { key: 'clicks', label: 'Total Clicks' },
        { key: 'cost', label: 'Total Cost', format: '$' },
        { key: 'conversions', label: 'Conversions' },
        { key: 'cpc', label: 'Cost per Click', format: '$' },
      ],
      'tiktok': [
        { key: 'views', label: 'Video Views' },
        { key: 'engagement', label: 'Engagement' },
        { key: 'completion_rate', label: 'Completion Rate', format: '%' },
        { key: 'cpv', label: 'Cost per View', format: '$' },
      ],
      'google-business': [
        { key: 'profile_views', label: 'Profile Views' },
        { key: 'search_queries', label: 'Search Queries' },
        { key: 'direction_requests', label: 'Direction Requests' },
        { key: 'phone_calls', label: 'Phone Calls' },
      ],
      'all': [
        { key: 'total_leads', label: 'Total Leads' },
        { key: 'total_spend', label: 'Total Spend', format: '$' },
        { key: 'total_conversions', label: 'Total Conversions' },
        { key: 'avg_cpl', label: 'Avg. Cost per Lead', format: '$' },
      ],
    };

    return metricConfigs[platform] || metricConfigs['all'];
  };

  const formatMetricValue = (value: number, format?: string): string => {
    if (format === '$') {
      return `$${value.toLocaleString()}`;
    }
    if (format === '%') {
      return `${(value / 100).toFixed(2)}%`;
    }
    if (format === 's') {
      return `${Math.floor(value / 60)}m ${value % 60}s`;
    }
    return value.toLocaleString();
  };

  const metricCards = getMetricCards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const basePath = orgSlug ? `/org/${orgSlug}` : '';
              navigate(`${basePath}/marketing`);
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketing</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{platformName}</h1>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => {
          const value = aggregatedMetrics[metric.key] || 0;
          const growth = analyticsExportService.calculateGrowth(value, value * 0.9);
          const isPositive = growth >= 0;

          return (
            <div
              key={metric.key}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatMetricValue(value, metric.format)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm ${
                    isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {Math.abs(growth).toFixed(1)}% vs previous period
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chart visualization will be displayed here</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {analyticsData.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.metricLabel || item.metricType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {item.metricValue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {platform === 'all' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platform Performance Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['google-analytics', 'meta', 'google-ads', 'tiktok', 'google-business'].map((plt) => (
              <div
                key={plt}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => navigate(`/marketing/analytics/${plt}`)}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {analyticsExportService.formatPlatformName(plt)}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Click to view detailed analytics
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformAnalyticsDetail;
