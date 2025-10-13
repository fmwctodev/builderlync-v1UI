import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart, Calendar, CreditCard, FileText, HardHat, Home,
  MessageSquare, Users, Briefcase, DollarSign, Bot, Megaphone,
  Zap, Globe, FolderOpen, Star, BarChart2, Ruler, FileCheck,
  Package, Clipboard, LifeBuoy, Settings, ChevronLeft, ChevronRight,
  Camera
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const navItems = {
  manage: [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Conversations', icon: MessageSquare, path: '/conversations' },
    { name: 'Calendars', icon: Calendar, path: '/calendars' },
    { name: 'Contacts', icon: Users, path: '/contacts' },
    { name: 'Jobs', icon: HardHat, path: '/jobs' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
  ],
  tools: [
    { name: 'AI Agents', icon: Bot, path: '/ai-agents' },
    { name: 'Job Cam', icon: Camera, path: '/job-cam' },
    { name: 'Instant Estimator', icon: DollarSign, path: '/instant-estimator' },
    { name: 'Measurements', icon: Ruler, path: '/measurements' },
    { name: 'Proposals', icon: FileCheck, path: '/proposals' },
    { name: 'Material Orders', icon: Package, path: '/material-orders' },
    { name: 'Work Orders', icon: Clipboard, path: '/work-orders' },
  ],
  marketing: [
    { name: 'Automation', icon: Zap, path: '/automation' },
    { name: 'Opportunities', icon: BarChart, path: '/opportunities' },
    { name: 'Marketing', icon: Megaphone, path: '/marketing' },
    { name: 'File Manager', icon: FolderOpen, path: '/file-manager' },
    { name: 'Reputation', icon: Star, path: '/reputation' },
    { name: 'Reporting', icon: BarChart2, path: '/reporting' },
    { name: 'Sites', icon: Globe, path: '/sites' },
  ],
  system: [
    { name: 'Support', icon: LifeBuoy, path: '/support' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ]
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();

  const renderNavSection = (items: typeof navItems.manage, label?: string) => (
    <div className="mb-6">
      {!collapsed && label && (
        <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {label}
        </h3>
      )}
      <ul className="space-y-1">
        {items.map((item) => {

          const Icon = item.icon;

          return (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-r-2 border-primary-500'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <div>
                  <Icon size={collapsed ? 22 : 20} className={collapsed ? '' : 'mr-3'} />
                </div>
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="text-white bg-primary-600 h-8 w-8 flex items-center justify-center rounded-md mr-3">
              <Zap size={20} />
            </div>
            {!collapsed && (
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">BuilderLync</h1>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <nav>
            {renderNavSection(navItems.manage, 'Manage')}
            {renderNavSection(navItems.tools, 'Tools')}
            {renderNavSection(navItems.marketing, 'Marketing')}
            <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>
            {renderNavSection(navItems.system)}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div>
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;