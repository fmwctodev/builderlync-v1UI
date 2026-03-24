import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Camera, CheckSquare, FileText, FolderOpen,
  Activity, Share2, Upload, RefreshCw, MapPin
} from 'lucide-react';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';
import { fetchJobMediaByJob } from '../../services/jobCamApi';
import type { JobPhoto } from '../../types/jobCam';
import PhotosTab from './tabs/PhotosTab';
import ChecklistTab from './tabs/ChecklistTab';
import ReportsTab from './tabs/ReportsTab';
import FilesTab from './tabs/FilesTab';
import ActivityTab from './tabs/ActivityTab';
import UploadMediaModal, { type UploadFile } from '../../components/job-cam/UploadMediaModal';
import ShareModal from '../../components/job-cam/ShareModal';
import { uploadJobPhoto } from '../../services/jobCamApi';

type Tab = 'photos' | 'checklist' | 'reports' | 'files' | 'activity';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'checklist', label: 'Checklist', icon: CheckSquare },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'files', label: 'Files', icon: FolderOpen },
  { key: 'activity', label: 'Activity', icon: Activity },
];

const JobDetailWorkspace: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const numericJobId = Number(jobId);

  const [job, setJob] = useState<Job | null>(null);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsData, photosData] = await Promise.all([
        getJobs(1, 200),
        fetchJobMediaByJob(numericJobId),
      ]);
      const found = jobsData.jobs?.find((j: Job) => j.id === numericJobId);
      setJob(found ?? null);
      setPhotos(photosData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [numericJobId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (files: UploadFile[]) => {
    for (const f of files) {
      await uploadJobPhoto(f.file, numericJobId, {
        category: f.category,
        phase: f.phase,
        description: f.description || null,
      } as Partial<JobPhoto>);
    }
    load();
  };

  const pendingCount = photos.filter(p => p.review_status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/app/job-cam')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {job?.name ?? `Job #${jobId}`}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                {job?.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                    <MapPin size={12} />
                    {job.location}
                  </p>
                )}
                <span className="text-sm text-gray-400">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''}
                </span>
                {pendingCount > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                    {pendingCount} pending
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <Upload size={14} />
                Upload
              </button>
            </div>
          </div>

          <div className="flex gap-1 -mb-[1px]">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    isActive
                      ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'photos' && (
          <PhotosTab
            jobId={numericJobId}
            photos={photos}
            setPhotos={setPhotos}
            onUploadClick={() => setShowUpload(true)}
            onRefresh={load}
          />
        )}
        {activeTab === 'checklist' && (
          <ChecklistTab jobId={numericJobId} photos={photos} />
        )}
        {activeTab === 'reports' && (
          <ReportsTab jobId={numericJobId} />
        )}
        {activeTab === 'files' && (
          <FilesTab jobId={numericJobId} />
        )}
        {activeTab === 'activity' && (
          <ActivityTab jobId={numericJobId} />
        )}
      </div>

      <UploadMediaModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />

      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        jobId={numericJobId}
      />
    </div>
  );
};

export default JobDetailWorkspace;
