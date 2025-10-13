import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../../roof-runner/components/Layout/TopBar';
import Sidebar from '../../roof-runner/components/Layout/Sidebar';
import { AITopBar } from './AITopBar';

export function AIAgentsLayout() {

   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const toggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar toggleSidebar={toggleSidebar} />
        <AITopBar/>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}