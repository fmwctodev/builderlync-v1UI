import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, MessageCircle, PhoneCall, Brain, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase-client';
import { UsageWithAccount, EffectiveUsageRow, UsageLimits } from '../types/usage';
import { Plan } from '../types/billing';
import {
  calculateEffectiveLimits,
  getCurrentMonth,
  formatMonthLabel,
  getUsageStatus,
  hasAnyAlert,
  METRIC_CONFIG,
  formatUsageValue,
  getUsagePercent,
  getProgressBarColor,
  formatLimit,
} from '../utils/usage-utils';
import { clsx } from 'clsx';

export const Usage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<EffectiveUsageRow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, usageRes, limitsRes] = await Promise.all([
        supabase.from('plans').select('*'),
        supabase
          .from('usage_tracking')
          .select(`
            *,
            enterprise_accounts!inner (id, name, status, plan)
          `)
          .eq('period', selectedMonth),
        supabase.from('usage_limits').select('*'),
      ]);

      if (plansRes.error) throw plansRes.error;
      if (usageRes.error) throw usageRes.error;

      const plansData = plansRes.data || [];
      setPlans(plansData);

      const usage = usageRes.data || [];
      const limits = limitsRes.data || [];

      const limitsMap = new Map(limits.map((l) => [l.account_id, l]));

      const rows: EffectiveUsageRow[] = usage.map((u: any) => {
        const account = u.enterprise_accounts;
        const accountLimits = limitsMap.get(u.account_id);
        const plan = plansData.find((p) => p.code === account.plan || p.name === account.plan);

        const planLimits: UsageLimits = plan?.limits || {};
        const overrideLimits: UsageLimits = accountLimits
          ? {
              sms: accountLimits.sms_limit,
              call_minutes: accountLimits.call_limit,
              ai_minutes: accountLimits.ai_limit,
              emails_sent: accountLimits.email_limit,
              storage_gb: parseFloat(accountLimits.storage_limit),
            }
          : {};

        const effectiveLimits = calculateEffectiveLimits(planLimits, overrideLimits);

        const usage: UsageLimits = {
          sms: u.sms_count,
          mms: u.mms_count,
          call_minutes: u.call_minutes,
          ai_minutes: u.ai_minutes,
          emails_sent: u.emails_sent,
          storage_gb: parseFloat(u.storage_gb),
          contacts: u.contacts || 0,
          jobs_created: u.jobs_created || 0,
        };

        return {
          accountId: account.id,
          accountName: account.name,
          accountStatus: account.status,
          planName: plan?.name || account.plan,
          month: u.period,
          usage,
          planLimits,
          overrideLimits: Object.keys(overrideLimits).length > 0 ? overrideLimits : null,
          effectiveLimits,
        };
      });

      setUsageData(rows);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = usageData.filter((row) => {
    if (searchQuery && !row.accountName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'over' && !hasAnyAlert(row.usage, row.effectiveLimits)) {
        return false;
      }
      if (statusFilter === row.accountStatus) {
        return true;
      }
      if (statusFilter !== 'over' && statusFilter !== row.accountStatus) {
        return false;
      }
    }
    return true;
  });

  const totalSMS = filteredData.reduce((sum, row) => sum + (row.usage.sms || 0), 0);
  const totalCalls = filteredData.reduce((sum, row) => sum + (row.usage.call_minutes || 0), 0);
  const totalAI = filteredData.reduce((sum, row) => sum + (row.usage.ai_minutes || 0), 0);
  const accountsOverLimit = filteredData.filter((row) =>
    Object.keys(row.usage).some((k) => {
      const key = k as keyof UsageLimits;
      const used = row.usage[key] || 0;
      const limit = row.effectiveLimits[key];
      return limit !== undefined && used >= limit;
    })
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usage & Limits</h1>
            <p className="text-gray-600 mt-1">
              Track consumption across accounts and enforce fair use policies
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total SMS Sent</p>
              <p className="text-2xl font-bold text-gray-900">{totalSMS.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <PhoneCall className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Call Minutes</p>
              <p className="text-2xl font-bold text-gray-900">{totalCalls.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Brain className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Minutes</p>
              <p className="text-2xl font-bold text-gray-900">{totalAI.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Over Limit</p>
              <p className="text-2xl font-bold text-red-600">{accountsOverLimit}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth.slice(0, 7)}
              onChange={(e) => setSelectedMonth(`${e.target.value}-01`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Account</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Accounts</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="over">Over Limit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Minutes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No usage data found for {formatMonthLabel(selectedMonth)}
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const smsStatus = getUsageStatus(row.usage.sms || 0, row.effectiveLimits.sms);
                  const callStatus = getUsageStatus(row.usage.call_minutes || 0, row.effectiveLimits.call_minutes);
                  const aiStatus = getUsageStatus(row.usage.ai_minutes || 0, row.effectiveLimits.ai_minutes);
                  const storageStatus = getUsageStatus(row.usage.storage_gb || 0, row.effectiveLimits.storage_gb);

                  return (
                    <tr key={row.accountId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{row.accountName}</div>
                          <div className="text-sm text-gray-500 capitalize">{row.accountStatus}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.planName}</td>
                      <td className="px-6 py-4">
                        <UsageCell
                          used={row.usage.sms || 0}
                          limit={row.effectiveLimits.sms}
                          status={smsStatus}
                          metric="sms"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <UsageCell
                          used={row.usage.call_minutes || 0}
                          limit={row.effectiveLimits.call_minutes}
                          status={callStatus}
                          metric="call_minutes"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <UsageCell
                          used={row.usage.ai_minutes || 0}
                          limit={row.effectiveLimits.ai_minutes}
                          status={aiStatus}
                          metric="ai_minutes"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <UsageCell
                          used={row.usage.storage_gb || 0}
                          limit={row.effectiveLimits.storage_gb}
                          status={storageStatus}
                          metric="storage_gb"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface UsageCellProps {
  used: number;
  limit: number | undefined;
  status: 'normal' | 'approaching' | 'over';
  metric: keyof UsageLimits;
}

const UsageCell: React.FC<UsageCellProps> = ({ used, limit, status, metric }) => {
  const percent = getUsagePercent(used, limit);
  const colorClass = getProgressBarColor(status);

  return (
    <div className="min-w-[120px]">
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-sm font-medium text-gray-900">{formatUsageValue(used, metric)}</span>
        <span className="text-xs text-gray-500">/ {formatLimit(limit)}</span>
      </div>
      {limit !== undefined && limit > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={clsx('h-full transition-all', colorClass)}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <span className={clsx('text-xs font-medium', status === 'over' ? 'text-red-600' : 'text-gray-600')}>
            {percent}%
          </span>
        </div>
      )}
    </div>
  );
};
