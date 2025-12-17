import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AuditLogsProps {
  userRole?: string;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ userRole = 'Owner' }) => {
  const canViewLogs = userRole === 'Owner' || userRole === 'Admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Audit Logs</h2>
        <p className="text-gray-600 dark:text-gray-400">Track system activities and errors</p>
      </div>

      {!canViewLogs && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-yellow-800 dark:text-yellow-200">Only owners and admins can view audit logs.</p>
          </div>
        </div>
      )}

      {canViewLogs && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">2024-01-15 14:30:22</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">john@builderlync.com</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Contact Created</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Contact #1247</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200">
                      Success
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">2024-01-15 14:25:15</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">sarah@builderlync.com</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Data Export</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Contacts</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs dark:bg-red-900 dark:text-red-200">
                      Failed - Insufficient Permissions
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;