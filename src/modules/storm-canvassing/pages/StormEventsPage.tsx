import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudLightning,
  Plus,
  Search,
  RefreshCw,
  ChevronRight,
  Calendar,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import { getStormEvents } from '../services/stormEventsApi';
import { runMockIngestion, runNOAAIngestion } from '../services/noaaEngine';
import { getOrgSettings } from '../services/orgSettingsApi';
import type { StormEvent, StormEventStatus } from '../types';
import { HAIL_SEVERITY_COLORS, HAIL_SIZE_THRESHOLDS } from '../types';

function StatusBadge({ status }: { status?: StormEventStatus }) {
  if (!status || status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Processing
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
        <AlertTriangle className="w-3 h-3" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
      <Clock className="w-3 h-3" />
      Archived
    </span>
  );
}

function HailSizeBadge({ sizeInches }: { sizeInches?: number }) {
  if (!sizeInches) return null;

  let band = 'TRACE';
  let label = `${sizeInches}"`;

  if (sizeInches >= HAIL_SIZE_THRESHOLDS.BASEBALL) { band = 'BASEBALL'; label = 'Baseball'; }
  else if (sizeInches >= HAIL_SIZE_THRESHOLDS.GOLF_BALL) { band = 'GOLF_BALL'; label = 'Golf Ball'; }
  else if (sizeInches >= HAIL_SIZE_THRESHOLDS.ONE_INCH) { band = 'ONE_INCH'; label = '1"'; }
  else if (sizeInches >= HAIL_SIZE_THRESHOLDS.THREE_QUARTER) { band = 'THREE_QUARTER'; label = '3/4"'; }
  else if (sizeInches >= HAIL_SIZE_THRESHOLDS.HALF) { band = 'HALF'; label = '1/2"'; }
  else if (sizeInches >= HAIL_SIZE_THRESHOLDS.QUARTER) { band = 'QUARTER'; label = '1/4"'; }

  const color = HAIL_SEVERITY_COLORS[band as keyof typeof HAIL_SEVERITY_COLORS];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full text-gray-900"
      style={{ backgroundColor: color }}
    >
      <Target className="w-3 h-3" />
      {label} max
    </span>
  );
}

export function StormEventsPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const { user } = useSupabaseUser();
  const organizationId = currentOrganization?.id;

  const [events, setEvents] = useState<StormEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    loadEvents();
  }, [organizationId]);

  async function loadEvents() {
    if (!organizationId) return;
    setIsLoading(true);
    try {
      const data = await getStormEvents(organizationId);
      setEvents(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  const handleRunIngestion = async () => {
    if (!organizationId) return;
    setIsIngesting(true);
    setToast(null);
    try {
      const settings = await getOrgSettings(organizationId);
      const operatingStates = settings?.operating_states ?? [];

      let result;
      if (settings?.noaa_mode === 'live' && operatingStates.length > 0) {
        result = await runNOAAIngestion(
          organizationId,
          operatingStates,
          user?.id,
          settings.hail_threshold_inches ?? 0.75
        );
      } else {
        result = await runMockIngestion(organizationId, user?.id);
      }

      setEvents((prev) => [...result.events, ...prev]);

      const modeLabel = settings?.noaa_mode === 'live' ? 'NOAA Live' : 'Mock';
      let msg = `${modeLabel} ingestion complete: ${result.eventsCreated} event(s) created`;
      if (result.duplicatesSkipped > 0) {
        msg += `, ${result.duplicatesSkipped} duplicate(s) skipped`;
      }
      setToast({ type: 'success', text: msg });
    } catch (err) {
      setToast({ type: 'error', text: err instanceof Error ? err.message : 'Failed to run ingestion' });
    } finally {
      setIsIngesting(false);
      setTimeout(() => setToast(null), 6000);
    }
  };

  const filtered = events.filter((e) =>
    !searchQuery ||
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CloudLightning className="w-6 h-6 text-blue-600" />
            Storm Events
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage and track hail storm events for canvassing
          </p>
        </div>
        <button
          onClick={handleRunIngestion}
          disabled={isIngesting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isIngesting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isIngesting ? 'Ingesting...' : 'Run NOAA Ingestion'}
        </button>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {toast.text}
        </div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <CloudLightning className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No storm events yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Run NOAA ingestion to import storm events
          </p>
          <button
            onClick={handleRunIngestion}
            disabled={isIngesting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Run Ingestion
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Max Hail
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Source
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => navigate(`/storm-canvassing/events/${event.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {event.name}
                    </div>
                    {event.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <HailSizeBadge sizeInches={event.max_hail_estimate} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {event.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Events',
            value: events.length,
            icon: <CloudLightning className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Active',
            value: events.filter((e) => !e.status || e.status === 'ACTIVE').length,
            icon: <Activity className="w-5 h-5 text-green-600" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            label: 'With Turfs',
            value: new Set(events.filter((e) => e.id).map((e) => e.id)).size,
            icon: <Target className="w-5 h-5 text-orange-600" />,
            bg: 'bg-orange-50 dark:bg-orange-900/20',
          },
          {
            label: 'This Month',
            value: events.filter((e) => {
              if (!e.event_date) return false;
              const d = new Date(e.event_date);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length,
            icon: <Calendar className="w-5 h-5 text-gray-600" />,
            bg: 'bg-gray-50 dark:bg-gray-700',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-4 flex items-center gap-3`}
          >
            <div>{stat.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
