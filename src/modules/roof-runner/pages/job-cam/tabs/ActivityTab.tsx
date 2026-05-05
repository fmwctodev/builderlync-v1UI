import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { fetchJobActivity } from '../../../services/jobCamApi';
import type { JobActivityEvent } from '../../../types/jobCam';
import ActivityTimeline from '../../../components/job-cam/ActivityTimeline';

interface Props {
  jobId: number;
}

const ActivityTab: React.FC<Props> = ({ jobId }) => {
  const [events, setEvents] = useState<JobActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobActivity(jobId);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6 md:pb-24">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
              <Activity size={20} className="text-primary-500" />
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {events.length} event{events.length !== 1 ? 's' : ''} logged
              </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Activity
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <ActivityTimeline events={events} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ActivityTab;
