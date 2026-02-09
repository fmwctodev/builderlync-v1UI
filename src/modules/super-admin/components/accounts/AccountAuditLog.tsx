import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getAuditLog } from '../../services/audit-service';
import { AuditEvent } from '../../types';

interface AccountAuditLogProps {
  accountId: string;
}

export const AccountAuditLog: React.FC<AccountAuditLogProps> = ({ accountId }) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        const allEvents = await getAuditLog({}, 100);
        const accountEvents = allEvents.filter(
          (event) => event.targetId === accountId || event.targetType === 'account'
        );
        setEvents(accountEvents.slice(0, 10));
      } catch (error) {
        console.error('Failed to load audit log:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLog();
  }, [accountId]);

  if (loading) {
    return (
      <Card title="Audit Log">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <Card title="Recent Activity" subtitle="Last 10 audit events">
      {events.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActionBadgeVariant(event.action)} size="sm">
                    {event.action}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{event.actorName}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {event.targetType}: {event.targetName || 'Unknown'}
                </p>
                {event.metadata?.details && (
                  <p className="text-xs text-gray-500 mt-1">{event.metadata.details}</p>
                )}
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
