import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { getUsageByAccount, getUsageLimits } from '../../services/usage-service';
import { UsageTracking, UsageLimits } from '../../types';
import { clsx } from 'clsx';

interface AccountUsageCardProps {
  accountId: string;
}

interface UsageMetric {
  label: string;
  used: number;
  limit: number;
  unit: string;
}

export const AccountUsageCard: React.FC<AccountUsageCardProps> = ({ accountId }) => {
  const [usage, setUsage] = useState<UsageTracking | null>(null);
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsageData = async () => {
      try {
        const [usageData, limitsData] = await Promise.all([
          getUsageByAccount(accountId, 1),
          getUsageLimits(accountId),
        ]);

        if (usageData.length > 0) {
          setUsage(usageData[0]);
        }
        setLimits(limitsData);
      } catch (error) {
        console.error('Failed to load usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsageData();
  }, [accountId]);

  if (loading) {
    return (
      <Card title="Current Usage">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (!usage || !limits) {
    return (
      <Card title="Current Usage">
        <p className="text-sm text-gray-500">No usage data available</p>
      </Card>
    );
  }

  const metrics: UsageMetric[] = [
    { label: 'SMS Messages', used: usage.smsCount, limit: limits.smsLimit, unit: 'messages' },
    { label: 'Call Minutes', used: usage.callMinutes, limit: limits.callLimit, unit: 'minutes' },
    { label: 'AI Minutes', used: usage.aiMinutes, limit: limits.aiLimit, unit: 'minutes' },
    { label: 'Emails Sent', used: usage.emailsSent, limit: limits.emailLimit, unit: 'emails' },
    { label: 'Storage Used', used: usage.storageGb, limit: limits.storageLimit, unit: 'GB' },
  ];

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  return (
    <Card
      title="Current Usage"
      subtitle={`Period: ${new Date(usage.period).toLocaleDateString()}`}
    >
      <div className="space-y-4">
        {metrics.map((metric) => {
          const percentage = (metric.used / metric.limit) * 100;
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className="text-sm text-gray-600">
                  {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={clsx('h-2 rounded-full transition-all', getUsageColor(percentage))}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% used</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
