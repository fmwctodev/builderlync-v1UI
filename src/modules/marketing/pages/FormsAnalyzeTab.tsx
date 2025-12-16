import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formsApi } from '../services/formsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import type { MarketingForm, FormAnalyticsData } from '../types/forms';

export const FormsAnalyzeTab: React.FC = () => {
  const { currentOrganizationId: organizationId } = useCurrentOrganization();
  const [forms, setForms] = useState<MarketingForm[]>([]);
  const [analytics, setAnalytics] = useState<FormAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string>('all');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadForms();
  }, [organizationId]);

  useEffect(() => {
    loadAnalytics();
  }, [organizationId, selectedFormId, startDate, endDate]);

  const loadForms = async () => {
    try {
      const data = await formsApi.getForms(organizationId);
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getFormAnalytics(organizationId, {
        formId: selectedFormId === 'all' ? undefined : selectedFormId,
        startDate,
        endDate,
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Effortlessly track and analyze key metrics with our sites analytics tool
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-[200px]"
        >
          <option value="all">All</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </select>

        <select
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option>All</option>
        </select>

        <div className="flex items-center space-x-2 ml-auto">
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total views
              </h3>
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.total_views)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Responses
              </h3>
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.total_responses)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Average time
              </h3>
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(analytics.average_completion_time)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Completion rate
              </h3>
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analytics.completion_rate * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total views</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} - {new Date(endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.views_by_date.slice(0, 30).map((point, index) => {
                const maxViews = Math.max(...analytics.views_by_date.map((p) => p.views));
                const height = (point.views / maxViews) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-red-500 rounded-t transition-all hover:bg-red-600"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${point.date}: ${point.views} views`}
                    ></div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between text-xs text-gray-600 dark:text-gray-400">
              {analytics.views_by_date.length > 0 && (
                <>
                  <span>
                    {new Date(analytics.views_by_date[0].date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span>
                    {new Date(analytics.views_by_date[analytics.views_by_date.length - 1].date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total views</h3>
            </div>
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Form name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total views
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {forms.slice(0, 5).map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {form.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(form.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">
                      {formatNumber(form.submission_count * 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
