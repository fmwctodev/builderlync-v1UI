import { useState } from 'react';
import { Layers, Eye, EyeOff, ChevronDown, ChevronUp, Cloud, MapPin, Home, UserCheck } from 'lucide-react';
import { StormLayerLegend } from './StormLayerOverlay';
import { TurfLegend } from './TurfLayer';
import { DoorsLegend } from './DoorsLayer';

export interface LayerVisibility {
  storm: boolean;
  turfs: boolean;
  doors: boolean;
  reps: boolean;
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
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  const toggleLayer = (layer: keyof LayerVisibility) => {
    onLayerVisibilityChange({
      ...layerVisibility,
      [layer]: !layerVisibility[layer],
    });
  };

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
          </div>
        )}
      </div>

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
}

function LayerToggle({ icon, label, isVisible, onToggle }: LayerToggleProps) {
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
      </div>
      {isVisible ? (
        <Eye className="w-4 h-4 text-primary-500" />
      ) : (
        <EyeOff className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
}
