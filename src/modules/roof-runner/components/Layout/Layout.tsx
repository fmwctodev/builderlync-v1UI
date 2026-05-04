import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useAutoLogout } from '../../../../shared/utils/autoLogout';
import { SierraAssistantProvider } from '../../../../shared/context/SierraAssistantContext';
import { SierraAssistantFAB } from '../../../../shared/components/sierra-assistant/SierraAssistantFAB';
import { SierraAssistantPanel } from '../../../../shared/components/sierra-assistant/SierraAssistantPanel';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useAutoLogout();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SierraAssistantProvider>
      <div className="flex h-screen w-full overflow-hidden bg-paper dark:bg-canvas">
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-paper dark:bg-canvas p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <Outlet />
          </main>
        </div>
        <SierraAssistantFAB />
        <SierraAssistantPanel />
      </div>
    </SierraAssistantProvider>
  );
};

export default Layout;