import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import type { ParsedHailAlert } from '../../services/nwsApiService';
import { buildAlertGeoJSONLayer } from '../../services/nwsApiService';

export interface AlertsLayerProps {
  alerts: ParsedHailAlert[];
  opacity?: number;
  onClick?: (alertId: string) => void;
}

export function AlertsLayer({ alerts, opacity = 0.35 }: AlertsLayerProps) {
  const geojson = useMemo(() => buildAlertGeoJSONLayer(alerts), [alerts]);

  const fillStyle: FillLayer = useMemo(
    () => ({
      id: 'nws-alerts-fill',
      type: 'fill',
      source: 'nws-alerts-source',
      paint: {
        'fill-color': ['get', 'fill_color'],
        'fill-opacity': opacity,
      },
    }),
    [opacity]
  );

  const lineStyle: LineLayer = useMemo(
    () => ({
      id: 'nws-alerts-line',
      type: 'line',
      source: 'nws-alerts-source',
      paint: {
        'line-color': ['get', 'fill_color'],
        'line-width': 2,
        'line-opacity': Math.min(opacity + 0.3, 1),
        'line-dasharray': [2, 2],
      },
    }),
    [opacity]
  );

  if (geojson.features.length === 0) return null;

  return (
    <Source id="nws-alerts-source" type="geojson" data={geojson}>
      <Layer {...fillStyle} />
      <Layer {...lineStyle} />
    </Source>
  );
}

export function AlertsLegend() {
  const items = [
    { label: 'Tornado', color: '#ef4444' },
    { label: 'Extreme', color: '#dc2626' },
    { label: 'Severe Hail', color: '#f97316' },
    { label: 'Severe', color: '#f59e0b' },
    { label: 'Moderate', color: '#eab308' },
    { label: 'Minor', color: '#84cc16' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        NWS Alerts
      </h4>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: item.color, opacity: 0.6 }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
