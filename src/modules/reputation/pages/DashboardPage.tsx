import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, MessageSquareOff, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../services/reputationApi';
import { StarRating } from '../components/common/StarRating';
import type { DashboardStats } from '../types';

interface Props {
  orgId: string;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  color: string;
}> = ({ label, value, icon, sub, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-400', '-900/30')}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const DashboardPage: React.FC<Props> = ({ orgId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboardStats(orgId)
      .then(setStats)
      .catch((err) => setError(err?.message ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 gap-3 text-center px-6">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Could not load dashboard</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const maxBarCount = Math.max(...Object.values(stats.ratingDistribution), 1);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5">
        Last 30 Days
      </h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <StatCard
          label="Avg Rating"
          value={stats.avgRating || '—'}
          icon={<Star className="w-5 h-5 text-amber-600" />}
          sub="out of 5.0"
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews}
          icon={<MessageSquare className="w-5 h-5 text-primary-600" />}
          color="text-primary-600 dark:text-primary-400"
        />
        <StatCard
          label="Unreplied"
          value={stats.unrepliedCount}
          icon={<MessageSquareOff className="w-5 h-5 text-amber-600" />}
          sub={stats.totalReviews > 0 ? `${100 - stats.responseRate}% of total` : undefined}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          color="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Rating Distribution
          </h3>
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] ?? 0;
              const pct = Math.round((count / maxBarCount) * 100);
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-16 flex items-center gap-1">
                    <StarRating rating={star} max={1} size="sm" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{star}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Reviews Over Time
          </h3>
          {stats.reviewsOverTime.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
              No data for this period
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {stats.reviewsOverTime.slice(-30).map((entry) => {
                const maxCount = Math.max(...stats.reviewsOverTime.map((e) => e.count), 1);
                const pct = Math.round((entry.count / maxCount) * 100);
                return (
                  <div
                    key={entry.date}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${entry.date}: ${entry.count} review${entry.count !== 1 ? 's' : ''}`}
                  >
                    <div
                      className="w-full bg-primary-400 dark:bg-primary-500 rounded-t group-hover:bg-primary-500 dark:group-hover:bg-primary-400 transition-colors"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
