import { useState } from 'react';
import { MapPin, Users, Home, Search, Plus, MoreVertical, Play, Check, Archive } from 'lucide-react';
import type { Turf, TurfStatus } from '../../types';

export interface TurfListPanelProps {
  turfs: Turf[];
  selectedTurfId?: string | null;
  onTurfSelect: (turf: Turf) => void;
  onCreateTurf?: () => void;
  onStartCanvassing?: (turf: Turf) => void;
  showOnlyMyTurfs?: boolean;
  onToggleMyTurfs?: (showOnly: boolean) => void;
  isLoading?: boolean;
}

function getStatusBadge(status: TurfStatus) {
  const styles: Record<TurfStatus, { bg: string; text: string; label: string }> = {
    NOT_STARTED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: 'Not Started' },
    IN_PROGRESS: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400', label: 'In Progress' },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Completed' },
    ARCHIVED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-500', label: 'Archived' },
  };

  const style = styles[status];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function TurfListPanel({
  turfs,
  selectedTurfId,
  onTurfSelect,
  onCreateTurf,
  onStartCanvassing,
  showOnlyMyTurfs = false,
  onToggleMyTurfs,
  isLoading,
}: TurfListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredTurfs = turfs.filter((turf) =>
    turf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Turfs</h2>
          {onCreateTurf && (
            <button
              onClick={onCreateTurf}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search turfs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {onToggleMyTurfs && (
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyMyTurfs}
              onChange={(e) => onToggleMyTurfs(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Show only my turfs</span>
          </label>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTurfs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No turfs match your search' : 'No turfs created yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTurfs.map((turf) => {
              const completionPct =
                turf.total_doors > 0
                  ? Math.round((turf.visited_doors / turf.total_doors) * 100)
                  : 0;

              return (
                <div
                  key={turf.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTurfId === turf.id
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => onTurfSelect(turf)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: turf.color }}
                      />
                      <h3 className="font-medium text-gray-900 dark:text-white">{turf.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(turf.status)}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === turf.id ? null : turf.id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {menuOpenId === turf.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                              }}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[140px]">
                              {onStartCanvassing && turf.status !== 'COMPLETED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartCanvassing(turf);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Play className="w-4 h-4" />
                                  Start Canvassing
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Check className="w-4 h-4" />
                                Mark Complete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {turf.visited_doors}/{turf.total_doors} doors
                    </span>
                    {turf.assignments && turf.assignments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {turf.assignments.length} assigned
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {completionPct}% complete
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
