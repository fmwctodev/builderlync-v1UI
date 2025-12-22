import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Eye, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { getGoogleAuthUrl, exchangeCodeForToken, getAnalyticsData, disconnectGoogleAnalytics, getConnectionStatus } from '../../../shared/services/googleAuthService';

interface MetricSummary {
  current: number;
  previous: number;
  change: number;
}

interface DailyMetric {
  date: string;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface AnalyticsData {
  summary: {
    sessions: MetricSummary;
    pageViews: MetricSummary;
    bounceRate: MetricSummary;
    avgSessionDuration: MetricSummary;
  };
  dailyMetrics: DailyMetric[];
}

export const GoogleAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [connected, setConnected] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await getConnectionStatus();
      const hasConnection = result.data && result.data.length > 0;
      setConnected(hasConnection);
      if (hasConnection && result.data[0].metadata?.propertyId) {
        setPropertyId(result.data[0].metadata.propertyId);
      } else {
        const savedPropertyId = localStorage.getItem('google_property_id');
        if (savedPropertyId) setPropertyId(savedPropertyId);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !connected) {
      setLoading(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      
      exchangeCodeForToken(code)
        .then(() => {
          setConnected(true);
          alert('Successfully connected to Google Analytics!');
          checkConnection();
        })
        .catch(err => {
          console.error('Auth error:', err);
          setError(err.message || 'Authentication failed');
          alert('Authentication failed: ' + err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [connected]);

  // Fetch analytics data when property ID is available
  useEffect(() => {
    if (propertyId && connected) {
      fetchAnalyticsData();
    }
  }, [propertyId, connected]);

  const fetchAnalyticsData = async () => {
    if (!propertyId || !connected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      const response = await getAnalyticsData('google_analytics', startDate, endDate, propertyId);
      const analyticsData = response.data || response;
      
      // Handle empty data response
      if (analyticsData.rows && analyticsData.rows.length === 0) {
        setError(analyticsData.message || 'No data available for the selected date range');
        setData(null);
        return;
      }
      
      if (!analyticsData.summary || !analyticsData.dailyMetrics) {
        throw new Error('Invalid response format from server');
      }
      
      setData(analyticsData);
      localStorage.setItem('google_property_id', propertyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const handleConnect = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error getting auth URL:', err);
      alert('Failed to get authorization URL');
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleAnalytics();
    setConnected(false);
    setPropertyId('');
    setData(null);
  };

  const handleBack = () => {
    const basePath = orgSlug ? `/org/${orgSlug}` : '';
    navigate(`${basePath}/marketing`);
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketing</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Analytics</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketing</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Analytics</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Connect Google Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your Google Analytics account to start fetching data and insights.
          </p>
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Google Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Marketing</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Analytics</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Google Analytics Property ID:
          </label>
          <div className="flex items-center gap-3">
            {connected && (
              <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                ✓ Connected
              </span>
            )}
            <button
              onClick={handleDisconnect}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Disconnect
            </button>
          </div>
        </div>
        <input
          type="text"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          placeholder="Enter your GA4 Property ID (e.g., 123456789)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {propertyId && (
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      )}

      {data && data.summary.sessions.current === 0 && data.summary.pageViews.current === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-400 font-medium mb-2">No Data Available</p>
          <p className="text-yellow-700 dark:text-yellow-500 text-sm">
            The property ID {propertyId} returned no data. This could mean:
          </p>
          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-500 text-sm mt-2 space-y-1">
            <li>The property has no traffic data yet</li>
            <li>This is a Universal Analytics property (use GA4 property ID instead)</li>
            <li>You don't have access to this property</li>
            <li>The property ID is incorrect</li>
          </ul>
        </div>
      )}

      {data && (data.summary.sessions.current > 0 || data.summary.pageViews.current > 0) && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</span>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.summary.sessions.current.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {data.summary.sessions.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={data.summary.sessions.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(data.summary.sessions.change)}%
                </span>
                <span className="text-gray-500">vs previous period</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</span>
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.summary.pageViews.current.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {data.summary.pageViews.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={data.summary.pageViews.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(data.summary.pageViews.change)}%
                </span>
                <span className="text-gray-500">vs previous period</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bounce Rate</span>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.summary.bounceRate.current.toFixed(2)}%
              </p>
              <div className="flex items-center gap-1 text-sm">
                {data.summary.bounceRate.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={data.summary.bounceRate.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(data.summary.bounceRate.change)}%
                </span>
                <span className="text-gray-500">vs previous period</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Session Duration</span>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatDuration(data.summary.avgSessionDuration.current)}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {data.summary.avgSessionDuration.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={data.summary.avgSessionDuration.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(data.summary.avgSessionDuration.change)}%
                </span>
                <span className="text-gray-500">vs previous period</span>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Over Time</h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
              Chart visualization will be displayed here
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Metrics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pageviews</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bounce Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Session Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.dailyMetrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(metric.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {metric.sessions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {metric.pageViews.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {metric.bounceRate.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {metric.avgSessionDuration.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {data && data.summary.sessions.current === 0 && data.summary.pageViews.current === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to find your GA4 Property ID:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Go to Google Analytics (analytics.google.com)</li>
            <li>Click Admin (gear icon) in the bottom left</li>
            <li>In the Property column, click Property Settings</li>
            <li>Your Property ID is shown at the top (format: 123456789)</li>
          </ol>
        </div>
      )}
    </div>
  );
};
