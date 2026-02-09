import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3, RefreshCw } from 'lucide-react';
import { getRevenueMetrics, getPlanBreakdown, RevenueMetrics, PlanBreakdown } from '../../services/metrics-service';

export const MetricsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalMRR: 0,
    totalARR: 0,
    mrrGrowth: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    arpa: 0,
    lifetimeValue: 0,
  });
  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();

    const interval = setInterval(() => {
      loadMetrics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, planData] = await Promise.all([
        getRevenueMetrics(),
        getPlanBreakdown()
      ]);

      setMetrics(metricsData);
      setPlanBreakdown(planData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setError('Failed to load metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Metrics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 60 seconds
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalMRR)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">+{metrics.mrrGrowth}%</span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Annual Recurring Revenue</span>
            <BarChart3 className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalARR)}</div>
          <div className="text-sm text-gray-500 mt-2">
            {formatCurrency(metrics.totalMRR)} MRR × 12
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Subscriptions</span>
            <Users className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.activeSubscriptions}</div>
          <div className="text-sm text-gray-500 mt-2">
            ARPA: {formatCurrency(metrics.arpa)}/mo
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Average Revenue Per Account</span>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.arpa)}</div>
          <div className="text-sm text-gray-500 mt-2">Per month</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Churn Rate</span>
            <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.churnRate}%</div>
          <div className="text-sm text-gray-500 mt-2">Monthly</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Customer Lifetime Value</span>
            <BarChart3 className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(metrics.lifetimeValue)}
          </div>
          <div className="text-sm text-gray-500 mt-2">Estimated</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
        {planBreakdown.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No active subscriptions found</p>
            <p className="text-xs text-gray-500 mt-1">Revenue breakdown will appear when subscriptions are created</p>
          </div>
        ) : (
          <div className="space-y-4">
            {planBreakdown.map((plan) => (
              <div key={plan.planName}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{plan.planName}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({plan.subscriptionCount} subscription{plan.subscriptionCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(plan.mrr)}/mo
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${plan.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
