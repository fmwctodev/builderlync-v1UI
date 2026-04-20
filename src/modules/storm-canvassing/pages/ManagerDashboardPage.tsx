import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Home,
  Target,
  TrendingUp,
  MapPin,
  RefreshCw,
  Award,
  Activity,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import { supabase } from '../../../shared/lib/supabase';
import { getTurfs } from '../services/turfsApi';
import { getTeamLocationsWithStats } from '../services/repLocationsApi';
import { getOrCreateOrgSettings } from '../services/orgSettingsApi';
import type { Turf, TeamMemberLocation, ManagerKPIs, RepLeaderboardEntry, CanvassOrgSettings } from '../types';

function KPICard({
  label,
  value,
  sub,
  icon,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>{icon}</div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</div>
          {sub && <div className="text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export function ManagerDashboardPage() {
  const { currentOrganization } = useCurrentOrganization();
  const { user } = useSupabaseUser();
  const organizationId = currentOrganization?.id;

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [teamLocations, setTeamLocations] = useState<TeamMemberLocation[]>([]);
  const [leaderboard, setLeaderboard] = useState<RepLeaderboardEntry[]>([]);
  const [orgSettings, setOrgSettings] = useState<CanvassOrgSettings | null>(null);
  const [kpis, setKpis] = useState<ManagerKPIs>({
    total_doors: 0,
    total_visited: 0,
    completion_pct: 0,
    total_interested: 0,
    total_appointments: 0,
    active_reps: 0,
    turfs_in_progress: 0,
    turfs_completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    loadData();

    pollingRef.current = setInterval(() => {
      if (orgSettings?.allow_gps_tracking) {
        refreshLocations();
      }
    }, 60000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [organizationId, orgSettings?.allow_gps_tracking]);

  async function loadData() {
    if (!organizationId) return;
    setIsLoading(true);
    try {
      const [turfsData, settings] = await Promise.all([
        getTurfs(organizationId),
        getOrCreateOrgSettings(organizationId),
      ]);
      setTurfs(turfsData);
      setOrgSettings(settings);

      const totalDoors = turfsData.reduce((s, t) => s + t.total_doors, 0);
      const totalVisited = turfsData.reduce((s, t) => s + t.visited_doors, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: visitsToday } = await supabase
        .from('canvass_visits')
        .select('outcome, user_id')
        .eq('organization_id', organizationId)
        .gte('occurred_at', today.toISOString());

      const interestedCount = (visitsToday || []).filter(
        (v) => v.outcome === 'INTERESTED'
      ).length;
      const apptCount = (visitsToday || []).filter(
        (v) => v.outcome === 'APPOINTMENT_SET'
      ).length;
      const uniqueReps = new Set((visitsToday || []).map((v) => v.user_id)).size;

      setKpis({
        total_doors: totalDoors,
        total_visited: totalVisited,
        completion_pct: totalDoors > 0 ? Math.round((totalVisited / totalDoors) * 100) : 0,
        total_interested: interestedCount,
        total_appointments: apptCount,
        active_reps: uniqueReps,
        turfs_in_progress: turfsData.filter((t) => t.status === 'IN_PROGRESS').length,
        turfs_completed: turfsData.filter((t) => t.status === 'COMPLETED').length,
      });

      await loadLeaderboard(organizationId);

      if (settings.allow_gps_tracking) {
        await refreshLocations();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLeaderboard(orgId: string) {
    try {
      const { data } = await supabase.rpc('get_canvassing_leaderboard', {
        p_org_id: orgId,
      });

      if (data && data.length > 0) {
        const entries: RepLeaderboardEntry[] = data.map(
          (row: {
            user_id: string;
            total_visits: number;
            interested_count: number;
            appointment_set_count: number;
            doors_knocked: number;
            conversion_rate: number;
          }, i: number) => ({
            user_id: row.user_id,
            total_visits: row.total_visits,
            interested_count: row.interested_count,
            appointment_set_count: row.appointment_set_count,
            doors_knocked: row.doors_knocked,
            conversion_rate: row.conversion_rate,
            rank: i + 1,
          })
        );
        setLeaderboard(entries);
      }
    } catch {
      // silent - leaderboard may not have data yet
    }
  }

  async function refreshLocations() {
    if (!organizationId) return;
    try {
      const locs = await getTeamLocationsWithStats(organizationId);
      setTeamLocations(locs);
      setLastRefresh(new Date());
    } catch {
      // silent
    }
  }

  const activeTurfs = turfs.filter((t) => t.status !== 'ARCHIVED');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-600" />
            Manager Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Team performance and canvassing activity overview
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KPICard
              label="Total Doors"
              value={kpis.total_doors.toLocaleString()}
              sub={`${kpis.total_visited.toLocaleString()} visited`}
              icon={<Home className="w-4 h-4" />}
              color="blue"
            />
            <KPICard
              label="Completion"
              value={`${kpis.completion_pct}%`}
              sub={`${kpis.turfs_completed} turfs done`}
              icon={<CheckCircle className="w-4 h-4" />}
              color="green"
            />
            <KPICard
              label="Interested Today"
              value={kpis.total_interested}
              sub={`${kpis.total_appointments} appts`}
              icon={<Target className="w-4 h-4" />}
              color="orange"
            />
            <KPICard
              label="Active Reps Today"
              value={kpis.active_reps}
              sub={`${kpis.turfs_in_progress} turfs active`}
              icon={<Users className="w-4 h-4" />}
              color="gray"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Leaderboard (Last 30 Days)
                </h2>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                    No canvassing activity yet. Reps will appear here after logging visits.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((rep) => (
                      <div
                        key={rep.user_id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                            rep.rank === 1
                              ? 'bg-yellow-400 text-yellow-900'
                              : rep.rank === 2
                              ? 'bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-200'
                              : rep.rank === 3
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {rep.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {rep.full_name || rep.email || rep.user_id.slice(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {rep.doors_knocked} doors &middot; {rep.interested_count} interested &middot; {rep.appointment_set_count} appts
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {rep.total_visits}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">visits</div>
                        </div>
                        <div className="text-right shrink-0 w-16">
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {rep.conversion_rate}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">conv.</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  Turf Progress
                </h2>
                {activeTurfs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No active turfs. Create turfs to start tracking progress.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeTurfs.map((turf) => {
                      const pct =
                        turf.total_doors > 0
                          ? Math.round((turf.visited_doors / turf.total_doors) * 100)
                          : 0;
                      return (
                        <div key={turf.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: turf.color }}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {turf.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{turf.visited_doors}/{turf.total_doors} doors</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{pct}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: turf.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Active Reps
                  </h2>
                  {orgSettings?.allow_gps_tracking && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {!orgSettings?.allow_gps_tracking ? (
                  <div className="text-center py-6">
                    <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      GPS tracking is disabled.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Enable in Settings to see rep locations.
                    </p>
                  </div>
                ) : teamLocations.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No reps currently active
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamLocations.map((rep) => (
                      <div
                        key={rep.user_id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-semibold shrink-0">
                          {(rep.full_name || rep.email || '?')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {rep.full_name || rep.email}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {rep.today_visits} visits today
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  Today's Stats
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Turfs In Progress', value: kpis.turfs_in_progress, icon: <Clock className="w-4 h-4 text-primary-500" /> },
                    { label: 'Turfs Completed', value: kpis.turfs_completed, icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
                    { label: 'Appointments Set', value: kpis.total_appointments, icon: <Target className="w-4 h-4 text-orange-500" /> },
                    { label: 'Interested Contacts', value: kpis.total_interested, icon: <TrendingUp className="w-4 h-4 text-primary-500" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {stat.icon}
                        {stat.label}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
