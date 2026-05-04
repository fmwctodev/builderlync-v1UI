import { useState } from 'react';
import {
  Search,
  MapPin,
  CloudRain,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  CloudLightning,
  Eye,
  BarChart3,
  Clock,
} from 'lucide-react';
import type { HailForecastPoint, NWSGridpointForecast } from '../../services/nwsApiService';
import {
  fetchPointMetadata,
  extractHailForecastFromGridpoint,
  fetchGridpointForecast,
} from '../../services/nwsApiService';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { 'User-Agent': 'Builderlync/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

function HailRiskBadge({ point }: { point: HailForecastPoint }) {
  const hasHazards = point.hazardPhenomena.some(
    (h) => h.startsWith('SV') || h.startsWith('TO') || h.startsWith('BZ')
  );
  const highPrecip = (point.precipitationProbability || 0) >= 60;
  const highCoverage = (point.skyCoverPercent || 0) >= 70;

  if (point.hasHailWeather || hasHazards) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
        <CloudLightning className="w-3 h-3" />
        High Risk
      </span>
    );
  }
  if (highPrecip && highCoverage) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
        <CloudRain className="w-3 h-3" />
        Elevated
      </span>
    );
  }
  if (highPrecip) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        <CloudRain className="w-3 h-3" />
        Moderate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      Low
    </span>
  );
}

function ForecastPeriodCard({ period }: { period: NWSGridpointForecast['periods'] extends Array<infer T> ? T : never }) {
  const probPrecip = period.probabilityOfPrecipitation?.value;
  const hasHailMention = period.detailedForecast.toLowerCase().includes('hail') ||
    period.shortForecast.toLowerCase().includes('hail') ||
    period.shortForecast.toLowerCase().includes('thunderstorm');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${
      hasHailMention
        ? 'border-orange-200 dark:border-orange-700'
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{period.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(period.startTime).toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
            })}
          </p>
        </div>
        {hasHailMention && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
            <CloudLightning className="w-3 h-3" />
            Hail Risk
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{period.shortForecast}</p>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-red-400" />
          <span className="text-gray-500">Temp</span>
          <span className="font-medium text-gray-700 dark:text-gray-300 ml-auto">
            {period.temperature}°{period.temperatureUnit}
          </span>
        </div>
        {probPrecip != null && (
          <div className="flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-500">Precip</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 ml-auto">{probPrecip}%</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500">Wind</span>
          <span className="font-medium text-gray-700 dark:text-gray-300 ml-auto text-right">
            {period.windSpeed} {period.windDirection}
          </span>
        </div>
      </div>

      {hasHailMention && period.detailedForecast && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {period.detailedForecast}
          </p>
        </div>
      )}
    </div>
  );
}

function GridpointHailTimeline({ points }: { points: HailForecastPoint[] }) {
  const hailPoints = points.filter((p) => p.hasHailWeather || p.precipitationProbability! >= 40);

  if (hailPoints.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
        No elevated hail risk periods in gridpoint data
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hailPoints.slice(0, 12).map((point, i) => {
        const validDate = new Date(point.validTime.split('/')[0]);
        const hasHighRisk = point.hasHailWeather || point.hazardPhenomena.some((h) => h.startsWith('SV') || h.startsWith('TO'));

        return (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              hasHighRisk
                ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                : 'bg-paper dark:bg-canvas/30 border-gray-200 dark:border-gray-700'
            }`}
          >
            <Clock className={`w-4 h-4 shrink-0 ${hasHighRisk ? 'text-orange-500' : 'text-gray-400'}`} />
            <div className="text-xs text-gray-500 w-36 shrink-0">
              {validDate.toLocaleString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric',
              })}
            </div>
            <HailRiskBadge point={point} />
            {point.precipitationProbability != null && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <BarChart3 className="w-3 h-3" />
                {point.precipitationProbability}% precip
              </div>
            )}
            {point.weatherDescriptions.length > 0 && (
              <div className="text-xs text-gray-500 truncate flex-1">
                {point.weatherDescriptions.slice(0, 2).join(', ')}
              </div>
            )}
            {point.hazardPhenomena.length > 0 && (
              <div className="flex gap-1">
                {point.hazardPhenomena.slice(0, 3).map((h, j) => (
                  <span key={j} className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-mono rounded">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function HailForecastTab() {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastPeriods, setForecastPeriods] = useState<NWSGridpointForecast['periods']>([]);
  const [gridpointPoints, setGridpointPoints] = useState<HailForecastPoint[]>([]);
  const [pointMeta, setPointMeta] = useState<{
    wfo: string; gridX: number; gridY: number; forecastZone: string; state: string;
  } | null>(null);
  const [activeView, setActiveView] = useState<'forecast' | 'gridpoint'>('forecast');

  const handleSearch = async () => {
    if (!address.trim()) return;
    setIsSearching(true);
    setError(null);
    setForecastPeriods([]);
    setGridpointPoints([]);
    setPointMeta(null);

    try {
      const coords = await geocodeAddress(address);
      if (!coords) {
        setError('Could not geocode that address. Please include city and state.');
        return;
      }

      const meta = await fetchPointMetadata(coords.lat, coords.lng);
      if (!meta) {
        setError('NWS point metadata not available for this location (must be within continental US).');
        return;
      }

      setPointMeta(meta);

      const [forecast, hailPoints] = await Promise.all([
        fetchGridpointForecast(meta.wfo, meta.gridX, meta.gridY),
        extractHailForecastFromGridpoint(meta.wfo, meta.gridX, meta.gridY),
      ]);

      setForecastPeriods(forecast.periods || []);
      setGridpointPoints(hailPoints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Forecast lookup failed');
    } finally {
      setIsSearching(false);
    }
  };

  const hailPeriods = forecastPeriods.filter(
    (p) =>
      p.detailedForecast.toLowerCase().includes('hail') ||
      p.shortForecast.toLowerCase().includes('thunderstorm')
  );

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-1">
              Forecast-Based Hail Risk
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Uses NWS gridpoint forecast data (2.5km resolution) — probability of precipitation,
              sky cover, weather phenomena, and SPC convective watch hazards layer — to build a
              predictive hail risk forecast for any US address.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter address, city, or ZIP (continental US only)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !address.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isSearching ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          Get Forecast
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {pointMeta && (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            WFO: <strong className="text-gray-700 dark:text-gray-300 ml-1">{pointMeta.wfo}</strong>
          </span>
          <span>Grid: {pointMeta.gridX},{pointMeta.gridY}</span>
          <span>Zone: <strong className="text-gray-700 dark:text-gray-300">{pointMeta.forecastZone}</strong></span>
          {hailPeriods.length > 0 && (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
              <CloudLightning className="w-3 h-3" />
              {hailPeriods.length} hail-risk period{hailPeriods.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      )}

      {(forecastPeriods.length > 0 || gridpointPoints.length > 0) && (
        <>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            {(['forecast', 'gridpoint'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeView === view
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {view === 'forecast' ? 'Period Forecast' : 'Gridpoint Data'}
              </button>
            ))}
          </div>

          {activeView === 'forecast' && (
            <div>
              {hailPeriods.length > 0 && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-xl flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                  <CloudLightning className="w-4 h-4 shrink-0" />
                  <strong>{hailPeriods.length} period{hailPeriods.length !== 1 ? 's' : ''}</strong>
                  &nbsp;with elevated hail/thunderstorm risk detected — shown highlighted below.
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {forecastPeriods.slice(0, 14).map((period) => (
                  <ForecastPeriodCard key={period.number} period={period} />
                ))}
              </div>
            </div>
          )}

          {activeView === 'gridpoint' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Gridpoint Hail Risk Timeline
              </h3>
              <GridpointHailTimeline points={gridpointPoints} />
            </div>
          )}
        </>
      )}

      {!pointMeta && !isSearching && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-10 text-center">
          <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter a continental US address to get the NWS gridpoint hail risk forecast
          </p>
        </div>
      )}
    </div>
  );
}
