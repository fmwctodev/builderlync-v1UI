import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Camera, CheckSquare, FileText, FolderOpen,
  Activity, Share2, Upload, RefreshCw, MapPin
} from 'lucide-react';
import { getJobs, Job } from '../../../shared/store/services/jobsApi';
import { fetchJobMediaByJob } from '../services/jobCamApi';
import type { JobPhoto } from '../types/jobCam';
import PhotosTab from './job-cam/tabs/PhotosTab';
import ChecklistTab from './job-cam/tabs/ChecklistTab';
import ReportsTab from './job-cam/tabs/ReportsTab';
import FilesTab from './job-cam/tabs/FilesTab';
import ActivityTab from './job-cam/tabs/ActivityTab';
import UploadMediaModal, { type UploadFile } from '../components/job-cam/UploadMediaModal';
import ShareModal from '../components/job-cam/ShareModal';
import { uploadJobPhoto, fetchJobFiles } from '../services/jobCamApi';
import type { JobFile } from '../types/jobCam';

type Tab = 'photos' | 'checklist' | 'reports' | 'files' | 'activity';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'checklist', label: 'Checklist', icon: CheckSquare },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'files', label: 'Files', icon: FolderOpen },
  { key: 'activity', label: 'Activity', icon: Activity },
];

const JobDetailWorkspace: React.FC = () => {
  const { jobId, orgSlug } = useParams<{ jobId: string; orgSlug: string }>();
  const navigate = useNavigate();
  const numericJobId = Number(jobId);

  const [job, setJob] = useState<Job | null>(null);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [files, setFiles] = useState<JobFile[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsData, photosData, filesData] = await Promise.all([
        getJobs(1, 200),
        fetchJobMediaByJob(numericJobId),
        fetchJobFiles(numericJobId),
      ]);
      const found = jobsData.data.data.find((j: Job) => j.id === numericJobId);
      setJob(found ?? null);
      setPhotos(photosData);
      setFiles(filesData);
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
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <RefreshCw size={32} className="animate-spin text-primary-500" />
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Entering Job Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 pt-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/org/${orgSlug}/job-cam`)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-primary-600 transition-all hover:shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">
                {job?.name ?? `Job #${jobId}`}
              </h1>
              <div className="flex items-center gap-4 mt-1 font-medium">
                {job?.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                    <MapPin size={14} className="text-primary-500" />
                    {job.location}
                  </p>
                )}
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md text-gray-400 font-bold uppercase tracking-wider">
                  {photos.length} item{photos.length !== 1 ? 's' : ''}
                </span>
                {pendingCount > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-1 rounded-lg font-bold shadow-sm whitespace-nowrap">
                    {pendingCount} pending review
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <Share2 size={16} />
                Share Links
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 text-sm font-bold bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-all shadow-md"
              >
                <Upload size={16} />
                Sync Media
              </button>
            </div>
          </div>

          <div className="flex gap-2 -mb-[1px] overflow-x-auto scrollbar-none">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-4 ${
                    isActive
                      ? 'border-primary-600 text-gray-900 dark:text-white bg-primary-50/30 dark:bg-primary-900/10'
                      : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
        {activeTab === 'photos' && (
          <PhotosTab
            jobId={numericJobId}
            photos={photos}
            files={files}
            setPhotos={setPhotos}
            onUploadClick={() => setShowUpload(true)}
            onRefresh={load}
          />
        )}
        {activeTab === 'checklist' && (
          <ChecklistTab jobId={numericJobId} photos={photos} files={files} />
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
