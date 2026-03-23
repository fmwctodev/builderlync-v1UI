import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Award,
  Zap,
  BarChart,
  Star,
  FileText
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/marketing', icon: LayoutDashboard, badge: undefined as string | undefined },
    { name: 'Sierra Marketing AI', href: '/marketing/sierra', icon: Zap, badge: 'AI' as string | undefined },
    { name: 'Forms', href: '/marketing/forms', icon: FileText, badge: undefined as string | undefined },
    { name: 'Reputation', href: '/marketing/reputation', icon: Star, badge: undefined as string | undefined },
    { name: 'Opportunities', href: '/marketing/opportunities', icon: Award, badge: undefined as string | undefined },
    { name: 'Reports', href: '/marketing/reports', icon: BarChart, badge: undefined as string | undefined },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200">
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 text-white p-1.5 rounded">
            <Megaphone size={18} />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Marketing Hub
          </span>
        </div>
      </div>
      <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/marketing' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md group transition-colors ${
                isActive
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon
                size={20}
                className={isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}
              />
              <span className="ml-3 text-sm font-medium flex-1">{item.name}</span>
              {item.badge && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Sierra Marketing AI
        </div>
      </div>
    </aside>
  );
};
