import { useState, useEffect } from 'react';
import { vapiApi } from '../services/vapiApi';
import { Card } from './Card';
import { StatusChip } from './StatusChip';
import { Play, Pause, FileText, Download, User, Calendar, Clock, DollarSign } from 'lucide-react';

interface CallLog {
  id: string;
  startedAt: string;
  endedAt: string;
  cost: number;
  status: string;
  endedReason: string;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  customerNumber: string;
  assistantId: string;
}

interface CallLogsTabProps {
  agentId?: string;
}

export function CallLogsTab({ agentId }: CallLogsTabProps) {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [agentId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await vapiApi.getCallLogs(agentId);
      setLogs(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error fetching call logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.floor((e - s) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading call logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Call History" subtitle="Review and listen to past agent conversations">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No call logs found for this agent.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(log.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {log.customerNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatDuration(log.startedAt, log.endedAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      ${log.cost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusChip 
                        label={log.status} 
                        status={log.status === 'ended' ? 'success' : 'warning'} 
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {log.recordingUrl && (
                          <button
                            onClick={() => setPlaying(playing === log.id ? null : log.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Listen recording"
                          >
                            {playing === log.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors"
                          title="View transcript & summary"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audio Player (Sticky at bottom if playing) */}
      {playing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-red-200 dark:border-red-900/50 p-4 z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <button 
            onClick={() => setPlaying(null)}
            className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <Pause className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Playing Call Recording</div>
            <audio 
              src={logs.find(l => l.id === playing)?.recordingUrl} 
              autoPlay 
              controls 
              className="w-full h-8"
              onEnded={() => setPlaying(null)}
            />
          </div>
          <button 
             onClick={() => setPlaying(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Call Details</h3>
                <p className="text-sm text-gray-500">{new Date(selectedLog.startedAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Clock className="w-3 h-3" /> Duration
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatDuration(selectedLog.startedAt, selectedLog.endedAt)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <DollarSign className="w-3 h-3" /> Cost
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${selectedLog.cost?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <User className="w-3 h-3" /> Customer
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {selectedLog.customerNumber}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Calendar className="w-3 h-3" /> Reason
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedLog.endedReason?.replace(/-/g, ' ') || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedLog.summary && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">AI Summary</h4>
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedLog.summary}
                  </div>
                </div>
              )}

              {/* Transcript */}
              {selectedLog.transcript && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Full Transcript</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedLog.transcript}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              {selectedLog.recordingUrl && (
                <a
                  href={selectedLog.recordingUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Audio
                </a>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
