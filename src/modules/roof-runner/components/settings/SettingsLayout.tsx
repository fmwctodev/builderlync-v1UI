import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building, Users, Calendar, Mail, CreditCard,
  Zap, Database, Shield, FileText, Palette, Settings as SettingsIcon
} from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'business-info', label: 'Business Info', icon: Building, path: 'business-info' },
    { id: 'profile', label: 'Profile', icon: Users, path: 'profile' },
    { id: 'billing', label: 'Billing', icon: CreditCard, path: 'billing' },
    { id: 'staff', label: 'Staff Management', icon: Users, path: 'staff' },
    { id: 'communications', label: 'Communications', icon: Mail, path: 'communications' },
    { id: 'integrations', label: 'Integrations', icon: Zap, path: 'integrations' },
    { id: 'custom-fields', label: 'Custom Fields', icon: Database, path: 'custom-fields' },
    { id: 'permissions', label: 'Permissions', icon: Shield, path: 'permissions' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText, path: 'audit-logs' },
    { id: 'brand-board', label: 'Brand Board', icon: Palette, path: 'brand-board' },
    { id: 'email-service', label: 'Email Service', icon: Mail, path: 'email-service' },
  ];

  const currentPath = location.pathname;
  const currentSettingsPath = currentPath.split('/settings/')[1] || '';

  // Extract org slug and build base settings path
  const orgSlugMatch = currentPath.match(/\/org\/([^/]+)\//);
  const orgSlug = orgSlugMatch ? orgSlugMatch[1] : '';
  const baseSettingsPath = `/org/${orgSlug}/settings`;

  return (
    <div className="h-full flex bg-paper dark:bg-canvas">
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Settings
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSettingsPath === tab.path || currentSettingsPath.startsWith(tab.path + '/');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`${baseSettingsPath}/${tab.path}`)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;