import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useAutoLogout } from '../../../../shared/utils/autoLogout';
import { OrgProvider } from '../../../../shared/context/OrgContext';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useAutoLogout();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <OrgProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <Outlet />
          </main>
        </div>
      </div>
    </OrgProvider>
  );
};

export default Layout;