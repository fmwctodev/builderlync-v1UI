import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, CheckSquare, Clock, FileText, TrendingUp,
  AlertTriangle, Eye, ChevronRight, Image, RefreshCw
} from 'lucide-react';
import {
  fetchJobCamOverviewStats,
  fetchRecentJobActivity,
} from '../../services/jobCamApi';
import type { JobCamOverviewStats, JobPhoto } from '../../types/jobCam';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';
import { format, formatDistanceToNow } from 'date-fns';

const KPICard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  onClick?: () => void;
}> = ({ label, value, icon: Icon, iconColor, bgColor, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`${bgColor} rounded-xl p-3 flex-shrink-0`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

const categoryLabel: Record<string, string> = {
  before: 'Before',
  during: 'During',
  after: 'After',
  damage: 'Damage',
  inspection: 'Inspection',
  completion: 'Completion',
  claim: 'Claim',
};

const categoryColor: Record<string, string> = {
  before: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  during: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  after: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  damage: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  inspection: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  completion: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  claim: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const reviewBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const JobCamOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<JobCamOverviewStats | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<JobPhoto[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'missing'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewStats, recent, jobList] = await Promise.all([
        fetchJobCamOverviewStats(),
        fetchRecentJobActivity(30),
        getJobs(1, 100),
      ]);
      setStats(overviewStats);
      setRecentPhotos(recent);
      setJobs(jobList.jobs ?? []);
    } catch (e) {
      console.error('Error loading Job Cam overview:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const jobsWithMedia = jobs.filter(j =>
    recentPhotos.some(p => p.job_id === j.id)
  );

  const pendingPhotos = recentPhotos.filter(p => p.review_status === 'pending');

  const filteredPhotos = activeFilter === 'pending'
    ? pendingPhotos
    : recentPhotos;

  const getJobName = (jobId: number | null) => {
    if (!jobId) return 'Unlinked';
    return jobs.find(j => j.id === jobId)?.name ?? `Job #${jobId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera size={26} className="text-gray-700 dark:text-gray-300" />
            Job Cam
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Office control center for all jobsite media
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Jobs with media this week"
          value={stats?.jobsWithMediaThisWeek ?? 0}
          icon={Camera}
          iconColor="text-primary-600"
          bgColor="bg-primary-50 dark:bg-primary-900/20"
          onClick={() => setActiveFilter('all')}
        />
        <KPICard
          label="Pending review"
          value={stats?.pendingReviewCount ?? 0}
          icon={Clock}
          iconColor="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          onClick={() => setActiveFilter('pending')}
        />
        <KPICard
          label="Reports this week"
          value={stats?.reportsCreatedThisWeek ?? 0}
          icon={FileText}
          iconColor="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
          onClick={() => navigate('reports')}
        />
        <KPICard
          label="Total photos this week"
          value={stats?.totalPhotosThisWeek ?? 0}
          icon={Image}
          iconColor="text-gray-600"
          bgColor="bg-gray-100 dark:bg-gray-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={17} className="text-gray-500" />
              Recent Media Activity
            </h2>
            <div className="flex gap-2">
              {(['all', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    activeFilter === f
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {f === 'all' ? 'All' : 'Pending Review'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filteredPhotos.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No photos found
              </div>
            ) : (
              filteredPhotos.slice(0, 10).map(photo => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                  onClick={() => photo.job_id && navigate(`jobs/${photo.job_id}`)}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    <img
                      src={photo.thumbnail_url ?? photo.file_url}
                      alt={photo.description ?? photo.file_name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {photo.description ?? photo.file_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {getJobName(photo.job_id)} &bull; {formatDistanceToNow(new Date(photo.capture_date), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {photo.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[photo.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {categoryLabel[photo.category]}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reviewBadge[photo.review_status]}`}>
                      {photo.review_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Camera size={17} className="text-gray-500" />
                Jobs with Media
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {jobsWithMedia.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No jobs with media this week</p>
              ) : (
                jobsWithMedia.slice(0, 8).map(job => {
                  const jobPhotos = recentPhotos.filter(p => p.job_id === job.id);
                  const pending = jobPhotos.filter(p => p.review_status === 'pending').length;
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`jobs/${job.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{jobPhotos.length} photo{jobPhotos.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pending > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                            {pending} pending
                          </span>
                        )}
                        <ChevronRight size={15} className="text-gray-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye size={17} className="text-gray-500" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Browse all photos', icon: Image, path: 'jobs/all' },
                { label: 'View pending reviews', icon: Clock, path: 'jobs/all?review=pending' },
                { label: 'Generate report', icon: FileText, path: 'reports/new' },
                { label: 'Manage templates', icon: CheckSquare, path: 'templates' },
                { label: 'Share & access', icon: AlertTriangle, path: 'sharing' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <action.icon size={16} className="text-gray-400 flex-shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCamOverview;
