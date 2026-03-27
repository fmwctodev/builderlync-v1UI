import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Map, { MapRef, NavigationControl, GeolocateControl, ScaleControl } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { StormLayerOverlay } from './StormLayerOverlay';
import { TurfLayer } from './TurfLayer';
import { DoorsLayer } from './DoorsLayer';
import { UserLocationMarker } from './UserLocationMarker';
import { RepLocationsLayer } from './RepLocationsLayer';
import { AlertsLayer } from './AlertsLayer';
import type { StormLayer, Turf, Door, TeamMemberLocation } from '../../types';
import type { ParsedHailAlert } from '../../services/nwsApiService';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export interface CanvassingMapProps {
  stormLayers?: StormLayer[];
  turfs?: Turf[];
  doors?: Door[];
  selectedTurfId?: string | null;
  selectedDoorId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  showUserLocation?: boolean;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onTurfClick?: (turf: Turf) => void;
  onDoorClick?: (door: Door) => void;
  onMapClick?: (e: MapLayerMouseEvent) => void;
  repLocations?: TeamMemberLocation[];
  currentUserId?: string;
  layerVisibility?: {
    storm?: boolean;
    turfs?: boolean;
    doors?: boolean;
    reps?: boolean;
    alerts?: boolean;
  };
  stormLayerOpacity?: number;
  hailThreshold?: number;
  isDrawingMode?: boolean;
  onDrawComplete?: (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon) => void;
  liveAlerts?: ParsedHailAlert[];
  onViewportChange?: (bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }) => void;
  className?: string;
}

const DEFAULT_VIEW_STATE = {
  longitude: -104.9903,
  latitude: 39.7392,
  zoom: 10,
};

export function CanvassingMap({
  stormLayers = [],
  turfs = [],
  doors = [],
  selectedTurfId,
  selectedDoorId,
  userLocation,
  showUserLocation = true,
  initialViewState = DEFAULT_VIEW_STATE,
  onTurfClick,
  onDoorClick,
  onMapClick,
  repLocations = [],
  currentUserId,
  layerVisibility = { storm: true, turfs: true, doors: true, reps: true, alerts: true },
  stormLayerOpacity = 0.5,
  hailThreshold = 0,
  isDrawingMode = false,
  onDrawComplete,
  liveAlerts = [],
  onViewportChange,
  className = '',
}: CanvassingMapProps) {
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [viewState, setViewState] = useState(initialViewState);
  const [cursor, setCursor] = useState<string>('auto');
  const viewportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleStormLayers = useMemo(() => {
    return stormLayers.filter((layer) => layer.is_visible);
  }, [stormLayers]);

  const handleTurfClick = useCallback(
    (turf: Turf) => {
      onTurfClick?.(turf);

      if (turf.bbox && mapRef.current) {
        mapRef.current.fitBounds(
          [
            [turf.bbox.minLng, turf.bbox.minLat],
            [turf.bbox.maxLng, turf.bbox.maxLat],
          ],
          { padding: 50, duration: 1000 }
        );
      }
    },
    [onTurfClick]
  );

  const handleDoorClick = useCallback(
    (door: Door) => {
      onDoorClick?.(door);
    },
    [onDoorClick]
  );

  const handleMouseEnter = useCallback(() => {
    setCursor('pointer');
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursor('auto');
  }, []);

  useEffect(() => {
    if (selectedTurfId && mapRef.current) {
      const selectedTurf = turfs.find((t) => t.id === selectedTurfId);
      if (selectedTurf?.bbox) {
        mapRef.current.fitBounds(
          [
            [selectedTurf.bbox.minLng, selectedTurf.bbox.minLat],
            [selectedTurf.bbox.maxLng, selectedTurf.bbox.maxLat],
          ],
          { padding: 50, duration: 1000 }
        );
      }
    }
  }, [selectedTurfId, turfs]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (isDrawingMode && !drawRef.current) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        defaultMode: 'draw_polygon',
      });
      map.addControl(draw as unknown as mapboxgl.IControl);
      drawRef.current = draw;

      const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
        const feature = e.features[0];
        if (feature?.geometry && onDrawComplete) {
          onDrawComplete(feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon);
        }
        draw.deleteAll();
      };

      map.on('draw.create', handleCreate);
      setCursor('crosshair');

      return () => {
        map.off('draw.create', handleCreate);
        if (drawRef.current) {
          map.removeControl(drawRef.current as unknown as mapboxgl.IControl);
          drawRef.current = null;
        }
        setCursor('auto');
      };
    }

    if (!isDrawingMode && drawRef.current) {
      map.removeControl(drawRef.current as unknown as mapboxgl.IControl);
      drawRef.current = null;
      setCursor('auto');
    }
  }, [isDrawingMode, onDrawComplete]);

  const handleMoveEnd = useCallback(() => {
    if (!onViewportChange || !mapRef.current) return;
    if (viewportTimerRef.current) clearTimeout(viewportTimerRef.current);
    viewportTimerRef.current = setTimeout(() => {
      const bounds = mapRef.current?.getBounds();
      if (bounds) {
        onViewportChange({
          minLng: bounds.getWest(),
          minLat: bounds.getSouth(),
          maxLng: bounds.getEast(),
          maxLat: bounds.getNorth(),
        });
      }
    }, 2000);
  }, [onViewportChange]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Mapbox token not configured</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Set VITE_MAPBOX_TOKEN in your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      onMoveEnd={handleMoveEnd}
      onClick={onMapClick}
      cursor={isDrawingMode ? 'crosshair' : cursor}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
      className={className}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl
        position="top-right"
        trackUserLocation
        showUserHeading
        showAccuracyCircle={false}
      />
      <ScaleControl position="bottom-left" />

      {layerVisibility.storm &&
        visibleStormLayers.map((layer) => (
          <StormLayerOverlay
            key={layer.id}
            layer={layer}
            opacity={stormLayerOpacity}
            threshold={hailThreshold}
          />
        ))}

      {layerVisibility.alerts && liveAlerts.length > 0 && (
        <AlertsLayer alerts={liveAlerts} opacity={stormLayerOpacity * 0.7} />
      )}

      {layerVisibility.turfs && (
        <TurfLayer
          turfs={turfs}
          selectedTurfId={selectedTurfId}
          onTurfClick={handleTurfClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {layerVisibility.doors && (
        <DoorsLayer
          doors={doors}
          selectedDoorId={selectedDoorId}
          onDoorClick={handleDoorClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {showUserLocation && userLocation && (
        <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} />
      )}

      {layerVisibility.reps && repLocations.length > 0 && (
        <RepLocationsLayer repLocations={repLocations} currentUserId={currentUserId} />
      )}
    </Map>
  );
}
