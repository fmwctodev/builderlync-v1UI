import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Search, Filter, Download, Play, MoreVertical, Loader2 } from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getCallLogs, getCallMetrics, CallLog, CallMetrics } from '../services/calls';

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function CallReportTab() {
  const { currentOrganization } = useCurrentOrganization();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<CallMetrics | null>(null);
  const [calls, setCalls] = useState<CallLog[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedLogs, fetchedMetrics] = await Promise.all([
        getCallLogs(100),
        getCallMetrics()
      ]);
      
      setCalls(fetchedLogs);
      setMetrics(fetchedMetrics);
    } catch (error) {
      console.error('Failed to load call data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCalls = calls.filter(call => {
    if (activeFilter === 'all') return true;
    return call.direction === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Total Calls</p>
            <p className="text-2xl font-bold mt-1">{metrics.totalCalls}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-blue-600">{metrics.inboundCalls} Inbound</span>
              <span className="text-purple-600">{metrics.outboundCalls} Outbound</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.completedCalls}</p>
            <p className="text-xs text-gray-400 mt-2">Conversion: {((metrics.completedCalls / metrics.totalCalls) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Missed</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{metrics.missedCalls}</p>
            <p className="text-xs text-gray-400 mt-2">Rate: {((metrics.missedCalls / metrics.totalCalls) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Avg Duration</p>
            <p className="text-2xl font-bold mt-1">{formatDuration(metrics.averageDuration)}</p>
            <p className="text-xs text-gray-400 mt-2">Total: {formatDuration(metrics.totalDuration)}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex gap-2">
            {(['all', 'inbound', 'outbound'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                  activeFilter === f ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f} Calls
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm">{format(new Date(call.dateTime), 'MMM dd, HH:mm')}</td>
                  <td className="px-4 py-3 text-sm font-medium">{call.contactName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{call.numberName}</td>
                  <td className="px-4 py-3 text-sm capitalize">
                    <div className="flex items-center gap-1.5">
                      {call.direction === 'inbound' ? <PhoneIncoming className="w-3.5 h-3.5 text-blue-500" /> : <PhoneOutgoing className="w-3.5 h-3.5 text-purple-500" />}
                      {call.direction}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{formatDuration(call.duration)}</td>
                  <td className="px-4 py-3 text-center">
                    {call.recordingUrl && (
                      <button className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
