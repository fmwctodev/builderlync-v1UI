import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useAutoLogout } from '../../../../shared/utils/autoLogout';
import { OrgProvider } from '../../../../shared/context/OrgContext';

/**
 * App layout — wraps every authenticated page with the topbar + sidebar shell.
 *
 * As of the Studio reskin pass, sets `body[data-studio="on"]` so the global
 * Studio CSS (paper/canvas/ink/edge tokens, refreshed `.card`/`.btn`/`.input`
 * styles, premium type scale) applies app-wide. Legacy classNames like
 * `bg-gray-50` / `bg-white` / `text-gray-700` are remapped to Studio tokens
 * inside src/index.css, so every page picks up the new palette without
 * needing per-page edits.
 */
const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useAutoLogout();

  // Activate Studio body styles for the lifetime of the authenticated shell.
  useEffect(() => {
    document.body.setAttribute('data-studio', 'on');
    return () => {
      document.body.removeAttribute('data-studio');
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <OrgProvider>
      <div className="flex h-screen w-full overflow-hidden bg-paper dark:bg-canvas">
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-paper dark:bg-canvas p-6 scrollbar-studio">
            <Outlet />
          </main>
        </div>
      </div>
    </OrgProvider>
  );
};

export default Layout;