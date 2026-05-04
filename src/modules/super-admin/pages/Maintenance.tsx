import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertCircle, CheckCircle, Database, Users, Building } from 'lucide-react';
import { cleanupOrphanedResources, scanForOrphanedResources, CleanupResult } from '../services/cleanup-service';

export const Maintenance: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [orphanedCounts, setOrphanedCounts] = useState({
    orphanedAuthUsersCount: 0,
    orphanedPlatformUsersCount: 0,
    failedAccountsCount: 0,
    incompleteOrganizationsCount: 0,
  });
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    scanForOrphans();
  }, []);

  const scanForOrphans = async () => {
    setScanning(true);
    try {
      const counts = await scanForOrphanedResources();
      setOrphanedCounts(counts);
    } catch (error) {
      console.error('Error scanning for orphans:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to clean up all orphaned resources? This action cannot be undone.')) {
      return;
    }

    setCleaning(true);
    setShowResult(false);
    try {
      const result = await cleanupOrphanedResources();
      setCleanupResult(result);
      setShowResult(true);

      // Refresh counts after cleanup
      await scanForOrphans();
    } catch (error) {
      console.error('Error during cleanup:', error);
      setCleanupResult({
        success: false,
        summary: {
          orphanedAuthUsers: 0,
          orphanedPlatformUsers: 0,
          failedAccounts: 0,
          incompleteOrganizations: 0,
          totalCleaned: 0,
        },
        details: [],
        errors: [`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      });
      setShowResult(true);
    } finally {
      setCleaning(false);
    }
  };

  const totalOrphans =
    orphanedCounts.orphanedAuthUsersCount +
    orphanedCounts.orphanedPlatformUsersCount +
    orphanedCounts.failedAccountsCount +
    orphanedCounts.incompleteOrganizationsCount;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Maintenance</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Clean up orphaned resources and failed provisioning attempts
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Orphaned Auth Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {orphanedCounts.orphanedAuthUsersCount}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Orphaned Platform Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {orphanedCounts.orphanedPlatformUsersCount}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {orphanedCounts.failedAccountsCount}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Building className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Incomplete Organizations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {orphanedCounts.incompleteOrganizationsCount}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Database className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>

        <div className="flex items-center gap-4">
          <button
            onClick={scanForOrphans}
            disabled={scanning || cleaning}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan for Orphans'}
          </button>

          <button
            onClick={handleCleanup}
            disabled={cleaning || scanning || totalOrphans === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            {cleaning ? 'Cleaning...' : `Clean Up ${totalOrphans > 0 ? `(${totalOrphans} items)` : ''}`}
          </button>
        </div>

        {totalOrphans === 0 && !scanning && (
          <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>No orphaned resources found! System is clean.</span>
          </div>
        )}
      </div>

      {/* Cleanup Result */}
      {showResult && cleanupResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            {cleanupResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {cleanupResult.success ? 'Cleanup Complete' : 'Cleanup Failed'}
            </h2>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Auth Users</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cleanupResult.summary.orphanedAuthUsers}
              </p>
            </div>
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform Users</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cleanupResult.summary.orphanedPlatformUsers}
              </p>
            </div>
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed Accounts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cleanupResult.summary.failedAccounts}
              </p>
            </div>
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Incomplete Orgs</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cleanupResult.summary.incompleteOrganizations}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Total Cleaned</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-300">
                {cleanupResult.summary.totalCleaned}
              </p>
            </div>
          </div>

          {/* Details */}
          {cleanupResult.details.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Details</h3>
              <div className="bg-paper dark:bg-canvas rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                  {cleanupResult.details.join('\n')}
                </pre>
              </div>
            </div>
          )}

          {/* Errors */}
          {cleanupResult.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Errors</h3>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <ul className="space-y-2">
                  {cleanupResult.errors.map((error, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">What does this cleanup?</h3>
        <ul className="space-y-2 text-red-800 dark:text-red-200">
          <li className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-400 mt-1">•</span>
            <span><strong>Orphaned Auth Users:</strong> Auth users with no platform_users or organization_members records</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-400 mt-1">•</span>
            <span><strong>Orphaned Platform Users:</strong> Platform users with no auth user or no enterprise account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-400 mt-1">•</span>
            <span><strong>Failed Accounts:</strong> Enterprise accounts stuck in "provisioning" or "failed" status for over 30 minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-400 mt-1">•</span>
            <span><strong>Incomplete Organizations:</strong> Organizations with no enterprise_account_id for over 1 hour</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
