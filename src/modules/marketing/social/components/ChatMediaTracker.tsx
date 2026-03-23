import React, { useEffect, useRef } from 'react';
import { Film, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import type { MediaJobInfo } from '../types';
import { supabase } from '../../../../shared/lib/supabase';

interface TrackedJob extends MediaJobInfo {
  message_id: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  asset_url?: string;
}

interface ChatMediaTrackerProps {
  jobs: TrackedJob[];
  onJobsUpdated: (jobs: TrackedJob[]) => void;
}

async function pollJobStatuses(jobIds: string[]): Promise<Record<string, { status: string; url?: string }>> {
  if (!jobIds.length) return {};
  const { data } = await supabase
    .from('sierra_social_media_assets')
    .select('job_id, status, asset_url')
    .in('job_id', jobIds);
  const result: Record<string, { status: string; url?: string }> = {};
  for (const row of data ?? []) {
    result[row.job_id] = { status: row.status, url: row.asset_url };
  }
  return result;
}

const POLL_INTERVAL = 5000;

const ChatMediaTracker: React.FC<ChatMediaTrackerProps> = ({ jobs, onJobsUpdated }) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePending = jobs.filter((j) => j.status === 'pending' || j.status === 'generating');

  useEffect(() => {
    if (!activePending.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const poll = async () => {
      const ids = activePending.map((j) => j.job_id);
      const statuses = await pollJobStatuses(ids).catch(() => ({}));
      const updated = jobs.map((j) => {
        const s = statuses[j.job_id];
        if (!s) return j;
        return { ...j, status: s.status as TrackedJob['status'], asset_url: s.url };
      });
      onJobsUpdated(updated);
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activePending.length]);

  if (!jobs.length) return null;

  return (
    <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-2 bg-gray-50/80 dark:bg-slate-800/80">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
          <Film size={12} />
          Media
        </span>
        {jobs.map((job, i) => (
          <JobPill key={`${job.job_id}-${i}`} job={job} />
        ))}
      </div>
    </div>
  );
};

const JobPill: React.FC<{ job: TrackedJob }> = ({ job }) => {
  const label = job.platform ? job.platform.charAt(0).toUpperCase() + job.platform.slice(1) : 'Media';

  if (job.status === 'ready') {
    return (
      <a
        href={job.asset_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-900/40 border border-emerald-700/50 rounded-full text-xs text-emerald-400 hover:bg-emerald-900/60 transition-colors"
      >
        <CheckCircle size={11} />
        {label} ready
      </a>
    );
  }

  if (job.status === 'failed') {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 bg-red-900/30 border border-red-700/40 rounded-full text-xs text-red-400">
        <XCircle size={11} />
        {label} failed
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-full text-xs text-gray-500 dark:text-slate-400">
      {job.status === 'generating' ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <RefreshCw size={11} className="animate-spin opacity-60" />
      )}
      {label} {job.status}...
    </span>
  );
};

export default ChatMediaTracker;
export type { TrackedJob };
