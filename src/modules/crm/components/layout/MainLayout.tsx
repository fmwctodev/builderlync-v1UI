import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function MainLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Determine current module based on route
  const getCurrentModule = () => {
    const path = location.pathname;
    if (path === '/crm' || path === '/crm/') return 'Dashboard';
    if (path.includes('/contacts')) return 'Contacts';
    if (path.includes('/calendar')) return 'Calendar';
    if (path.includes('/conversations')) return 'Conversations';
    if (path.includes('/jobs')) return 'Jobs';
    if (path.includes('/snippets')) return 'Snippets';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const handleCreateNew = () => {
    console.log(`Creating new item in ${getCurrentModule()}`);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - mobile (off-canvas) */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 transform lg:hidden
          transition duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>
      
      {/* Sidebar - desktop (fixed) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar 
          onCreateNew={handleCreateNew} 
          currentModule={getCurrentModule()}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}