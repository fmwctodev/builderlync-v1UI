import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Users, Shield, Plug, Mail, Settings as SettingsIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface SuperAdminSettingsLayoutProps {
  children: React.ReactNode;
}

const settingsNavigation = [
  { name: 'Profile', icon: User, path: '/super-admin/settings/profile' },
  { name: 'Staff Management', icon: Users, path: '/super-admin/settings/staff' },
  { name: 'Roles & Permissions', icon: Shield, path: '/super-admin/settings/roles' },
  { name: 'Integrations', icon: Plug, path: '/super-admin/settings/integrations' },
  { name: 'Email Service', icon: Mail, path: '/super-admin/settings/email' },
];

export const SuperAdminSettingsLayout: React.FC<SuperAdminSettingsLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full flex bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2 text-red-600" />
            Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage system configuration</p>
        </div>
        <nav className="p-4 space-y-1">
          {settingsNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
