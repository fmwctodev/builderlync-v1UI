import React from 'react';
import { Outlet } from 'react-router-dom';
import { KnowledgeBaseSidebar } from './KnowledgeBaseSidebar';
import { KnowledgeBaseTopBar } from './KnowledgeBaseTopBar';

/**
 * KB shell — sidebar + topbar + scroll body. Replaces the loose KB pages
 * pattern with a real "knowledge base site" feel (think help.gohighlevel.com).
 */
export const KnowledgeBaseLayout: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <KnowledgeBaseTopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (hidden on small screens; main content takes full width) */}
        <div className="hidden lg:block">
          <KnowledgeBaseSidebar />
        </div>

        {/* Body */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
