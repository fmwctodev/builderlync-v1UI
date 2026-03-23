import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { getAccountModules } from '../../services/accounts-service';
import { AccountModule } from '../../types';
import { clsx } from 'clsx';

interface AccountModulesCardProps {
  accountId: string;
  onToggle: (moduleName: string, enabled: boolean) => Promise<void>;
}

const MODULE_LABELS: Record<string, string> = {
  Jobs: 'Job Management',
  Claims: 'Claims Processing',
  SierraAI: 'Sierra AI Assistant',
  Marketing: 'Marketing Suite',
  Sites: 'Website Builder',
  Reputation: 'Reputation Management',
  Reporting: 'Analytics & Reports',
  Integrations: 'Third-party Integrations',
  ABC: 'ABC Supply',
  SRS: 'SRS Distribution',
  Beacon: 'Beacon Building Products',
};

export const AccountModulesCard: React.FC<AccountModulesCardProps> = ({
  accountId,
  onToggle,
}) => {
  const [modules, setModules] = useState<AccountModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await getAccountModules(accountId);
        setModules(data);
      } catch (error) {
        console.error('Failed to load modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [accountId]);

  const handleToggle = async (moduleName: string, currentlyEnabled: boolean) => {
    setToggling(moduleName);
    try {
      await onToggle(moduleName, !currentlyEnabled);
      setModules(prev =>
        prev.map(m =>
          m.moduleName === moduleName ? { ...m, enabled: !currentlyEnabled } : m
        )
      );
    } catch (error) {
      console.error('Failed to toggle module:', error);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <Card title="Enabled Modules">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Enabled Modules" subtitle="Control which features this account can access">
      <div className="space-y-3">
        {modules.map((module) => (
          <div
            key={module.id}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {MODULE_LABELS[module.moduleName] || module.moduleName}
              </p>
              <p className="text-xs text-gray-500">{module.moduleName}</p>
            </div>
            <button
              onClick={() => handleToggle(module.moduleName, module.enabled)}
              disabled={toggling === module.moduleName}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                module.enabled ? 'bg-green-600' : 'bg-gray-300',
                toggling === module.moduleName && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  module.enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
