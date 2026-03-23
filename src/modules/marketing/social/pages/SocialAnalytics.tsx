import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, RefreshCw, BarChart2 } from 'lucide-react';
import type { SocialPost, SocialPostMetrics } from '../types';
import { getMetricsForOrg, aggregateMetrics, refreshAllMetrics } from '../services/socialMetrics';

interface SocialAnalyticsProps {
  orgId: string;
}

type PostWithMetrics = SocialPost & { metrics: SocialPostMetrics[] };

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  </div>
);

const SocialAnalytics: React.FC<SocialAnalyticsProps> = ({ orgId }) => {
  const [data, setData] = useState<PostWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const d = await getMetricsForOrg(orgId);
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllMetrics();
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const allMetrics = data.flatMap((p) => p.metrics);
  const agg = aggregateMetrics(allMetrics);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Performance metrics across all platforms</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-gray-300 dark:border-slate-600 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <MetricCard
                label="Impressions"
                value={fmt(agg.impressions)}
                icon={<Eye size={18} className="text-white" />}
                color="bg-primary-600/30"
              />
              <MetricCard
                label="Reach"
                value={fmt(agg.reach)}
                icon={<TrendingUp size={18} className="text-white" />}
                color="bg-blue-600/30"
              />
              <MetricCard
                label="Engagement"
                value={`${agg.engagementRate.toFixed(2)}%`}
                icon={<Heart size={18} className="text-white" />}
                color="bg-pink-600/30"
              />
              <MetricCard
                label="Shares"
                value={fmt(agg.shares)}
                icon={<Share2 size={18} className="text-white" />}
                color="bg-emerald-600/30"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Likes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{fmt(agg.likes)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Comments</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{fmt(agg.comments)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Saves</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{fmt(agg.saves)}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200">Top Posts</h3>
              </div>
              {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-slate-500">
                  <BarChart2 size={24} className="mb-2 opacity-50" />
                  <p className="text-sm">No posted content yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700/50">
                  {data.slice(0, 10).map((post) => {
                    const postAgg = aggregateMetrics(post.metrics);
                    return (
                      <div key={post.id} className="px-4 py-3 flex items-center gap-4">
                        <p className="flex-1 text-sm text-gray-700 dark:text-slate-300 truncate">{post.body ?? post.hook_text ?? 'Post'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Eye size={11} />
                            {fmt(postAgg.impressions)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={11} />
                            {fmt(postAgg.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={11} />
                            {fmt(postAgg.comments)}
                          </span>
                          <span className="text-primary-500 font-medium">{postAgg.engagementRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialAnalytics;
