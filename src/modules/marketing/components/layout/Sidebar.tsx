import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../../types';
import { 
  LayoutDashboard,
  Megaphone,
  Award,
  Zap,
  Globe,
  BarChart,
  Settings,
  Star
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/marketing', icon: 'LayoutDashboard' },
    { name: 'Analytics', href: '/marketing/analytics', icon: 'BarChart' },
    { name: 'Campaigns', href: '/marketing/campaigns', icon: 'Megaphone' },
    { name: 'Ads Manager', href: '/marketing/ads-manager', icon: 'Zap' },
    { name: 'Social Planner', href: '/marketing/social-planner', icon: 'Globe' },
    { name: 'Reputation', href: '/marketing/reputation', icon: 'Star' },
    { name: 'Opportunities', href: '/marketing/opportunities', icon: 'Award' }
  ];

  const getIcon = (iconName: string, active: boolean = false) => {
    const props = { 
      size: 20, 
      className: active 
        ? 'text-primary-500 dark:text-primary-400' 
        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
    };

    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard {...props} />;
      case 'Megaphone': return <Megaphone {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Globe': return <Globe {...props} />;
      case 'BarChart': return <BarChart {...props} />;
      case 'Settings': return <Settings {...props} />;
      default: return <LayoutDashboard {...props} />;
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200">
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="bg-purple-600 text-white p-1.5 rounded">
            <Megaphone size={18} />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Marketing Hub
          </span>
        </div>
      </div>
      <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/marketing' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md group transition-colors ${
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-blue-700 dark:text-primary-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {getIcon(item.icon, isActive)}
              <span className="ml-3 text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 Marketing Hub
        </div>
      </div>
    </aside>
  );
};