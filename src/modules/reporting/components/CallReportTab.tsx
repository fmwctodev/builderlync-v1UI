import React, { useState } from 'react';
import { useCallReport } from '../hooks/useCallReport';
import { format } from 'date-fns';

export function CallReportTab() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPhone, setSelectedPhone] = useState<string>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');

  const { data, loading, error } = useCallReport(startDate, endDate, selectedPhone);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading call data...</div>
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

  const filteredCalls = data.callLogs.filter(call => {
    if (activeFilter === 'all') return true;
    return call.direction === activeFilter.replace('coming', 'bound');
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={selectedPhone || ''}
            onChange={(e) => setSelectedPhone(e.target.value || undefined)}
          >
            <option value="">All numbers</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Calls by Status</h3>
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                {data.byStatus.map((status, index) => {
                  const total = data.byStatus.reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? (status.count / total) * 100 : 0;
                  const circumference = 2 * Math.PI * 40;
                  const offset = circumference - (percentage / 100) * circumference;
                  return (
                    <circle
                      key={status.status}
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={index === 0 ? '#10B981' : index === 1 ? '#EF4444' : '#6B7280'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total: {data.metrics.totalCalls}</span>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <span>Avg. call duration: {formatDuration(Math.round(data.metrics.averageDuration))}</span>
            <span className="mx-2">|</span>
            <span>Total call duration: {formatDuration(data.metrics.totalDuration)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Call Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Inbound Calls</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.inboundCalls}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Outbound Calls</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.outboundCalls}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">{data.metrics.completedCalls}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Missed</span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">{data.metrics.missedCalls}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'all' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setActiveFilter('all')}
            >
              All calls
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'incoming' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setActiveFilter('incoming')}
            >
              Incoming
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'outgoing' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setActiveFilter('outgoing')}
            >
              Outgoing
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Direction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Call Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-gray-400 dark:text-gray-500 text-2xl">📞</span>
                      </div>
                      <span>No call data available</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id}>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{format(new Date(call.dateTime), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{call.contactName}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{call.numberName}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white capitalize">{call.direction}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        call.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        call.status === 'missed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{formatDuration(call.duration)}</td>
                    <td className="px-4 py-4">
                      {call.recordingUrl ? (
                        <button className="text-primary-600 dark:text-primary-400 hover:underline">Play</button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
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
