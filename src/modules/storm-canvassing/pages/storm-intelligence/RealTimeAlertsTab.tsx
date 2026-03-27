import { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  MapPin,
  Clock,
  CloudLightning,
  Zap,
  Wind,
  Tornado,
  CheckCircle,
} from 'lucide-react';
import type { ParsedHailAlert, NWSSeverity } from '../../services/nwsApiService';
import {
  fetchHailAlertsByStates,
  buildAlertGeoJSONLayer,
  getAlertFillColor,
  formatAlertExpiry,
} from '../../services/nwsApiService';
import { HAIL_SIZE_THRESHOLDS } from '../../types';

interface Props {
  operatingStates: string[];
}

function SeverityBadge({ severity }: { severity: NWSSeverity }) {
  const styles: Record<NWSSeverity, string> = {
    Extreme: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700',
    Severe: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700',
    Moderate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
    Minor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700',
    Unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[severity] || styles.Unknown}`}>
      {severity}
    </span>
  );
}

function AlertTypeIcon({ alert }: { alert: ParsedHailAlert }) {
  if (alert.isTornadoRelated) return <Tornado className="w-4 h-4 text-red-500" />;
  if (alert.isHailRelated) return <CloudLightning className="w-4 h-4 text-orange-500" />;
  return <Wind className="w-4 h-4 text-blue-500" />;
}

function AlertCard({ alert }: { alert: ParsedHailAlert }) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = getAlertFillColor(alert);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <AlertTypeIcon alert={alert} />
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {alert.event}
            </span>
            <SeverityBadge severity={alert.severity} />
            {alert.maxHailInches && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                {alert.maxHailInches}" hail
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 line-clamp-1">
            {alert.headline || alert.areaDesc}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {alert.areaDesc.substring(0, 50)}{alert.areaDesc.length > 50 ? '...' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatAlertExpiry(alert.expires)}
            </span>
            {alert.ugcZones.length > 0 && (
              <span className="font-mono">{alert.ugcZones.length} zone{alert.ugcZones.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700 mt-0 bg-gray-50 dark:bg-gray-900/30">
          {alert.description && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Description</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {alert.description}
              </p>
            </div>
          )}
          {alert.instruction && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Instructions</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {alert.instruction}
              </p>
            </div>
          )}
          {alert.ugcZones.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Affected Zones</p>
              <div className="flex flex-wrap gap-1">
                {alert.ugcZones.map((z) => (
                  <span key={z} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-mono rounded">
                    {z}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-400">Certainty</span>
              <p className="font-medium text-gray-700 dark:text-gray-300">{alert.certainty}</p>
            </div>
            <div>
              <span className="text-gray-400">Urgency</span>
              <p className="font-medium text-gray-700 dark:text-gray-300">{alert.urgency}</p>
            </div>
            <div>
              <span className="text-gray-400">Sender</span>
              <p className="font-medium text-gray-700 dark:text-gray-300">{alert.senderName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RealTimeAlertsTab({ operatingStates }: Props) {
  const [alerts, setAlerts] = useState<ParsedHailAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minSeverity, setMinSeverity] = useState<NWSSeverity>('Minor');
  const [filterHailOnly, setFilterHailOnly] = useState(false);

  const fetchAlerts = async () => {
    if (operatingStates.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHailAlertsByStates(operatingStates, minSeverity);
      setAlerts(data);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (operatingStates.length > 0) {
      fetchAlerts();
    }
  }, [operatingStates.join(','), minSeverity]);

  useEffect(() => {
    if (operatingStates.length === 0) return;
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [operatingStates.join(','), minSeverity]);

  const filtered = filterHailOnly
    ? alerts.filter((a) => a.isHailRelated || a.isThunderstormRelated)
    : alerts;

  const extremeCount = alerts.filter((a) => a.severity === 'Extreme').length;
  const severeCount = alerts.filter((a) => a.severity === 'Severe').length;
  const hailCount = alerts.filter((a) => a.isHailRelated).length;
  const tornadoCount = alerts.filter((a) => a.isTornadoRelated).length;

  if (operatingStates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No States Configured</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Go to Settings → Storm Data (NOAA) to select the states you want to monitor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={minSeverity}
            onChange={(e) => setMinSeverity(e.target.value as NWSSeverity)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Minor">Min: Minor</option>
            <option value="Moderate">Min: Moderate</option>
            <option value="Severe">Min: Severe</option>
            <option value="Extreme">Min: Extreme</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filterHailOnly}
              onChange={(e) => setFilterHailOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            Hail/Thunderstorm only
          </label>
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-xs text-gray-400">
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchAlerts}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Alerts', value: alerts.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Extreme / Severe', value: `${extremeCount} / ${severeCount}`, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Hail Events', value: hailCount, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: <CloudLightning className="w-4 h-4" /> },
          { label: 'Tornado Events', value: tornadoCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: <Zap className="w-4 h-4" /> },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-3`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
          <p className="font-medium text-gray-900 dark:text-white">No active alerts</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            No storm alerts found for {operatingStates.join(', ')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
