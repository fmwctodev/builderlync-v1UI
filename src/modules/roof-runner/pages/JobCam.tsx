import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Camera, Search, RefreshCw,
  LayoutGrid, List, FileText, Bookmark, Link2
} from 'lucide-react';
import { fetchJobsWithMedia } from '../services/jobCamApi';
import type { JobWithMediaSummary } from '../types/jobCam';
import JobCard from '../components/job-cam/JobCard';
import EmptyStateActionCard from '../components/job-cam/EmptyStateActionCard';
import { formatDistanceToNow } from 'date-fns';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'pending';

const JobCam: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  
  const [jobs, setJobs] = useState<JobWithMediaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobsWithMedia();
      setJobs(data);
    } catch (e) {
      console.error('Error loading jobs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  const filtered = jobs.filter(j => {
    if (search) {
      const q = search.toLowerCase();
      if (!j.name.toLowerCase().includes(q) && !(j.location?.toLowerCase().includes(q))) return false;
    }
    if (activeTab === 'pending') return j.pending_review_count > 0;
    return true;
  });

  const totalPhotos = jobs.reduce((sum, j) => sum + j.photo_count, 0);
  const totalPending = jobs.reduce((sum, j) => sum + j.pending_review_count, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <Camera size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Job Cam</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} &bull; {totalPhotos} photos
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(`/org/${orgSlug}/job-cam/templates`)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Bookmark size={14} />
              Templates
            </button>
            <button
              onClick={() => navigate(`/org/${orgSlug}/job-cam/reports`)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText size={14} />
              Reports
            </button>
            <button
              onClick={() => navigate(`/org/${orgSlug}/job-cam/shared`)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Link2 size={14} />
              Shared
            </button>
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              aria-label="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by name or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-800">
            {(['all', 'pending'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab === 'all' ? 'All Jobs' : `Pending (${totalPending})`}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw size={32} className="animate-spin text-primary-500" />
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading field data...</p>
          </div>
        ) : filtered.length === 0 ? (
          search || activeTab !== 'all' ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={32} className="text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No matches found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <EmptyStateActionCard
              icon={Camera}
              title="No field photos yet"
              description="Capture and sync photos directly from the job site to get started with Job Cam."
              actionLabel="Go to Jobs"
              onAction={() => navigate(`/org/${orgSlug}/jobs`)}
            />
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`/org/${orgSlug}/job-cam/jobs/${job.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50 shadow-sm overflow-hidden">
            {filtered.map(job => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-all group"
                onClick={() => navigate(`/org/${orgSlug}/job-cam/jobs/${job.id}`)}
              >
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600 group-hover:scale-105 transition-transform">
                  {job.latest_photo_url ? (
                    <img src={job.latest_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={20} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{job.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 truncate">
                    <span className="truncate">{job.location ?? 'No address'}</span>
                    {job.contact_name && <span className="text-gray-300 dark:text-gray-600">&bull;</span>}
                    {job.contact_name && <span className="truncate">{job.contact_name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                      {job.photo_count} photos
                    </span>
                    {job.latest_photo_date && (
                      <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                        {formatDistanceToNow(new Date(job.latest_photo_date), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {job.pending_review_count > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-1 rounded-lg font-bold shadow-sm whitespace-nowrap">
                      {job.pending_review_count} pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCam;