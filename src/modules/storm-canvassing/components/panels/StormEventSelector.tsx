import { useState } from 'react';
import { ChevronDown, Cloud, Calendar, MapPin, Check, AlertTriangle, Radio, History, Clock } from 'lucide-react';
import type { StormEvent } from '../../types';
import type { ParsedHailAlert, StationHailObservation } from '../../services/nwsApiService';
import { getAlertFillColor, formatAlertExpiry } from '../../services/nwsApiService';

export interface StormEventSelectorProps {
  events: StormEvent[];
  selectedEventId?: string | null;
  onEventSelect: (event: StormEvent | null) => void;
  isLoading?: boolean;
  liveAlerts?: ParsedHailAlert[];
  liveAlertsLoading?: boolean;
  onAlertSelect?: (alert: ParsedHailAlert) => void;
  selectedAlertId?: string | null;
  historicalObservations?: StationHailObservation[];
  historicalLoading?: boolean;
}

export function StormEventSelector({
  events,
  selectedEventId,
  onEventSelect,
  isLoading,
  liveAlerts = [],
  liveAlertsLoading,
  onAlertSelect,
  selectedAlertId,
  historicalObservations = [],
  historicalLoading,
}: StormEventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const hailAlerts = liveAlerts.filter((a) => a.isHailRelated || a.isThunderstormRelated || a.isTornadoRelated);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <Cloud className="w-5 h-5 text-primary-500" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedEvent ? selectedEvent.name : 'Select Storm Event'}
            </p>
            {selectedEvent && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedEvent.event_date || 'Date unknown'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hailAlerts.length > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              {hailAlerts.length}
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-[28rem] overflow-y-auto">
            <button
              onClick={() => {
                onEventSelect(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                !selectedEventId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Cloud className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">All Events</span>
              {!selectedEventId && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
            </button>

            {hailAlerts.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                      Live NWS Alerts ({hailAlerts.length})
                    </span>
                    <Radio className="w-3 h-3 text-red-500 animate-pulse ml-auto" />
                  </div>
                </div>
                {hailAlerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => {
                      onAlertSelect?.(alert);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-t border-gray-100 dark:border-gray-700 ${
                      selectedAlertId === alert.id ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
                      style={{ backgroundColor: getAlertFillColor(alert) }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {alert.event}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {alert.areaDesc}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                          alert.severity === 'Extreme' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          alert.severity === 'Severe' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {alert.severity}
                        </span>
                        {alert.maxHailInches && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.maxHailInches}" hail
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          {formatAlertExpiry(alert.expires)}
                        </span>
                      </div>
                    </div>
                    {selectedAlertId === alert.id && (
                      <Check className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {liveAlertsLoading && hailAlerts.length === 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Loading live alerts...</span>
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Storm Events ({events.length})
                  </span>
                </div>
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      onEventSelect(event);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-t border-gray-100 dark:border-gray-700 ${
                      selectedEventId === event.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <Cloud className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {event.event_date && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {event.event_date}
                          </span>
                        )}
                        {event.center_lat && event.center_lng && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {event.center_lat.toFixed(2)}, {event.center_lng.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {selectedEventId === event.id && (
                      <Check className="w-4 h-4 text-blue-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {events.length === 0 && hailAlerts.length === 0 && !isLoading && !liveAlertsLoading && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No storm events found</p>
              </div>
            )}

            {historicalObservations.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700">
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                      Recent Hail Observations ({historicalObservations.length})
                    </span>
                  </div>
                </div>
                {historicalObservations.slice(0, 8).map((obs, i) => (
                  <div
                    key={`${obs.stationId}-${obs.timestamp}-${i}`}
                    className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {obs.stationName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(obs.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {obs.hailDescription && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {obs.hailDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {historicalLoading && historicalObservations.length === 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Loading historical data...</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
