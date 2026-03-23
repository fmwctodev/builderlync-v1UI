import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, RefreshCw, Download } from 'lucide-react';

import { CanvassingMap, MapControls, LayerVisibility } from '../components/map';
import { StormEventSelector, TurfListPanel, DoorInfoDrawer, CanvassingModePanel } from '../components/panels';

import { useOfflineSync } from '../offline/hooks/useOfflineSync';
import { cacheTurfWithDoors, createOfflineVisit, queueMediaCapture } from '../offline/syncService';
import { findNearestUnvisitedDoor, getDoorsInTurf } from '../services/doorsApi';
import { getStormEvents, importStormEventsFromProvider } from '../services/stormEventsApi';
import { getTurfs, getMyTurfs, updateTurfAssignmentStatus } from '../services/turfsApi';
import { createVisit } from '../services/visitsApi';
import { revealContact, getCreditBalance } from '../services/contactRevealApi';
import { getOrCreateOrgSettings } from '../services/orgSettingsApi';
import { getTeamLocationsWithStats, updateRepLocation, deactivateRepLocation } from '../services/repLocationsApi';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import type { StormEvent, StormLayer, Turf, Door, CanvassOutcome, CanvassOrgSettings, TeamMemberLocation } from '../types';

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
  });
  const [stormOpacity, setStormOpacity] = useState(0.5);
  const [hailThreshold, setHailThreshold] = useState(0);

  const { isOnline, isActuallyOnline, pendingCount, pendingMediaCount, sync } = useOfflineSync(
    organizationId || null,
    userId || null
  );

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

    const fetchRepLocations = async () => {
      try {
        const locs = await getTeamLocationsWithStats(organizationId);
        setRepLocations(locs);
      } catch {
      }
    };

    fetchRepLocations();
    const interval = setInterval(fetchRepLocations, 60000);
    return () => clearInterval(interval);
  }, [organizationId, orgSettings?.allow_gps_tracking]);

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
            />

            {stormEvents.length === 0 && !isLoading && (
              <button
                onClick={handleImportMockEvents}
                disabled={isImporting}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
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

          <div className="flex-1 overflow-hidden">
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
        />

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
    </div>
  );
}
