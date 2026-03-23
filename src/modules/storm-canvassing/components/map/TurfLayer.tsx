import { useMemo, useCallback } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { FillLayer, LineLayer } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'react-map-gl';
import type { Turf, TurfStatus } from '../../types';

export interface TurfLayerProps {
  turfs: Turf[];
  selectedTurfId?: string | null;
  onTurfClick?: (turf: Turf) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function getStatusColor(status: TurfStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return '#9CA3AF';
    case 'IN_PROGRESS':
      return '#3B82F6';
    case 'COMPLETED':
      return '#22C55E';
    case 'ARCHIVED':
      return '#6B7280';
    default:
      return '#9CA3AF';
  }
}

function getStatusFillOpacity(status: TurfStatus, isSelected: boolean): number {
  if (isSelected) return 0.4;

  switch (status) {
    case 'NOT_STARTED':
      return 0.1;
    case 'IN_PROGRESS':
      return 0.25;
    case 'COMPLETED':
      return 0.3;
    case 'ARCHIVED':
      return 0.05;
    default:
      return 0.1;
  }
}

export function TurfLayer({
  turfs,
  selectedTurfId,
  onTurfClick,
  onMouseEnter,
  onMouseLeave,
}: TurfLayerProps) {
  const geojsonData = useMemo(() => {
    const features: GeoJSON.Feature[] = turfs.map((turf) => ({
      type: 'Feature',
      id: turf.id,
      properties: {
        id: turf.id,
        name: turf.name,
        status: turf.status,
        color: turf.color || getStatusColor(turf.status),
        totalDoors: turf.total_doors,
        visitedDoors: turf.visited_doors,
        completionPct:
          turf.total_doors > 0
            ? Math.round((turf.visited_doors / turf.total_doors) * 100)
            : 0,
        isSelected: turf.id === selectedTurfId,
      },
      geometry: turf.geometry,
    }));

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [turfs, selectedTurfId]);

  const fillLayerStyle: FillLayer = useMemo(
    () => ({
      id: 'turf-fill',
      type: 'fill',
      source: 'turfs',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['==', ['get', 'isSelected'], true],
          0.4,
          ['match', ['get', 'status'], 'NOT_STARTED', 0.1, 'IN_PROGRESS', 0.25, 'COMPLETED', 0.3, 0.1],
        ],
      },
    }),
    []
  );

  const lineLayerStyle: LineLayer = useMemo(
    () => ({
      id: 'turf-line',
      type: 'line',
      source: 'turfs',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['case', ['==', ['get', 'isSelected'], true], 3, 2],
        'line-opacity': 0.9,
      },
    }),
    []
  );

  const selectedLineLayerStyle: LineLayer = useMemo(
    () => ({
      id: 'turf-selected-line',
      type: 'line',
      source: 'turfs',
      filter: ['==', ['get', 'isSelected'], true],
      paint: {
        'line-color': '#000000',
        'line-width': 4,
        'line-opacity': 0.3,
      },
    }),
    []
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0 && onTurfClick) {
        const feature = e.features[0];
        const turfId = feature.properties?.id;
        const turf = turfs.find((t) => t.id === turfId);
        if (turf) {
          onTurfClick(turf);
        }
      }
    },
    [turfs, onTurfClick]
  );

  if (turfs.length === 0) {
    return null;
  }

  return (
    <Source id="turfs" type="geojson" data={geojsonData}>
      <Layer
        {...selectedLineLayerStyle}
        beforeId="turf-fill"
      />
      <Layer
        {...fillLayerStyle}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      <Layer {...lineLayerStyle} />
    </Source>
  );
}

export function TurfLegend() {
  const statuses: Array<{ status: TurfStatus; label: string }> = [
    { status: 'NOT_STARTED', label: 'Not Started' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Turf Status
      </h4>
      <div className="space-y-1">
        {statuses.map(({ status, label }) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border-2"
              style={{
                borderColor: getStatusColor(status),
                backgroundColor: getStatusColor(status),
                opacity: getStatusFillOpacity(status, false) + 0.3,
              }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
