import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';
import { loadActionLogs } from '../../services/sierraAssistantService';
import type { AssistantActionLog } from '../../types/sierraAssistant';

const ACTION_LABELS: Record<string, string> = {
  create_contact: 'Created contact',
  update_contact: 'Updated contact',
  create_opportunity: 'Created opportunity',
  move_opportunity: 'Moved opportunity',
  create_task: 'Created task',
  update_task: 'Updated task',
  create_event: 'Scheduled event',
  update_event: 'Updated event',
  cancel_event: 'Cancelled event',
  draft_email: 'Drafted email',
  send_email: 'Sent email',
  send_sms: 'Sent SMS',
  remember: 'Saved memory',
  store_memory: 'Stored memory',
  query_contacts: 'Queried contacts',
  query_opportunities: 'Queried opportunities',
  query_schedule: 'Queried schedule',
  query_tasks: 'Queried tasks',
  query_jobs: 'Queried jobs',
  query_analytics: 'Ran analytics',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function SierraAssistantActivityView() {
  const { userId } = useSierraAssistant();
  const [logs, setLogs] = useState<AssistantActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await loadActionLogs(userId, 30);
      setLogs(data);
    } catch (err) {
      console.error('Error loading action logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Recent Actions</h3>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Clock size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No actions taken yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Actions you ask Sierra to take will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map(log => {
              const label = ACTION_LABELS[log.action_type] ?? log.action_type;
              return (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {log.execution_status === 'success'
                      ? <CheckCircle size={14} className="text-green-500" />
                      : log.execution_status === 'failed'
                      ? <XCircle size={14} className="text-red-500" />
                      : <Clock size={14} className="text-gray-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
                    {log.target_module && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{log.target_module.replace(/_/g, ' ')}</p>
                    )}
                    {log.error_message && (
                      <p className="text-xs text-red-500 mt-0.5 truncate">{log.error_message}</p>
                    )}
                    {log.confirmed_by_user && (
                      <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        Confirmed
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {timeAgo(log.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
