import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import type { StormLayer } from '../../types';

export interface StormLayerOverlayProps {
  layer: StormLayer;
  opacity?: number;
  threshold?: number;
}

function getHailColor(size: number): string {
  if (size < 0.75) return '#22C55E';
  if (size < 1.0) return '#84CC16';
  if (size < 1.5) return '#EAB308';
  if (size < 2.0) return '#F97316';
  if (size < 2.5) return '#EF4444';
  return '#991B1B';
}

export function StormLayerOverlay({
  layer,
  opacity = 0.5,
  threshold = 0,
}: StormLayerOverlayProps) {
  const filteredGeoJSON = useMemo(() => {
    if (!layer.geojson) return null;

    if (threshold <= 0) return layer.geojson;

    const filteredFeatures = layer.geojson.features.filter((feature) => {
      const hailSize = feature.properties?.hailSize as number | undefined;
      return hailSize !== undefined && hailSize >= threshold;
    });

    return {
      ...layer.geojson,
      features: filteredFeatures,
    };
  }, [layer.geojson, threshold]);

  const fillLayerStyle: FillLayer = useMemo(() => {
    const baseStyle: FillLayer = {
      id: `storm-fill-${layer.id}`,
      type: 'fill',
      source: `storm-source-${layer.id}`,
      paint: {
        'fill-opacity': opacity,
      },
    };

    if (layer.layer_type === 'HAIL') {
      baseStyle.paint = {
        ...baseStyle.paint,
        'fill-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'hailSize'], 0],
          0.5,
          '#22C55E',
          0.75,
          '#84CC16',
          1.0,
          '#EAB308',
          1.5,
          '#F97316',
          2.0,
          '#EF4444',
          2.5,
          '#991B1B',
        ],
      };
    } else if (layer.layer_type === 'TORNADO') {
      baseStyle.paint = {
        ...baseStyle.paint,
        'fill-color': layer.style?.fillColor || '#FF0000',
      };
    } else if (layer.layer_type === 'WIND') {
      baseStyle.paint = {
        ...baseStyle.paint,
        'fill-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'windSpeed'], 0],
          50,
          '#60A5FA',
          75,
          '#3B82F6',
          100,
          '#1D4ED8',
          125,
          '#1E3A8A',
        ],
      };
    } else {
      baseStyle.paint = {
        ...baseStyle.paint,
        'fill-color': layer.style?.fillColor || '#6366F1',
      };
    }

    return baseStyle;
  }, [layer, opacity]);

  const lineLayerStyle: LineLayer = useMemo(
    () => ({
      id: `storm-line-${layer.id}`,
      type: 'line',
      source: `storm-source-${layer.id}`,
      paint: {
        'line-color': layer.style?.strokeColor || '#333333',
        'line-width': layer.style?.strokeWidth || 1,
        'line-opacity': Math.min(opacity + 0.2, 1),
      },
    }),
    [layer, opacity]
  );

  if (!filteredGeoJSON || filteredGeoJSON.features.length === 0) {
    return null;
  }

  return (
    <Source id={`storm-source-${layer.id}`} type="geojson" data={filteredGeoJSON}>
      <Layer {...fillLayerStyle} />
      <Layer {...lineLayerStyle} />
    </Source>
  );
}

export function StormLayerLegend({
  layerType,
}: {
  layerType: 'HAIL' | 'WIND' | 'TORNADO' | 'FLOOD';
}) {
  if (layerType === 'HAIL') {
    const stops = [
      { size: '< 0.75"', color: getHailColor(0.5), label: 'Pea' },
      { size: '0.75-1"', color: getHailColor(0.8), label: 'Penny' },
      { size: '1-1.5"', color: getHailColor(1.25), label: 'Quarter' },
      { size: '1.5-2"', color: getHailColor(1.75), label: 'Golf Ball' },
      { size: '2-2.5"', color: getHailColor(2.25), label: 'Tennis Ball' },
      { size: '> 2.5"', color: getHailColor(3), label: 'Baseball+' },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Hail Size
        </h4>
        <div className="space-y-1">
          {stops.map((stop) => (
            <div key={stop.size} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: stop.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {stop.size} ({stop.label})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
