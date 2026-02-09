import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getAccountIntegrations } from '../../services/accounts-service';
import { IntegrationConnection } from '../../types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AccountIntegrationsCardProps {
  accountId: string;
}

export const AccountIntegrationsCard: React.FC<AccountIntegrationsCardProps> = ({
  accountId,
}) => {
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const data = await getAccountIntegrations(accountId);
        setIntegrations(data);
      } catch (error) {
        console.error('Failed to load integrations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [accountId]);

  if (loading) {
    return (
      <Card title="Integrations">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  const getStatusIcon = (status: IntegrationConnection['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: IntegrationConnection['status']) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <Card title="Integrations" subtitle="Third-party service connections">
      {integrations.length === 0 ? (
        <p className="text-sm text-gray-500">No integrations configured</p>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(integration.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{integration.provider}</p>
                  {integration.connected && integration.lastSyncAt && (
                    <p className="text-xs text-gray-500">
                      Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                  {integration.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">{integration.errorMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <Badge variant={getStatusBadgeVariant(integration.status)} size="sm">
                    {integration.status}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Not Connected
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
