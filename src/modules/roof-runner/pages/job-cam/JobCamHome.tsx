import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Search, RefreshCw, SlidersHorizontal,
  LayoutGrid, List, FileText, Bookmark, Link2
} from 'lucide-react';
import { fetchJobsWithMedia } from '../../services/jobCamApi';
import type { JobWithMediaSummary } from '../../types/jobCam';
import JobCard from '../../components/job-cam/JobCard';
import EmptyStateActionCard from '../../components/job-cam/EmptyStateActionCard';
import { formatDistanceToNow } from 'date-fns';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'pending' | 'recent';

const JobCamHome: React.FC = () => {
  const navigate = useNavigate();
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

  useEffect(() => { load(); }, [load]);

  const filtered = jobs.filter(j => {
    if (search) {
      const q = search.toLowerCase();
      if (!j.name.toLowerCase().includes(q) && !j.location?.toLowerCase().includes(q)) return false;
    }
    if (activeTab === 'pending') return j.pending_review_count > 0;
    return true;
  });

  const totalPhotos = jobs.reduce((sum, j) => sum + j.photo_count, 0);
  const totalPending = jobs.reduce((sum, j) => sum + j.pending_review_count, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Camera size={24} className="text-gray-700 dark:text-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Job Cam</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} &bull; {totalPhotos} photos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('templates')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Bookmark size={14} />
              Templates
            </button>
            <button
              onClick={() => navigate('reports')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText size={14} />
              Reports
            </button>
            <button
              onClick={() => navigate('shared')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Link2 size={14} />
              Shared
            </button>
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by name or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0">
            {(['all', 'pending'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab === 'all' ? 'All Jobs' : `Pending (${totalPending})`}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw size={22} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          search || activeTab !== 'all' ? (
            <div className="text-center py-16">
              <Camera size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No jobs match your search</p>
            </div>
          ) : (
            <EmptyStateActionCard
              icon={Camera}
              title="No jobs with photos yet"
              description="Upload photos to a job from the field or office to get started with Job Cam."
              actionLabel="Go to Jobs"
              onAction={() => navigate('/app/jobs')}
            />
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`jobs/${job.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
            {filtered.map(job => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                onClick={() => navigate(`jobs/${job.id}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {job.latest_photo_url ? (
                    <img src={job.latest_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {job.location ?? 'No address'}
                    {job.contact_name && <span> &bull; {job.contact_name}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {job.photo_count} photo{job.photo_count !== 1 ? 's' : ''}
                  </span>
                  {job.pending_review_count > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                      {job.pending_review_count} pending
                    </span>
                  )}
                  {job.latest_photo_date && (
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(job.latest_photo_date), { addSuffix: true })}
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

export default JobCamHome;
