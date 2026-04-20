import { useMemo } from 'react';
import { Marker } from 'react-map-gl';
import type { TeamMemberLocation } from '../../types';

export interface RepLocationsLayerProps {
  repLocations: TeamMemberLocation[];
  currentUserId?: string;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : '?';
}

function isStale(updatedAt: string): boolean {
  const staleMs = 5 * 60 * 1000;
  return Date.now() - new Date(updatedAt).getTime() > staleMs;
}

export function RepLocationsLayer({ repLocations, currentUserId }: RepLocationsLayerProps) {
  const visibleReps = useMemo(
    () => repLocations.filter((r) => r.user_id !== currentUserId),
    [repLocations, currentUserId]
  );

  if (visibleReps.length === 0) return null;

  return (
    <>
      {visibleReps.map((rep) => {
        const stale = isStale(rep.updated_at);
        const initials = getInitials(rep.full_name, rep.email);

        return (
          <Marker
            key={rep.user_id}
            longitude={rep.lng}
            latitude={rep.lat}
            anchor="center"
          >
            <div className="relative group cursor-default">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 transition-opacity ${
                  stale
                    ? 'bg-gray-400 border-gray-300 opacity-50'
                    : 'bg-primary-600 border-white'
                }`}
                title={`${rep.full_name || rep.email} — ${rep.today_visits} visits today`}
              >
                {initials}
              </div>

              {!stale && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              )}

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                  <div className="font-semibold">{rep.full_name || rep.email}</div>
                  <div className="text-gray-300">{rep.today_visits} visits today</div>
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
}
