import React from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminAuthGuard } from './SuperAdminAuthGuard';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminTopBar } from './SuperAdminTopBar';

export const SuperAdminLayout: React.FC = () => {
  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <SuperAdminSidebar />
        <SuperAdminTopBar />
        <main className="ml-64 pt-16">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SuperAdminAuthGuard>
  );
};
