import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CloudLightning,
  MapPin,
  Calendar,
  Target,
  Users,
  Home,
  RefreshCw,
  CheckCircle,
  Layers,
  Activity,
} from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import { getStormEventById } from '../services/stormEventsApi';
import { getTurfs } from '../services/turfsApi';
import { matchDoorsToStormEvent } from '../services/noaaEngine';
import { getIngestionJobs } from '../services/stormIngestionApi';
import type { StormEvent, Turf, StormIngestionJob } from '../types';
import { HAIL_SEVERITY_COLORS, HAIL_SIZE_THRESHOLDS, getHailSeverityBand } from '../types';

function HailLegend() {
  const bands = [
    { label: 'Trace', min: 0.1, key: 'TRACE' },
    { label: '1/4"', min: 0.25, key: 'QUARTER' },
    { label: '1/2"', min: 0.5, key: 'HALF' },
    { label: '3/4"', min: 0.75, key: 'THREE_QUARTER' },
    { label: '1"', min: 1.0, key: 'ONE_INCH' },
    { label: 'Golf Ball', min: 1.75, key: 'GOLF_BALL' },
    { label: 'Baseball', min: 2.75, key: 'BASEBALL' },
  ] as const;

  return (
    <div className="flex flex-col gap-1.5">
      {bands.map((b) => (
        <div key={b.key} className="flex items-center gap-2">
          <div
            className="w-5 h-3 rounded"
            style={{ backgroundColor: HAIL_SEVERITY_COLORS[b.key] }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {b.label} ({b.min}"+)
          </span>
        </div>
      ))}
    </div>
  );
}

export function StormEventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const { user } = useSupabaseUser();
  const organizationId = currentOrganization?.id;

  const [event, setEvent] = useState<StormEvent | null>(null);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [jobs, setJobs] = useState<StormIngestionJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<number | null>(null);

  useEffect(() => {
    if (!organizationId || !eventId) return;
    loadData();
  }, [organizationId, eventId]);

  async function loadData() {
    if (!organizationId || !eventId) return;
    setIsLoading(true);
    try {
      const [eventData, turfsData, jobsData] = await Promise.all([
        getStormEventById(organizationId, eventId),
        getTurfs(organizationId, { stormEventId: eventId }),
        getIngestionJobs(organizationId, 5),
      ]);
      setEvent(eventData);
      setTurfs(turfsData);
      setJobs(jobsData);
    } finally {
      setIsLoading(false);
    }
  }

  const handleMatchDoors = async () => {
    if (!organizationId || !eventId) return;
    setIsMatching(true);
    try {
      const count = await matchDoorsToStormEvent(organizationId, eventId);
      setMatchResult(count);
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Storm event not found.</p>
        <button
          onClick={() => navigate('/storm-canvassing/events')}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const maxHail = event.max_hail_estimate;
  const severityBand = maxHail ? getHailSeverityBand(maxHail) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/storm-canvassing/events')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Storm Events
      </button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <CloudLightning className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.name}</h1>
            {event.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {event.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/storm-canvassing/turfs`)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Manage Turfs
          </button>
          <button
            onClick={handleMatchDoors}
            disabled={isMatching}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isMatching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            {isMatching ? 'Matching...' : 'Match Doors'}
          </button>
        </div>
      </div>

      {matchResult !== null && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm mb-4">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Matched {matchResult} doors to this storm event
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.event_date
              ? new Date(event.event_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Max Hail</span>
          </div>
          {maxHail ? (
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor:
                    severityBand
                      ? HAIL_SEVERITY_COLORS[severityBand]
                      : '#e5e7eb',
                }}
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {maxHail}"
              </span>
            </div>
          ) : (
            <span className="text-lg font-semibold text-gray-400">—</span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Turfs</span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {turfs.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Confidence</span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.confidence_score ? `${Math.round(event.confidence_score * 100)}%` : '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-blue-600" />
              Canvassing Turfs
            </h2>
            {turfs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">No turfs assigned to this event yet.</p>
                <button
                  onClick={() => navigate('/storm-canvassing/turfs')}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Go to Turfs Manager
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {turfs.map((turf) => {
                  const pct = turf.total_doors > 0
                    ? Math.round((turf.visited_doors / turf.total_doors) * 100)
                    : 0;
                  return (
                    <div
                      key={turf.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: turf.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {turf.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            {turf.visited_doors}/{turf.total_doors}
                          </span>
                          {turf.assignments && turf.assignments.length > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {turf.assignments.length} rep{turf.assignments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-blue-600" />
              Storm Layers ({event.layers?.length || 0})
            </h2>
            {!event.layers || event.layers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No layers loaded for this event.</p>
            ) : (
              <div className="space-y-2">
                {event.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {layer.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {layer.layer_type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {layer.format}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Hail Severity Scale
            </h2>
            <HailLegend />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Event Details
            </h2>
            <div className="space-y-2 text-sm">
              {event.center_lat && event.center_lng && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Center</span>
                  <span className="text-gray-900 dark:text-white font-mono text-xs">
                    {event.center_lat.toFixed(3)}, {event.center_lng.toFixed(3)}
                  </span>
                </div>
              )}
              {event.event_start && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Start</span>
                  <span className="text-gray-900 dark:text-white text-xs">
                    {new Date(event.event_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {event.event_end && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">End</span>
                  <span className="text-gray-900 dark:text-white text-xs">
                    {new Date(event.event_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Source</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{event.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Imported</span>
                <span className="text-gray-900 dark:text-white text-xs">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Recent Ingestion Jobs
              </h2>
              <div className="space-y-2">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                    <span className="font-mono">{job.status}</span>
                    <span>{job.events_imported} imported</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
