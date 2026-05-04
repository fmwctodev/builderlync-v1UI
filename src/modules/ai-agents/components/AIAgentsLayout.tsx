import React from 'react';
import { Outlet } from 'react-router-dom';
import { AITopBar } from './AITopBar';

export function AIAgentsLayout() {
  return (
    <div className="flex flex-col h-full">
      <AITopBar />
      <div className="flex-1 overflow-y-auto pt-4">
        <Outlet />
      </div>
    </div>
  );
}