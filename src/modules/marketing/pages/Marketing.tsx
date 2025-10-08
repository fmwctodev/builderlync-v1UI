import React from 'react';
import { Megaphone } from 'lucide-react';

export const Marketing: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing Campaigns</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Campaign Management</h3>
        <p className="text-gray-500 dark:text-gray-400">Create and manage your marketing campaigns</p>
      </div>
    </div>
  );
};