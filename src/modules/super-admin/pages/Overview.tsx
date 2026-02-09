import React, { useEffect, useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getAccounts } from '../services/accounts-service';
import { getRevenueMetrics } from '../services/billing-service';
import { getIntegrationHealth } from '../services/integrations-service';
import { getAuditLog } from '../services/audit-service';
import { EnterpriseAccount, IntegrationHealth, AuditEvent } from '../types';

export const Overview: React.FC = () => {
  const [accounts, setAccounts] = useState<EnterpriseAccount[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, metricsData, integrationsData, auditData] = await Promise.all([
          getAccounts(),
          getRevenueMetrics(),
          getIntegrationHealth(),
          getAuditLog({}, 10),
        ]);

        setAccounts(accountsData);
        setMetrics(metricsData);
        setIntegrations(integrationsData);
        setAuditEvents(auditData);
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeAccounts = accounts.filter(a => a.status === 'active').length;
  const trialAccounts = accounts.filter(a => a.status === 'trial').length;
  const atRiskAccounts = accounts.filter(a => a.status === 'past_due' || a.healthScore < 50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-1">Platform command center and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Active Accounts"
          value={activeAccounts}
          trend={5.2}
          trendDirection="up"
          icon={Building2}
        />
        <StatCard
          title="Trial Accounts"
          value={trialAccounts}
          icon={Clock}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={`$${metrics?.totalMRR?.toLocaleString() || '0'}`}
          trend={8.1}
          trendDirection="up"
          icon={DollarSign}
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={`$${metrics?.totalARR?.toLocaleString() || '0'}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Active Users (24h)"
          value={Math.floor(activeAccounts * 3.5)}
          trend={2.3}
          trendDirection="up"
          icon={Users}
        />
        <StatCard
          title="Accounts at Risk"
          value={atRiskAccounts.length}
          icon={AlertTriangle}
        />
      </div>

      {atRiskAccounts.length > 0 && (
        <Card title="Accounts at Risk" subtitle="Accounts requiring immediate attention">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Account</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">MRR</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Health Score</th>
                </tr>
              </thead>
              <tbody>
                {atRiskAccounts.slice(0, 10).map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{account.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant={account.plan === 'Enterprise' ? 'info' : 'neutral'} size="sm">
                        {account.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={account.status === 'past_due' ? 'error' : account.status === 'active' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {account.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">${account.mrr.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${
                              account.healthScore < 50 ? 'bg-red-600' : account.healthScore < 75 ? 'bg-yellow-500' : 'bg-green-600'
                            }`}
                            style={{ width: `${account.healthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{account.healthScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="System Status" subtitle="Integration health monitoring">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <div key={integration.provider} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{integration.provider}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  integration.status === 'healthy' ? 'bg-green-500' :
                  integration.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
              <p className="text-xs text-gray-500 capitalize">{integration.status}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent Admin Actions" subtitle="Last 10 audit events">
        <div className="space-y-3">
          {auditEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    event.action === 'create' ? 'success' :
                    event.action === 'update' ? 'info' :
                    event.action === 'delete' ? 'error' :
                    'neutral'
                  }
                  size="sm"
                >
                  {event.action}
                </Badge>
                <span className="text-sm text-gray-900">{event.actorName}</span>
                <span className="text-sm text-gray-500">{event.targetType}: {event.targetName}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
