import { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronUp, Cloud, MapPin, Home, UserCheck, AlertTriangle, CloudRain, Thermometer, Wind } from 'lucide-react';
import { StormLayerLegend } from './StormLayerOverlay';
import { TurfLegend } from './TurfLayer';
import { DoorsLegend } from './DoorsLayer';
import { AlertsLegend } from './AlertsLayer';
import type { HailForecastPoint } from '../../services/nwsApiService';

export interface LayerVisibility {
  storm: boolean;
  turfs: boolean;
  doors: boolean;
  reps: boolean;
  alerts: boolean;
}

export interface MapControlsProps {
  layerVisibility: LayerVisibility;
  onLayerVisibilityChange: (visibility: LayerVisibility) => void;
  stormLayerOpacity: number;
  onStormLayerOpacityChange: (opacity: number) => void;
  hailThreshold: number;
  onHailThresholdChange: (threshold: number) => void;
  showHailControls?: boolean;
  repCount?: number;
  liveAlertCount?: number;
  hailForecast?: HailForecastPoint[];
  hailForecastLoading?: boolean;
  isDrawingMode?: boolean;
  onToggleDrawingMode?: () => void;
}

export function MapControls({
  layerVisibility,
  onLayerVisibilityChange,
  stormLayerOpacity,
  onStormLayerOpacityChange,
  hailThreshold,
  onHailThresholdChange,
  showHailControls = true,
  repCount = 0,
  liveAlertCount = 0,
  hailForecast = [],
  hailForecastLoading,
  isDrawingMode,
  onToggleDrawingMode,
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const toggleLayer = (layer: keyof LayerVisibility) => {
    onLayerVisibilityChange({
      ...layerVisibility,
      [layer]: !layerVisibility[layer],
    });
  };

  const upcomingHailPeriods = hailForecast.filter((fp) => fp.hasHailWeather).slice(0, 4);

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Layers
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 space-y-3">
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <LayerToggle
                icon={<Cloud className="w-4 h-4" />}
                label="Storm Overlay"
                isVisible={layerVisibility.storm}
                onToggle={() => toggleLayer('storm')}
              />
              <LayerToggle
                icon={<AlertTriangle className="w-4 h-4" />}
                label={liveAlertCount > 0 ? `NWS Alerts (${liveAlertCount})` : 'NWS Alerts'}
                isVisible={layerVisibility.alerts}
                onToggle={() => toggleLayer('alerts')}
                badgeColor={liveAlertCount > 0 ? 'red' : undefined}
              />
              <LayerToggle
                icon={<MapPin className="w-4 h-4" />}
                label="Turfs"
                isVisible={layerVisibility.turfs}
                onToggle={() => toggleLayer('turfs')}
              />
              <LayerToggle
                icon={<Home className="w-4 h-4" />}
                label="Doors"
                isVisible={layerVisibility.doors}
                onToggle={() => toggleLayer('doors')}
              />
              <LayerToggle
                icon={<UserCheck className="w-4 h-4" />}
                label={repCount > 0 ? `Reps (${repCount})` : 'Reps'}
                isVisible={layerVisibility.reps}
                onToggle={() => toggleLayer('reps')}
              />
            </div>

            {showHailControls && layerVisibility.storm && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Storm Opacity: {Math.round(stormLayerOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stormLayerOpacity * 100}
                    onChange={(e) => onStormLayerOpacityChange(Number(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Min Hail Size: {hailThreshold > 0 ? `${hailThreshold}"` : 'All'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.25"
                    value={hailThreshold}
                    onChange={(e) => onHailThresholdChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {onToggleDrawingMode && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onToggleDrawingMode}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDrawingMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {isDrawingMode ? 'Drawing Turf...' : 'Draw Turf Polygon'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {(upcomingHailPeriods.length > 0 || hailForecastLoading) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hail Forecast
              </span>
              {upcomingHailPeriods.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                  {upcomingHailPeriods.length}
                </span>
              )}
            </div>
            {showForecast ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showForecast && (
            <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700">
              {hailForecastLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Loading forecast...</span>
                </div>
              ) : upcomingHailPeriods.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                  No hail risk in the current forecast window
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {upcomingHailPeriods.map((fp, i) => {
                    const timeStr = fp.validTime.split('/')[0];
                    const date = new Date(timeStr);
                    return (
                      <div key={i} className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                            {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {fp.weatherDescriptions.map((desc, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded"
                            >
                              {desc}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {fp.precipitationProbability != null && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Thermometer className="w-3 h-3" />
                              {fp.precipitationProbability}% precip
                            </span>
                          )}
                          {fp.hazardPhenomena.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <Wind className="w-3 h-3" />
                              {fp.hazardPhenomena.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowLegend(!showLegend)}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </span>
      </button>

      {showLegend && (
        <div className="space-y-2">
          {layerVisibility.storm && <StormLayerLegend layerType="HAIL" />}
          {layerVisibility.alerts && <AlertsLegend />}
          {layerVisibility.turfs && <TurfLegend />}
          {layerVisibility.doors && <DoorsLegend />}
        </div>
      )}
    </div>
  );
}

interface LayerToggleProps {
  icon: React.ReactNode;
  label: string;
  isVisible: boolean;
  onToggle: () => void;
  badgeColor?: 'red' | 'orange';
}

function LayerToggle({ icon, label, isVisible, onToggle, badgeColor }: LayerToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-2">
        <span className={isVisible ? 'text-primary-500' : 'text-gray-400'}>{icon}</span>
        <span
          className={`text-sm ${
            isVisible ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {label}
        </span>
        {badgeColor === 'red' && isVisible && (
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      {isVisible ? (
        <Eye className="w-4 h-4 text-primary-500" />
      ) : (
        <EyeOff className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
}
