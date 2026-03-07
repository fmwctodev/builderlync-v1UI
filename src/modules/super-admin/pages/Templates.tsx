import React, { useState } from 'react';
import { TemplatesGrid } from '../../roof-runner/components/proposals';

export const Templates: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage proposal templates from the admin panel.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <TemplatesGrid
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          templateRouteBase="/super-admin/templates"
        />
      </div>
    </div>
  );
};
