import React, { useState, useEffect } from 'react';
import {
  Database, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Play, Copy, FileText, Loader, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  checkDatabaseStatus,
  createStaffTableQuickFix,
  runAllMigrations,
  getStaffTableSQL,
  getCompleteMigrationSQL,
  type TableStatus,
  type MigrationStatus,
} from '../../../shared/services/databaseMigrationService';

const DatabaseMigrations: React.FC = () => {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [expandedSQL, setExpandedSQL] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'modules' | 'tables'>('modules');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const dbStatus = await checkDatabaseStatus();
      setStatus(dbStatus);

      if (dbStatus.missingTables.length > 0) {
        setMessage({
          type: 'info',
          text: `Found ${dbStatus.missingTables.length} missing table(s). Click "Quick Fix" or "Run All Migrations" to create them.`,
        });
      } else {
        setMessage({
          type: 'success',
          text: 'All required tables exist in your database!',
        });
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to check database status',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFix = async () => {
    setExpandedSQL(true);
    copySQL();
    setMessage({
      type: 'info',
      text: 'SQL copied to clipboard! Now: 1) Go to your Supabase Dashboard 2) Open SQL Editor 3) Paste and run the SQL 4) Come back and click "Refresh Status"',
    });
  };

  const handleRunAllMigrations = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

    window.open(sqlEditorUrl, '_blank');

    setMessage({
      type: 'info',
      text: 'Opening Supabase SQL Editor in a new tab. Copy the SQL code below, paste it in the editor, and click "Run". Then return here and click "Refresh Status".',
    });
  };

  const copySQL = () => {
    const sql = getStaffTableSQL();
    navigator.clipboard.writeText(sql);
    setMessage({
      type: 'success',
      text: 'SQL copied to clipboard! Paste it in Supabase SQL Editor.',
    });
  };

  const copyCompleteMigrationSQL = () => {
    if (!status) return;
    const sql = getCompleteMigrationSQL(status.missingTables);
    navigator.clipboard.writeText(sql);
    setMessage({
      type: 'success',
      text: `SQL for ${status.missingTables.length} missing table(s) copied to clipboard!`,
    });
  };

  const getStatusIcon = (table: TableStatus) => {
    if (table.exists) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (table: TableStatus) => {
    if (table.exists) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Exists
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        Missing
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking database status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
          <Database className="w-6 h-6 mr-2" />
          Database Migrations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your database schema and run migrations to set up required tables.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}
        >
          <div className="flex items-start">
            {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
            {message.type === 'error' && <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
            {message.type === 'info' && <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
            <p className="flex-1">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>

          <div className="space-y-3">
            <button
              onClick={handleQuickFix}
              disabled={status?.tables.find(t => t.name === 'staff')?.exists === true}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              {status?.tables.find(t => t.name === 'staff')?.exists ? 'Staff Table Exists' : 'Copy SQL for Staff Table'}
            </button>

            <button
              onClick={handleRunAllMigrations}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              Open Supabase SQL Editor
            </button>

            <button
              onClick={loadStatus}
              disabled={running}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setExpandedSQL(!expandedSQL)}
              className="w-full flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {status && status.missingTables.length > 0 ? 'View Complete Migration SQL' : 'View Staff Table SQL'}
              </span>
              {expandedSQL ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedSQL && (
              <div className="mt-3">
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                  <pre className="text-xs text-gray-100 whitespace-pre-wrap">
                    {status && status.missingTables.length > 0
                      ? getCompleteMigrationSQL(status.missingTables)
                      : getStaffTableSQL()
                    }
                  </pre>
                </div>
                <button
                  onClick={status && status.missingTables.length > 0 ? copyCompleteMigrationSQL : copySQL}
                  className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy SQL to Clipboard
                </button>
                {status && status.missingTables.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    This SQL will create {status.missingTables.length} missing table(s)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database Status</h2>

          {status && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Tables</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{status.tables.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Existing</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                  {status.tables.filter(t => t.exists).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Missing</span>
                <span className="text-sm font-bold text-red-700 dark:text-red-400">
                  {status.missingTables.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Tables</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('modules')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  viewMode === 'modules'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                By Module
              </button>
              <button
                onClick={() => setViewMode('tables')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  viewMode === 'tables'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Tables
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'modules' ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {status && Object.entries(status.tablesByModule).map(([moduleName, moduleTables]) => {
              const summary = status.moduleSummary[moduleName];
              const isExpanded = expandedModules[moduleName] ?? true;
              const allExist = summary.missing === 0;

              return (
                <div key={moduleName} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <button
                    onClick={() => setExpandedModules(prev => ({ ...prev, [moduleName]: !isExpanded }))}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{moduleName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {summary.exists} of {summary.total} tables ready
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {allExist ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round((summary.exists / summary.total) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Complete
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-paper dark:bg-canvas/50">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Table Name
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Rows
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              RLS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {moduleTables.map((table) => (
                            <tr key={table.name} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="px-6 py-3 whitespace-nowrap">
                                {getStatusIcon(table)}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className="text-sm font-mono text-gray-900 dark:text-white">
                                  {table.name}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {table.rowCount !== null ? table.rowCount.toLocaleString() : '-'}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                {table.hasRLS === true ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : table.hasRLS === false ? (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Table Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Row Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    RLS Enabled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Badge
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {status?.tables.map((table) => (
                  <tr key={table.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(table)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {table.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {table.module || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {table.rowCount !== null ? table.rowCount.toLocaleString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {table.hasRLS === true ? 'Yes' : table.hasRLS === false ? 'No' : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(table)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-400 mb-2">
          Need Help?
        </h3>
        <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 list-disc list-inside">
          <li>Quick Fix creates only the staff table - use this if you just need staff management</li>
          <li>Run All Migrations creates all required tables for the full platform</li>
          <li>If migrations fail, you can copy the SQL and run it manually in Supabase SQL Editor</li>
          <li>Contact support if you continue experiencing issues</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseMigrations;
