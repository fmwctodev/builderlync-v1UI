import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <ActivityTimeline events={events} loading={loading} />
      </div>
    </div>
  );
};

export default ActivityTab;
