import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, RefreshCw, Download } from 'lucide-react';

import { CanvassingMap, MapControls, LayerVisibility } from '../components/map';
import {
  StormEventSelector,
  TurfListPanel,
  DoorInfoDrawer,
  CanvassingModePanel,
  CreateTurfModal,
  ZoneSubscriptionsPanel,
  StormAlertToastBanner,
} from '../components/panels';

import { useOfflineSync } from '../offline/hooks/useOfflineSync';
import { cacheTurfWithDoors, createOfflineVisit, queueMediaCapture } from '../offline/syncService';
import { findNearestUnvisitedDoor, getDoorsInTurf } from '../services/doorsApi';
import { getStormEvents, importStormEventsFromProvider } from '../services/stormEventsApi';
import { getTurfs, updateTurfAssignmentStatus, createTurf } from '../services/turfsApi';
import { createVisit } from '../services/visitsApi';
import { revealContact, getCreditBalance } from '../services/contactRevealApi';
import { getOrCreateOrgSettings } from '../services/orgSettingsApi';
import { getTeamLocationsWithStats, updateRepLocation, deactivateRepLocation } from '../services/repLocationsApi';
import {
  fetchHailAlertsByStates,
  fetchHailObservationsNearBbox,
  extractHailForecastFromGridpoint,
  fetchPointMetadata,
  fetchZonesByState,
} from '../services/nwsApiService';
import type { ParsedHailAlert, StationHailObservation, HailForecastPoint, NWSZone } from '../services/nwsApiService';
import {
  getZoneSubscriptions,
  createZoneSubscription,
  toggleZoneSubscription,
  deleteZoneSubscription,
} from '../services/zoneSubscriptionsApi';
import type { ZoneAlertSubscription, CreateZoneSubscriptionInput } from '../services/zoneSubscriptionsApi';

import { useStormAlertNotifications } from '../hooks/useStormAlertNotifications';
import { useStormAlertToast } from '../hooks/useStormAlertToast';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import type { StormEvent, StormLayer, Turf, Door, CanvassOutcome, CanvassOrgSettings, TeamMemberLocation } from '../types';

const ALERT_POLL_INTERVAL_MS = 5 * 60 * 1000;

export function StormMapPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const { user } = useSupabaseUser();
  const organizationId = currentOrganization?.id;
  const userId = user?.id;

  const [stormEvents, setStormEvents] = useState<StormEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<StormEvent | null>(null);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);

  const [creditBalance, setCreditBalance] = useState(0);
  const [orgSettings, setOrgSettings] = useState<CanvassOrgSettings | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const [isCanvassingMode, setIsCanvassingMode] = useState(false);
  const [currentCanvassingDoor, setCurrentCanvassingDoor] = useState<Door | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const [repLocations, setRepLocations] = useState<TeamMemberLocation[]>([]);

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    storm: true,
    turfs: true,
    doors: true,
    reps: true,
    alerts: true,
  });
  const [stormOpacity, setStormOpacity] = useState(0.5);
  const [hailThreshold, setHailThreshold] = useState(0);

  const [liveAlerts, setLiveAlerts] = useState<ParsedHailAlert[]>([]);
  const [liveAlertsLoading, setLiveAlertsLoading] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const [historicalObservations, setHistoricalObservations] = useState<StationHailObservation[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);

  const [hailForecast, setHailForecast] = useState<HailForecastPoint[]>([]);
  const [hailForecastLoading, setHailForecastLoading] = useState(false);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnGeometry, setDrawnGeometry] = useState<GeoJSON.Polygon | GeoJSON.MultiPolygon | null>(null);
  const [showCreateTurfModal, setShowCreateTurfModal] = useState(false);

  const [zoneSubscriptions, setZoneSubscriptions] = useState<ZoneAlertSubscription[]>([]);
  const [availableZones, setAvailableZones] = useState<NWSZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  const [viewportBounds, setViewportBounds] = useState<{
    minLng: number; minLat: number; maxLng: number; maxLat: number;
  } | null>(null);

  const { isActuallyOnline, pendingCount, pendingMediaCount, sync } = useOfflineSync(
    organizationId || null,
    userId || null
  );

  const { processNewAlerts, requestBrowserPermission } = useStormAlertNotifications({
    organizationId: organizationId || '',
    userId: userId || '',
    enableBrowser: true,
    enableEmail: zoneSubscriptions.some((s) => s.is_active && s.notify_email),
  });

  const { toasts, showAlertToasts, dismissToast } = useStormAlertToast();

  useEffect(() => {
    if (!organizationId) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [eventsData, turfsData, settings, balance] = await Promise.all([
          getStormEvents(organizationId!, { isActive: true }),
          getTurfs(organizationId!),
          getOrCreateOrgSettings(organizationId!),
          getCreditBalance(organizationId!),
        ]);

        setStormEvents(eventsData);
        setTurfs(turfsData);
        setOrgSettings(settings);
        setCreditBalance(balance);

        if (eventsData.length > 0) {
          setSelectedEvent(eventsData[0]);
        }
      } catch (err) {
        console.error('Error loading storm canvassing data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || !selectedTurf) {
      setDoors([]);
      return;
    }

    async function loadDoors() {
      try {
        const doorsData = await getDoorsInTurf(organizationId!, selectedTurf!.id);
        setDoors(doorsData);
      } catch (err) {
        console.error('Error loading doors:', err);
      }
    }

    loadDoors();
  }, [organizationId, selectedTurf]);

  useEffect(() => {
    if (!orgSettings?.allow_gps_tracking || !organizationId || !userId) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        updateRepLocation(organizationId, userId, lat, lng, position.coords.accuracy ?? undefined).catch(() => {});
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      deactivateRepLocation(organizationId, userId).catch(() => {});
    };
  }, [orgSettings?.allow_gps_tracking, organizationId, userId]);

  useEffect(() => {
    if (!organizationId || !orgSettings?.allow_gps_tracking) return;

    const fetchRepLocs = async () => {
      try {
        const locs = await getTeamLocationsWithStats(organizationId);
        setRepLocations(locs);
      } catch {
      }
    };

    fetchRepLocs();
    const interval = setInterval(fetchRepLocs, 60000);
    return () => clearInterval(interval);
  }, [organizationId, orgSettings?.allow_gps_tracking]);

  useEffect(() => {
    if (!organizationId || !orgSettings) return;

    const states = orgSettings.operating_states;
    if (!states || states.length === 0) return;

    let cancelled = false;

    const fetchAlerts = async () => {
      setLiveAlertsLoading(true);
      try {
        const alerts = await fetchHailAlertsByStates(states);
        if (cancelled) return;
        setLiveAlerts(alerts);

        const newAlerts = processNewAlerts(alerts);
        if (newAlerts.length > 0) {
          showAlertToasts(newAlerts);
        }
      } catch {
      } finally {
        if (!cancelled) setLiveAlertsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, ALERT_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [organizationId, orgSettings, processNewAlerts, showAlertToasts]);

  const viewportFetchRef = useRef(false);
  useEffect(() => {
    if (!viewportBounds || viewportFetchRef.current) return;

    viewportFetchRef.current = true;
    setHistoricalLoading(true);

    fetchHailObservationsNearBbox(
      viewportBounds.minLat,
      viewportBounds.minLng,
      viewportBounds.maxLat,
      viewportBounds.maxLng
    )
      .then((obs) => setHistoricalObservations(obs))
      .catch(() => {})
      .finally(() => {
        setHistoricalLoading(false);
        setTimeout(() => {
          viewportFetchRef.current = false;
        }, 30000);
      });
  }, [viewportBounds]);

  useEffect(() => {
    if (!selectedEvent?.center_lat || !selectedEvent?.center_lng) {
      setHailForecast([]);
      return;
    }

    let cancelled = false;
    setHailForecastLoading(true);

    (async () => {
      try {
        const meta = await fetchPointMetadata(selectedEvent.center_lat!, selectedEvent.center_lng!);
        if (!meta || cancelled) {
          setHailForecastLoading(false);
          return;
        }

        const forecast = await extractHailForecastFromGridpoint(meta.wfo, meta.gridX, meta.gridY);
        if (!cancelled) setHailForecast(forecast);
      } catch {
      } finally {
        if (!cancelled) setHailForecastLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedEvent?.id, selectedEvent?.center_lat, selectedEvent?.center_lng]);

  useEffect(() => {
    if (!organizationId || !userId) return;

    getZoneSubscriptions(organizationId, userId)
      .then(setZoneSubscriptions)
      .catch(() => {});
  }, [organizationId, userId]);

  useEffect(() => {
    if (!orgSettings?.operating_states?.length) return;

    let cancelled = false;
    setZonesLoading(true);

    (async () => {
      const allZones: NWSZone[] = [];
      for (const state of orgSettings.operating_states!.slice(0, 3)) {
        try {
          const zones = await fetchZonesByState(state);
          if (!cancelled) allZones.push(...zones);
        } catch {
        }
      }
      if (!cancelled) {
        setAvailableZones(allZones);
        setZonesLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [orgSettings?.operating_states]);

  useEffect(() => {
    requestBrowserPermission();
  }, [requestBrowserPermission]);

  const handleImportMockEvents = async () => {
    if (!organizationId || !userId) return;

    setIsImporting(true);
    try {
      const imported = await importStormEventsFromProvider(
        organizationId,
        'MOCK',
        undefined,
        undefined,
        userId
      );

      setStormEvents((prev) => [...imported, ...prev]);

      if (imported.length > 0 && !selectedEvent) {
        setSelectedEvent(imported[0]);
      }
    } catch (err) {
      console.error('Error importing mock events:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleTurfSelect = useCallback((turf: Turf) => {
    setSelectedTurf(turf);
    setSelectedDoor(null);
  }, []);

  const handleDoorClick = useCallback((door: Door) => {
    setSelectedDoor(door);
  }, []);

  const handleAlertSelect = useCallback((alert: ParsedHailAlert) => {
    setSelectedAlertId(alert.id);
  }, []);

  const handleViewportChange = useCallback((bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }) => {
    setViewportBounds(bounds);
  }, []);

  const handleDrawComplete = useCallback((geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon) => {
    setDrawnGeometry(geometry);
    setIsDrawingMode(false);
    setShowCreateTurfModal(true);
  }, []);

  const handleCreateTurfFromDrawing = useCallback(
    async (data: { name: string; description: string; stormEventId: string; color: string; geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon }) => {
      if (!organizationId || !data.geometry) return;

      const newTurf = await createTurf(
        organizationId,
        {
          name: data.name,
          description: data.description,
          geometry: data.geometry,
          stormEventId: data.stormEventId || undefined,
          color: data.color,
        },
        userId
      );

      setTurfs((prev) => [newTurf, ...prev]);
      setDrawnGeometry(null);
    },
    [organizationId, userId]
  );

  const handleCreateZoneSubscription = useCallback(
    async (input: CreateZoneSubscriptionInput) => {
      if (!organizationId || !userId) return;
      const sub = await createZoneSubscription(organizationId, userId, input);
      setZoneSubscriptions((prev) => [sub, ...prev]);
    },
    [organizationId, userId]
  );

  const handleToggleZoneSubscription = useCallback(async (id: string, isActive: boolean) => {
    await toggleZoneSubscription(id, isActive);
    setZoneSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: isActive } : s))
    );
  }, []);

  const handleDeleteZoneSubscription = useCallback(async (id: string) => {
    await deleteZoneSubscription(id);
    setZoneSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleStartCanvassing = useCallback(
    async (turf: Turf) => {
      if (!organizationId || !userId) return;

      try {
        await cacheTurfWithDoors(organizationId, turf.id);
        await updateTurfAssignmentStatus(organizationId, turf.id, userId, 'ACTIVE');

        setSelectedTurf(turf);
        setIsCanvassingMode(true);

        const currentLat = userLocation?.lat || turf.bbox?.minLat || 39.7392;
        const currentLng = userLocation?.lng || turf.bbox?.minLng || -104.9903;

        const nextDoor = await findNearestUnvisitedDoor(
          organizationId,
          turf.id,
          currentLat,
          currentLng
        );

        setCurrentCanvassingDoor(nextDoor);
      } catch (err) {
        console.error('Error starting canvassing:', err);
      }
    },
    [organizationId, userId, userLocation]
  );

  const handleOutcomeSelect = useCallback(
    async (outcome: CanvassOutcome, notes?: string, tags?: string[]) => {
      if (!organizationId || !userId || !currentCanvassingDoor || !selectedTurf) return;

      try {
        if (isActuallyOnline) {
          await createVisit(organizationId, userId, {
            doorId: currentCanvassingDoor.id,
            turfId: selectedTurf.id,
            outcome,
            notes,
            tags: tags || [],
            deviceLat: userLocation?.lat,
            deviceLng: userLocation?.lng,
          });
        } else {
          await createOfflineVisit(
            organizationId,
            userId,
            currentCanvassingDoor.id,
            selectedTurf.id,
            outcome,
            notes,
            tags || [],
            userLocation?.lat,
            userLocation?.lng
          );
        }

        const currentLat = userLocation?.lat || currentCanvassingDoor.lat;
        const currentLng = userLocation?.lng || currentCanvassingDoor.lng;

        const nextDoor = await findNearestUnvisitedDoor(
          organizationId,
          selectedTurf.id,
          currentLat,
          currentLng
        );

        setCurrentCanvassingDoor(nextDoor);

        const updatedDoors = await getDoorsInTurf(organizationId, selectedTurf.id);
        setDoors(updatedDoors);
      } catch (err) {
        console.error('Error recording visit:', err);
      }
    },
    [organizationId, userId, currentCanvassingDoor, selectedTurf, userLocation, isActuallyOnline]
  );

  const handleNextDoor = useCallback(async () => {
    if (!organizationId || !selectedTurf) return;

    const currentLat = userLocation?.lat || currentCanvassingDoor?.lat || 39.7392;
    const currentLng = userLocation?.lng || currentCanvassingDoor?.lng || -104.9903;

    const nextDoor = await findNearestUnvisitedDoor(
      organizationId,
      selectedTurf.id,
      currentLat,
      currentLng
    );

    setCurrentCanvassingDoor(nextDoor);
  }, [organizationId, selectedTurf, userLocation, currentCanvassingDoor]);

  const handleRevealContact = useCallback(
    async (door: Door) => {
      if (!organizationId || !userId) return;

      setIsRevealing(true);
      try {
        const result = await revealContact(organizationId, door.id, userId);

        if (!result.fromCache) {
          setCreditBalance((prev) => prev - result.creditsCharged);
        }

        setSelectedDoor((prev) =>
          prev?.id === door.id
            ? { ...prev, revealed_contact: result.reveal }
            : prev
        );
      } catch (err) {
        console.error('Error revealing contact:', err);
      } finally {
        setIsRevealing(false);
      }
    },
    [organizationId, userId]
  );

  const stormLayers: StormLayer[] = selectedEvent?.layers || [];
  const doorsRemaining = doors.filter((d) => d.visit_count === 0 && !d.is_do_not_knock).length;

  return (
    <div className="h-[calc(100vh-4rem)] flex relative">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg md:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div
        className={`absolute md:relative z-10 h-full w-80 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <StormEventSelector
              events={stormEvents}
              selectedEventId={selectedEvent?.id}
              onEventSelect={setSelectedEvent}
              isLoading={isLoading}
              liveAlerts={liveAlerts}
              liveAlertsLoading={liveAlertsLoading}
              onAlertSelect={handleAlertSelect}
              selectedAlertId={selectedAlertId}
              historicalObservations={historicalObservations}
              historicalLoading={historicalLoading}
            />

            {stormEvents.length === 0 && !isLoading && (
              <button
                onClick={handleImportMockEvents}
                disabled={isImporting}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Import Demo Events
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <TurfListPanel
                turfs={turfs.filter(
                  (t) => !selectedEvent || t.storm_event_id === selectedEvent.id
                )}
                selectedTurfId={selectedTurf?.id}
                onTurfSelect={handleTurfSelect}
                onStartCanvassing={handleStartCanvassing}
                isLoading={isLoading}
              />
            </div>

            <ZoneSubscriptionsPanel
              subscriptions={zoneSubscriptions}
              availableZones={availableZones}
              zonesLoading={zonesLoading}
              onCreateSubscription={handleCreateZoneSubscription}
              onToggleSubscription={handleToggleZoneSubscription}
              onDeleteSubscription={handleDeleteZoneSubscription}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <CanvassingMap
          stormLayers={stormLayers}
          turfs={turfs}
          doors={doors}
          selectedTurfId={selectedTurf?.id}
          selectedDoorId={selectedDoor?.id}
          userLocation={userLocation}
          showUserLocation={orgSettings?.allow_gps_tracking}
          repLocations={repLocations}
          currentUserId={userId}
          onTurfClick={handleTurfSelect}
          onDoorClick={handleDoorClick}
          layerVisibility={layerVisibility}
          stormLayerOpacity={stormOpacity}
          hailThreshold={hailThreshold}
          initialViewState={
            selectedEvent?.center_lat && selectedEvent?.center_lng
              ? {
                  latitude: selectedEvent.center_lat,
                  longitude: selectedEvent.center_lng,
                  zoom: 11,
                }
              : undefined
          }
          isDrawingMode={isDrawingMode}
          onDrawComplete={handleDrawComplete}
          liveAlerts={liveAlerts}
          onViewportChange={handleViewportChange}
        />

        <MapControls
          layerVisibility={layerVisibility}
          onLayerVisibilityChange={setLayerVisibility}
          stormLayerOpacity={stormOpacity}
          onStormLayerOpacityChange={setStormOpacity}
          hailThreshold={hailThreshold}
          onHailThresholdChange={setHailThreshold}
          showHailControls={stormLayers.some((l) => l.layer_type === 'HAIL')}
          repCount={repLocations.length}
          liveAlertCount={liveAlerts.length}
          hailForecast={hailForecast}
          hailForecastLoading={hailForecastLoading}
          isDrawingMode={isDrawingMode}
          onToggleDrawingMode={() => setIsDrawingMode((prev) => !prev)}
        />

        <StormAlertToastBanner toasts={toasts} onDismiss={dismissToast} />

        {pendingCount > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => sync()}
              disabled={!isActuallyOnline}
              className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${!isActuallyOnline ? '' : 'hover:animate-spin'}`} />
              {pendingCount} pending
            </button>
          </div>
        )}
      </div>

      {selectedDoor && !isCanvassingMode && (
        <DoorInfoDrawer
          door={selectedDoor}
          creditBalance={creditBalance}
          revealCost={orgSettings?.contact_reveal_cost || 1}
          onClose={() => setSelectedDoor(null)}
          onLogVisit={(door) => {
            if (selectedTurf) {
              setCurrentCanvassingDoor(door);
              setIsCanvassingMode(true);
            }
          }}
          onViewDetails={(door) => navigate(`/crm/contacts?address=${encodeURIComponent(door.address1)}`)}
          onRevealContact={handleRevealContact}
          onCreateLead={(door) => navigate(`/storm-canvassing/leads?door=${door.id}`)}
          isRevealing={isRevealing}
          activeAlerts={liveAlerts}
          hailForecast={hailForecast}
        />
      )}

      {isCanvassingMode && selectedTurf && (
        <CanvassingModePanel
          currentDoor={currentCanvassingDoor}
          turfName={selectedTurf.name}
          doorsRemaining={doorsRemaining}
          isOnline={isActuallyOnline}
          pendingSyncCount={pendingCount}
          pendingMediaCount={pendingMediaCount}
          onOutcomeSelect={handleOutcomeSelect}
          onNextDoor={handleNextDoor}
          onPhotoCapture={(file, doorId) => {
            if (organizationId && userId) {
              queueMediaCapture(organizationId, userId, file, doorId).catch(() => {});
            }
          }}
          onExitCanvassingMode={() => {
            setIsCanvassingMode(false);
            setCurrentCanvassingDoor(null);
          }}
        />
      )}

      {showCreateTurfModal && (
        <CreateTurfModal
          stormEvents={stormEvents}
          drawnGeometry={drawnGeometry}
          onConfirm={handleCreateTurfFromDrawing}
          onClose={() => {
            setShowCreateTurfModal(false);
            setDrawnGeometry(null);
          }}
        />
      )}
    </div>
  );
}
