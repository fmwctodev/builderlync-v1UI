import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Search, Users, Home, MoreVertical, CreditCard as Edit, Trash2, UserPlus, Play } from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getTurfs, deleteTurf, generateDoorsInTurf, createTurf, updateTurf, assignUsersToTurf, unassignUserFromTurf } from '../services/turfsApi';
import { getStormEvents } from '../services/stormEventsApi';
import type { Turf, StormEvent, TurfStatus } from '../types';
import { CreateTurfModal } from '../components/panels/CreateTurfModal';
import { EditTurfModal } from '../components/panels/EditTurfModal';
import { AssignRepsModal } from '../components/panels/AssignRepsModal';

function getStatusBadge(status: TurfStatus) {
  const styles: Record<TurfStatus, { bg: string; text: string; label: string }> = {
    NOT_STARTED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: 'Not Started' },
    IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'In Progress' },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Completed' },
    ARCHIVED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-500', label: 'Archived' },
  };

  const style = styles[status];
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function TurfsPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const organizationId = currentOrganization?.id;

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [stormEvents, setStormEvents] = useState<StormEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TurfStatus | 'ALL'>('ALL');
  const [eventFilter, setEventFilter] = useState<string | 'ALL'>('ALL');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTurf, setEditTurf] = useState<Turf | null>(null);
  const [assignRepsTurf, setAssignRepsTurf] = useState<Turf | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [turfsData, eventsData] = await Promise.all([
          getTurfs(organizationId!),
          getStormEvents(organizationId!),
        ]);
        setTurfs(turfsData);
        setStormEvents(eventsData);
      } catch (err) {
        console.error('Error loading turfs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [organizationId]);

  const filteredTurfs = turfs.filter((turf) => {
    if (searchQuery && !turf.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'ALL' && turf.status !== statusFilter) {
      return false;
    }
    if (eventFilter !== 'ALL' && turf.storm_event_id !== eventFilter) {
      return false;
    }
    return true;
  });

  const handleDeleteTurf = async (turfId: string) => {
    if (!organizationId) return;
    if (!confirm('Are you sure you want to archive this turf?')) return;

    try {
      await deleteTurf(organizationId, turfId);
      setTurfs((prev) => prev.filter((t) => t.id !== turfId));
    } catch (err) {
      console.error('Error deleting turf:', err);
    }
    setMenuOpenId(null);
  };

  const handleCreateTurf = async (data: {
    name: string;
    description: string;
    stormEventId: string;
    color: string;
  }) => {
    if (!organizationId) return;
    const bbox: GeoJSON.MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [[[[-97.9, 30.1], [-97.5, 30.1], [-97.5, 30.5], [-97.9, 30.5], [-97.9, 30.1]]]],
    };
    await createTurf(organizationId, {
      name: data.name,
      description: data.description || undefined,
      geometry: bbox,
      stormEventId: data.stormEventId || undefined,
      color: data.color,
    });
    const updatedTurfs = await getTurfs(organizationId);
    setTurfs(updatedTurfs);
  };

  const handleEditTurf = async (turfId: string, updates: {
    name: string;
    description: string;
    status: TurfStatus;
    stormEventId: string;
    color: string;
  }) => {
    if (!organizationId) return;
    await updateTurf(organizationId, turfId, {
      name: updates.name,
      description: updates.description || undefined,
      status: updates.status,
      storm_event_id: updates.stormEventId || undefined,
      color: updates.color,
    });
    const updatedTurfs = await getTurfs(organizationId);
    setTurfs(updatedTurfs);
  };

  const handleAssignReps = async (turfId: string, userIds: string[]) => {
    if (!organizationId) return;
    await assignUsersToTurf(organizationId, turfId, userIds);
    const updatedTurfs = await getTurfs(organizationId);
    setTurfs(updatedTurfs);
  };

  const handleUnassignRep = async (turfId: string, userId: string) => {
    if (!organizationId) return;
    await unassignUserFromTurf(organizationId, turfId, userId);
    const updatedTurfs = await getTurfs(organizationId);
    setTurfs(updatedTurfs);
  };

  const handleGenerateDoors = async (turfId: string) => {
    if (!organizationId) return;

    try {
      const count = await generateDoorsInTurf(organizationId, turfId, 100);
      alert(`Generated ${count} doors in this turf`);

      const updatedTurfs = await getTurfs(organizationId);
      setTurfs(updatedTurfs);
    } catch (err) {
      console.error('Error generating doors:', err);
    }
    setMenuOpenId(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Turfs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage canvassing territories and assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Turf
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search turfs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TurfStatus | 'ALL')}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Events</option>
            {stormEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTurfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No turfs found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'ALL' || eventFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Create your first turf to get started'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Turf
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTurfs.map((turf) => {
            const completionPct =
              turf.total_doors > 0
                ? Math.round((turf.visited_doors / turf.total_doors) * 100)
                : 0;

            return (
              <div
                key={turf.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: turf.color }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{turf.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(turf.status)}
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === turf.id ? null : turf.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {menuOpenId === turf.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[160px]">
                            <button
                              onClick={() => {
                                navigate(`/storm-canvassing?turf=${turf.id}`);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Play className="w-4 h-4" />
                              Start Canvassing
                            </button>
                            <button
                              onClick={() => handleGenerateDoors(turf.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Home className="w-4 h-4" />
                              Generate Doors
                            </button>
                            <button
                              onClick={() => {
                                setAssignRepsTurf(turf);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <UserPlus className="w-4 h-4" />
                              Assign Reps
                            </button>
                            <button
                              onClick={() => {
                                setEditTurf(turf);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTurf(turf.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Archive
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {turf.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {turf.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    {turf.visited_doors}/{turf.total_doors} doors
                  </span>
                  {turf.assignments && turf.assignments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {turf.assignments.length}
                    </span>
                  )}
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {completionPct}% complete
                </p>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTurfModal
          stormEvents={stormEvents}
          onConfirm={handleCreateTurf}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editTurf && (
        <EditTurfModal
          turf={editTurf}
          stormEvents={stormEvents}
          onConfirm={handleEditTurf}
          onClose={() => setEditTurf(null)}
        />
      )}

      {assignRepsTurf && organizationId && (
        <AssignRepsModal
          turf={assignRepsTurf}
          organizationId={organizationId}
          onConfirm={handleAssignReps}
          onRemove={handleUnassignRep}
          onClose={() => setAssignRepsTurf(null)}
        />
      )}
    </div>
  );
}
