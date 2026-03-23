import { useMemo, useCallback } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { CircleLayer, SymbolLayer } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'react-map-gl';
import type { Door, CanvassOutcome } from '../../types';

export interface DoorsLayerProps {
  doors: Door[];
  selectedDoorId?: string | null;
  onDoorClick?: (door: Door) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  clusterRadius?: number;
  clusterMaxZoom?: number;
}

function getOutcomeColor(outcome?: CanvassOutcome | null): string {
  if (!outcome) return '#9CA3AF';

  switch (outcome) {
    case 'NO_ANSWER':
    case 'NOT_HOME':
      return '#FBBF24';
    case 'INTERESTED':
      return '#22C55E';
    case 'NOT_INTERESTED':
      return '#EF4444';
    case 'FOLLOW_UP':
    case 'CALLBACK_REQUESTED':
      return '#F97316';
    case 'APPOINTMENT_SET':
      return '#3B82F6';
    case 'DO_NOT_KNOCK':
      return '#1F2937';
    default:
      return '#9CA3AF';
  }
}

export function DoorsLayer({
  doors,
  selectedDoorId,
  onDoorClick,
  onMouseEnter,
  onMouseLeave,
  clusterRadius = 50,
  clusterMaxZoom = 14,
}: DoorsLayerProps) {
  const geojsonData = useMemo(() => {
    const features: GeoJSON.Feature[] = doors.map((door) => ({
      type: 'Feature',
      id: door.id,
      properties: {
        id: door.id,
        address: door.address1,
        city: door.city,
        outcome: door.last_outcome || 'unvisited',
        visitCount: door.visit_count,
        isDoNotKnock: door.is_do_not_knock,
        isSelected: door.id === selectedDoorId,
        color: door.is_do_not_knock ? '#1F2937' : getOutcomeColor(door.last_outcome),
      },
      geometry: {
        type: 'Point',
        coordinates: [door.lng, door.lat],
      },
    }));

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [doors, selectedDoorId]);

  const clusterLayer: CircleLayer = useMemo(
    () => ({
      id: 'door-clusters',
      type: 'circle',
      source: 'doors',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#60A5FA',
          10,
          '#3B82F6',
          50,
          '#1D4ED8',
          100,
          '#1E3A8A',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 25, 50, 30, 100, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
      },
    }),
    []
  );

  const clusterCountLayer: SymbolLayer = useMemo(
    () => ({
      id: 'door-cluster-count',
      type: 'symbol',
      source: 'doors',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#FFFFFF',
      },
    }),
    []
  );

  const unclusteredPointLayer: CircleLayer = useMemo(
    () => ({
      id: 'door-unclustered-point',
      type: 'circle',
      source: 'doors',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['case', ['==', ['get', 'isSelected'], true], 10, 7],
        'circle-stroke-width': ['case', ['==', ['get', 'isSelected'], true], 3, 2],
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'isSelected'], true],
          '#000000',
          '#FFFFFF',
        ],
      },
    }),
    []
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0 && onDoorClick) {
        const feature = e.features[0];

        if (feature.properties?.point_count) {
          return;
        }

        const doorId = feature.properties?.id;
        const door = doors.find((d) => d.id === doorId);
        if (door) {
          onDoorClick(door);
        }
      }
    },
    [doors, onDoorClick]
  );

  if (doors.length === 0) {
    return null;
  }

  return (
    <Source
      id="doors"
      type="geojson"
      data={geojsonData}
      cluster={true}
      clusterRadius={clusterRadius}
      clusterMaxZoom={clusterMaxZoom}
    >
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer
        {...unclusteredPointLayer}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </Source>
  );
}

export function DoorsLegend() {
  const outcomes: Array<{ outcome: CanvassOutcome | null; label: string }> = [
    { outcome: null, label: 'Not Visited' },
    { outcome: 'NO_ANSWER', label: 'No Answer' },
    { outcome: 'INTERESTED', label: 'Interested' },
    { outcome: 'NOT_INTERESTED', label: 'Not Interested' },
    { outcome: 'FOLLOW_UP', label: 'Follow Up' },
    { outcome: 'APPOINTMENT_SET', label: 'Appointment Set' },
    { outcome: 'DO_NOT_KNOCK', label: 'Do Not Knock' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Door Status
      </h4>
      <div className="space-y-1">
        {outcomes.map(({ outcome, label }) => (
          <div key={outcome || 'unvisited'} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: getOutcomeColor(outcome) }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
