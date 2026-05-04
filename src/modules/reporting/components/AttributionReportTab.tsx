import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { TrendingUp, MousePointerClick, DollarSign, Users, Search, Filter, Download, Loader2 } from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';

// Mock types
interface AttributionMetrics {
  revenueClosed: number;
  won: number;
  totalLeads: number;
}

interface SessionEvent {
  id: string;
  eventType: string;
  source: string;
  campaign: string;
  utmMedium: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
  createdAt: string;
}

export function AttributionReportTab() {
  const { currentOrganization } = useCurrentOrganization();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [attributionModel, setAttributionModel] = useState('last_touch');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<AttributionMetrics | null>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setMetrics({
      revenueClosed: 425600.50,
      won: 84,
      totalLeads: 1250
    });

    setEvents([
      {
        id: '1',
        eventType: 'Form Submission',
        source: 'google',
        campaign: 'Roof-Repair-Search',
        utmMedium: 'cpc',
        utmContent: 'ad-v1',
        utmTerm: 'roof repair cost',
        referrer: 'https://google.com',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        eventType: 'Call',
        source: 'facebook',
        campaign: 'Retargeting-Social',
        utmMedium: 'social',
        utmContent: 'video-ad',
        utmTerm: '',
        referrer: 'https://facebook.com',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <div className="flex gap-4 items-center">
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
        <div className="flex gap-3">
          <select 
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            value={attributionModel}
            onChange={(e) => setAttributionModel(e.target.value)}
          >
            <option value="last_touch">Last Touch</option>
            <option value="first_touch">First Touch</option>
            <option value="linear">Linear</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm transition-colors hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Revenue Closed</span>
            </div>
            <p className="text-3xl font-bold">${metrics.revenueClosed.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Won Opportunities</span>
            </div>
            <p className="text-3xl font-bold">{metrics.won}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Leads</span>
            </div>
            <p className="text-3xl font-bold">{metrics.totalLeads}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Session Events</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded">Columns</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Event Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Campaign</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Medium</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Referrer</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{event.eventType}</td>
                  <td className="px-4 py-3 text-cyan-600 font-medium lowercase">{event.source}</td>
                  <td className="px-4 py-3 text-gray-500">{event.campaign}</td>
                  <td className="px-4 py-3 text-gray-500">{event.utmMedium}</td>
                  <td className="px-4 py-3 text-gray-400 truncate max-w-[150px]">{event.referrer}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{format(new Date(event.createdAt), 'MMM dd, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
