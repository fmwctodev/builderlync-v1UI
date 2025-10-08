import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  Settings as SettingsIcon,
  Camera,
  Calculator,
  Ruler,
  FileText,
  ShoppingBag,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/project-management' },
    { label: 'Job Cam', icon: <Camera size={20} />, path: '/project-management/job-cam' },
    { label: 'Instant Estimator', icon: <Calculator size={20} />, path: '/project-management/instant-estimator' },
    { label: 'Measurements', icon: <Ruler size={20} />, path: '/project-management/measurements' },
    { label: 'Material Orders', icon: <ShoppingBag size={20} />, path: '/project-management/material-orders' },
    { label: 'Proposals', icon: <FileText size={20} />, path: '/project-management/proposals' },
    { label: 'Settings', icon: <SettingsIcon size={20} />, path: '/project-management/settings' },
  ];
  
  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-8 w-8 bg-orange-600 text-white font-semibold rounded">
              PM
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Project Mgmt
            </span>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/project-management'}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-8 w-8 bg-orange-600 text-white font-semibold rounded">
              PM
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Project Mgmt
            </span>
          </div>
        </div>
        
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/project-management'}
              className={({ isActive }) => `
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;