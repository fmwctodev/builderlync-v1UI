import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    { name: 'Dashboard', icon: Home, path: '/roof-runner' },
    { name: 'Conversations', icon: MessageSquare, path: '/roof-runner/conversations' },
    { name: 'Calendars', icon: Calendar, path: '/roof-runner/calendars' },
    { name: 'Contacts', icon: Users, path: '/roof-runner/contacts' },
    { name: 'Jobs', icon: HardHat, path: '/roof-runner/jobs' },
    { name: 'Payments', icon: CreditCard, path: '/roof-runner/payments' },
  ],
  tools: [
    { name: 'AI Agents', icon: Bot, path: '/roof-runner/ai-agents' },
    { name: 'Job Cam', icon: Camera, path: '/roof-runner/job-cam' },
    { name: 'Instant Estimator', icon: DollarSign, path: '/roof-runner/instant-estimator' },
    { name: 'Measurements', icon: Ruler, path: '/roof-runner/measurements' },
    { name: 'Proposals', icon: FileCheck, path: '/roof-runner/proposals' },
    { name: 'Material Orders', icon: Package, path: '/roof-runner/material-orders' },
    { name: 'Work Orders', icon: Clipboard, path: '/roof-runner/work-orders' },
  ],
  marketing: [
    { name: 'Automation', icon: Zap, path: '/roof-runner/automation' },
    { name: 'Opportunities', icon: BarChart, path: '/roof-runner/opportunities' },
    { name: 'Marketing', icon: Megaphone, path: '/roof-runner/marketing' },
    { name: 'File Manager', icon: FolderOpen, path: '/roof-runner/file-manager' },
    { name: 'Reputation', icon: Star, path: '/roof-runner/reputation' },
    { name: 'Reporting', icon: BarChart2, path: '/roof-runner/reporting' },
    { name: 'Sites', icon: Globe, path: '/roof-runner/sites' },
  ],
  system: [
    { name: 'Support', icon: LifeBuoy, path: '/roof-runner/support' },
    { name: 'Settings', icon: Settings, path: '/roof-runner/settings' },
  ]
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  
  const renderNavSection = (items: typeof navItems.manage, label?: string) => (
    <div className="mb-6">
      {!collapsed && label && (
        <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </h3>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={collapsed ? 22 : 20} className={collapsed ? '' : 'mr-3'} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
  
  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <div className="text-white bg-red-500 h-8 w-8 flex items-center justify-center rounded-md mr-3">
              <Zap size={20} />
            </div>
            {!collapsed && (
              <h1 className="font-bold text-lg text-gray-900">Roof Runner</h1>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav>
            {renderNavSection(navItems.manage, 'Manage')}
            {renderNavSection(navItems.tools, 'Tools')}
            {renderNavSection(navItems.marketing, 'Marketing')}
            <div className="border-t border-gray-200 my-4"></div>
            {renderNavSection(navItems.system)}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;