import { useState } from 'react';
import {
  Search,
  History,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import type { StationHailObservation } from '../../services/nwsApiService';
import {
  fetchHailObservationsNearBbox,
  fetchPointMetadata,
  fetchStationObservations,
} from '../../services/nwsApiService';

interface Props {
  operatingStates: string[];
}

interface AddressSearchState {
  address: string;
  lat?: number;
  lng?: number;
  isGeocoding: boolean;
}

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

function ObservationCard({ obs }: { obs: StationHailObservation }) {
  const date = new Date(obs.timestamp);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {obs.stationName}
          </span>
          <span className="text-xs text-gray-400 font-mono">{obs.stationId}</span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {date.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <CloudLightning className="w-4 h-4 text-orange-500 shrink-0" />
          <div>
            <div className="text-xs text-gray-400">Hail</div>
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {obs.hasHail ? 'Detected' : 'None'}
            </div>
          </div>
        </div>
        {obs.precipitationMm != null && (
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary-500 shrink-0" />
            <div>
              <div className="text-xs text-gray-400">Precip</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {obs.precipitationMm.toFixed(1)} mm
              </div>
            </div>
          </div>
        )}
        {obs.windSpeedKph != null && (
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary-400 shrink-0" />
            <div>
              <div className="text-xs text-gray-400">Wind</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {obs.windSpeedKph.toFixed(0)} km/h
              </div>
            </div>
          </div>
        )}
        {obs.hailDescription && (
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs text-gray-400 mb-0.5">Weather Code</div>
            <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-paper dark:bg-canvas px-2 py-1 rounded">
              {obs.hailDescription}
            </div>
          </div>
        )}
      </div>

      {obs.textDescription && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{obs.textDescription}</p>
        </div>
      )}
    </div>
  );
}

function StationObservationsPanel({ stationId, stationName }: { stationId: string; stationName: string }) {
  const [obs, setObs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStationObservations(stationId, 48);
      setObs(data);
      setLoaded(true);
    } catch {
      setLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const hailObs = obs.filter((o) =>
    o.presentWeather?.some((pw: any) => pw.rawString?.toLowerCase().includes('hail')) ||
    o.textDescription?.toLowerCase().includes('hail')
  );

  return (
    <div className="bg-paper dark:bg-canvas/30 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{stationName}</p>
          <p className="text-xs text-gray-400 font-mono">{stationId}</p>
        </div>
        {!loaded ? (
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <History className="w-3 h-3" />}
            Load History
          </button>
        ) : (
          <span className="text-xs text-gray-400">{hailObs.length} hail obs in 48h</span>
        )}
      </div>

      {loaded && hailObs.length > 0 && (
        <div className="space-y-2 mt-3">
          {hailObs.slice(0, 5).map((o, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-2 border-t border-gray-100 dark:border-gray-700">
              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-gray-500">{new Date(o.timestamp).toLocaleString()}</span>
              <span className="text-orange-600 dark:text-orange-400 font-medium">Hail detected</span>
              {o.textDescription && (
                <span className="text-gray-400 truncate">{o.textDescription}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {loaded && hailObs.length === 0 && (
        <p className="text-xs text-gray-400 mt-2">No hail observations in the past 48 hours</p>
      )}
    </div>
  );
}

export function HistoricalStormTab({ operatingStates }: Props) {
  const [searchState, setSearchState] = useState<AddressSearchState>({
    address: '',
    isGeocoding: false,
  });
  const [observations, setObservations] = useState<StationHailObservation[]>([]);
  const [nearbyStations, setNearbyStations] = useState<Array<{ stationId: string; stationName: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedAddress, setSearchedAddress] = useState<string>('');

  const handleSearch = async () => {
    if (!searchState.address.trim()) return;
    setIsSearching(true);
    setError(null);
    setObservations([]);
    setNearbyStations([]);

    try {
      const coords = await geocodeAddress(searchState.address);
      if (!coords) {
        setError('Could not find coordinates for that address. Try adding a city and state.');
        return;
      }

      setSearchState((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
      setSearchedAddress(searchState.address);

      const delta = 0.5;
      const obs = await fetchHailObservationsNearBbox(
        coords.lat - delta,
        coords.lng - delta,
        coords.lat + delta,
        coords.lng + delta
      );
      setObservations(obs);

      const pointMeta = await fetchPointMetadata(coords.lat, coords.lng);
      if (pointMeta) {
        setNearbyStations([
          { stationId: pointMeta.forecastZone, stationName: `Zone ${pointMeta.forecastZone}` },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <History className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-primary-900 dark:text-primary-200 mb-1">
              Historical Storm Path Reconstruction
            </h3>
            <p className="text-xs text-primary-700 dark:text-primary-300">
              Search for an address to find nearby NWS observation stations and retrieve historical hail
              observation records. This combines station observation data with P-VTEC hazard codes to
              show when and where hail warnings were active.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchState.address}
            onChange={(e) => setSearchState((prev) => ({ ...prev, address: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter address, city, or ZIP code..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchState.address.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isSearching ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {searchState.lat && searchState.lng && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Searched: {searchedAddress} ({searchState.lat.toFixed(4)}, {searchState.lng.toFixed(4)})
        </div>
      )}

      {observations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <CloudLightning className="w-4 h-4 text-orange-500" />
            Hail Observations Found ({observations.length})
          </h3>
          <div className="space-y-3">
            {observations.map((obs, i) => (
              <ObservationCard key={i} obs={obs} />
            ))}
          </div>
        </div>
      )}

      {searchState.lat && observations.length === 0 && !isSearching && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <CloudLightning className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-medium text-gray-900 dark:text-white mb-1">No Recent Hail Observations</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hail was reported at observation stations near this location in recent data.
          </p>
        </div>
      )}

      {!searchState.lat && !isSearching && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-10 text-center">
          <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter an address above to search for historical hail observations near that location
          </p>
        </div>
      )}
    </div>
  );
}
