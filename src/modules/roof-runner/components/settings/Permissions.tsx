import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface PermissionsProps {
  userRole?: string;
}

const Permissions: React.FC<PermissionsProps> = ({ userRole = 'Owner' }) => {
  const canManagePermissions = userRole === 'Owner';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Roles & Permissions</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage user roles and access levels</p>
      </div>

      {!canManagePermissions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only account owners can manage permissions.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Owner</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Full system access</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Export data</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage billing</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage staff</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />View audit logs</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage contacts</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage jobs</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Manage staff</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Export data</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Manage billing</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />View contacts</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Create jobs</li>
            <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Send messages</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Manage staff</li>
            <li className="flex items-center"><X className="w-4 h-4 text-red-500 mr-2" />Export data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Permissions;