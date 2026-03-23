import React, { useState } from 'react';
import { useAttributionReport } from '../hooks/useAttributionReport';
import { format } from 'date-fns';

export function AttributionReportTab() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [attributionModel, setAttributionModel] = useState('last_touch');

  const { data, loading, error } = useAttributionReport(startDate, endDate, attributionModel);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading attribution data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error loading data: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            value={attributionModel}
            onChange={(e) => setAttributionModel(e.target.value)}
          >
            <option value="last_touch">Last Touch</option>
            <option value="first_touch">First Touch</option>
            <option value="linear">Linear</option>
            <option value="time_decay">Time Decay</option>
            <option value="position_based">Position Based</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
              <span className="text-gray-600 dark:text-gray-400 text-sm">$</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Closed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${data.metrics.revenueClosed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
              <span className="text-gray-600 dark:text-gray-400 text-sm">🎯</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Won</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.metrics.won}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
              <span className="text-gray-600 dark:text-gray-400 text-sm">👥</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.metrics.totalLeads}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Revenue Generated</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Leads</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {data.revenueByDay.length > 0 ? (
            <div className="h-64">
              <div className="flex items-end justify-around h-full">
                {data.revenueByDay.slice(0, 7).map((day, index) => {
                  const maxRevenue = Math.max(...data.revenueByDay.map(d => d.revenue));
                  const heightPercent = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-12 bg-primary-500 rounded-t"
                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                        title={`$${day.revenue.toFixed(2)}`}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {format(new Date(day.date), 'MMM dd')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-500 dark:text-gray-400">No Data Found</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Session Events</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              Columns
            </button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Event Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Medium</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Term</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Referrer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.sessionEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-gray-400 dark:text-gray-500 text-2xl">📊</span>
                      </div>
                      <span>No session events found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.sessionEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{event.eventType}</td>
                    <td className="px-4 py-4 text-primary-600 dark:text-primary-400">{event.source}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{event.campaign}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{event.utmMedium}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{event.utmContent}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{event.utmTerm}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{event.referrer}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white text-sm">
                      {format(new Date(event.createdAt), 'MMM dd yyyy\nHH:mm a')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
