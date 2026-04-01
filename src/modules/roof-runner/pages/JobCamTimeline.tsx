import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid2x2 as Grid, X, CheckSquare, Square, Shield, Star, Briefcase, Upload, Search, ChevronLeft, RefreshCw, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import {
  fetchJobMediaByJob,
  fetchAllJobPhotos,
  bulkUpdateJobPhotos,
  uploadJobPhoto,
} from '../services/jobCamApi';
import type { JobPhoto, JobMediaFilters, BulkUpdatePayload, PhotoCategory, ReviewStatus } from '../types/jobCam';
import { getJobs, Job } from '../../../shared/store/services/jobsApi';
import JobCamMediaDrawer from './JobCamMediaDrawer';
import { format } from 'date-fns';

const CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'during', label: 'During' },
  { value: 'after', label: 'After' },
  { value: 'damage', label: 'Damage' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'completion', label: 'Completion' },
  { value: 'claim', label: 'Claim' },
];

const REVIEW_STATUSES: { value: ReviewStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'text-amber-600' },
  { value: 'approved', label: 'Approved', color: 'text-green-600' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
];

const reviewBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const categoryColor: Record<string, string> = {
  before: 'bg-primary-100 text-primary-700',
  during: 'bg-amber-100 text-amber-700',
  after: 'bg-green-100 text-green-700',
  damage: 'bg-red-100 text-red-700',
  inspection: 'bg-purple-100 text-purple-700',
  completion: 'bg-teal-100 text-teal-700',
  claim: 'bg-orange-100 text-orange-700',
};

const JobCamTimeline: React.FC = () => {
  const { jobId, orgSlug } = useParams<{ jobId?: string; orgSlug: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobMediaFilters>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerPhoto, setDrawerPhoto] = useState<JobPhoto | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const numericJobId = jobId && jobId !== 'all' ? Number(jobId) : undefined;
      const [photosData, jobsData] = await Promise.all([
        numericJobId ? fetchJobMediaByJob(numericJobId, filters) : fetchAllJobPhotos(filters),
        jobId && jobId !== 'all' ? getJobs(1, 100) : Promise.resolve({ jobs: [] }),
      ]);
      setPhotos(photosData);
      if (numericJobId) {
        const found = (jobsData as { jobs: Job[] }).jobs.find((j: Job) => j.id === numericJobId);
        setJob(found ?? null);
      }
    } catch (e) {
      console.error('Error loading photos:', e);
    } finally {
      setLoading(false);
    }
  }, [jobId, filters]);

  useEffect(() => { 
    load(); 
  }, [load]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(photos.map(p => p.id)));
  const clearSelection = () => setSelected(new Set());

  const handleBulkAction = async (patch: BulkUpdatePayload) => {
    if (selected.size === 0) return;
    try {
      await bulkUpdateJobPhotos(Array.from(selected), patch);
      clearSelection();
      load();
    } catch (e) {
      console.error('Bulk update failed:', e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const numericJobId = jobId && jobId !== 'all' ? Number(jobId) : undefined;
      for (const file of Array.from(files)) {
        await uploadJobPhoto(file, numericJobId);
      }
      load();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const groupedByDate = photos.reduce<Record<string, JobPhoto[]>>((acc, photo) => {
    const key = format(new Date(photo.capture_date), 'MMMM d, yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  const photoCard = (photo: JobPhoto) => (
    <div
      key={photo.id}
      className={`relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square cursor-pointer border-2 transition-all ${
        selected.has(photo.id)
          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900'
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500 shadow-sm'
      }`}
      onClick={() => setDrawerPhoto(photo)}
    >
      <img
        src={photo.thumbnail_url ?? photo.file_url}
        alt={photo.description ?? photo.file_name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        onError={e => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          el.parentElement!.classList.add('flex', 'items-center', 'justify-center');
        }}
      />

      <button
        className="absolute top-2 left-2 z-10"
        onClick={e => { e.stopPropagation(); toggleSelect(photo.id); }}
        aria-label={selected.has(photo.id) ? "Deselect" : "Select"}
      >
        {selected.has(photo.id) ? (
          <CheckSquare size={18} className="text-primary-500 drop-shadow-md bg-white rounded-sm" />
        ) : (
          <Square size={18} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity bg-black/20 rounded-sm" />
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-bold truncate mb-1">{photo.description ?? photo.file_name}</p>
        <div className="flex gap-1 flex-wrap">
          {photo.category && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded text-white/90 bg-white/20 font-bold uppercase tracking-wider`}>
              {photo.category}
            </span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${reviewBadge[photo.review_status]}`}>
            {photo.review_status}
          </span>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
        {photo.is_claim_relevant && (
          <div title="Claim relevant" className="w-6 h-6 rounded-lg bg-orange-500/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Briefcase size={12} className="text-white" />
          </div>
        )}
        {photo.is_marketing_approved && (
          <div title="Marketing approved" className="w-6 h-6 rounded-lg bg-green-500/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Star size={12} className="text-white" />
          </div>
        )}
        {photo.is_customer_shareable && (
          <div title="Customer shareable" className="w-6 h-6 rounded-lg bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Shield size={12} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <button
            onClick={() => navigate(`/org/${orgSlug}/job-cam`)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {job ? job.name : jobId === 'all' ? 'All Job Photos' : 'Job Photos'}
              <span className="text-sm font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{photos.length} photos</span>
            </h1>
            {job?.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.location}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {jobId !== 'all' && (
              <button
                onClick={() => navigate('checklist')}
                className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold"
              >
                <CheckSquare size={16} />
                Review Checklist
              </button>
            )}
             <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 font-semibold"
            >
              <Upload size={16} />
              {uploading ? 'Syncing...' : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter photos by description or tag..."
              value={filters.search ?? ''}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>

          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border font-semibold transition-all shadow-sm ${
              showFilters
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white shadow-inner' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Masonry Grid"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 transition-all ${viewMode === 'timeline' ? 'bg-primary-600 text-white shadow-inner' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Daily Timeline"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex flex-wrap gap-6 border border-gray-100 dark:border-gray-700 shadow-inner">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setFilters(f => ({ ...f, category: f.category === c.value ? undefined : c.value }))}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                      filters.category === c.value
                        ? (categoryColor[c.value] ?? 'bg-primary-600 text-white border-primary-600 shadow-md')
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:text-primary-500'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Review</p>
              <div className="flex gap-1.5">
                {REVIEW_STATUSES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setFilters(f => ({ ...f, reviewStatus: f.reviewStatus === r.value ? undefined : r.value }))}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                      filters.reviewStatus === r.value
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:text-primary-500'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Flags</p>
              <div className="flex gap-1.5">
                {[
                  { key: 'isClaimRelevant' as const, label: 'Claim', icon: Briefcase },
                  { key: 'isCustomerShareable' as const, label: 'Shareable', icon: Shield },
                  { key: 'isMarketingApproved' as const, label: 'Marketing', icon: Star },
                ].map(flag => (
                  <button
                    key={flag.key}
                    onClick={() => setFilters(f => ({ ...f, [flag.key]: f[flag.key] ? undefined : true }))}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${
                      filters[flag.key]
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:text-primary-500'
                    }`}
                  >
                    <flag.icon size={12} />
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setFilters({})}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 underline self-end mb-1"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="bg-primary-600 text-white px-6 py-3 flex items-center justify-between shadow-lg z-20 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-4">
             <button onClick={clearSelection} className="p-1 rounded-md hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
            <span className="text-sm font-bold uppercase tracking-wider">{selected.size} selected for bulk action</span>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {[
              { label: 'Approve', action: () => handleBulkAction({ review_status: 'approved' }) },
              { label: 'Reject', action: () => handleBulkAction({ review_status: 'rejected' }) },
              { label: 'Mark Claim', action: () => handleBulkAction({ is_claim_relevant: true }) },
              { label: 'Shareable', action: () => handleBulkAction({ is_customer_shareable: true }) },
              { label: 'Marketing', action: () => handleBulkAction({ is_marketing_approved: true }) },
            ].map(a => (
              <button
                key={a.label}
                onClick={a.action}
                className="text-[10px] bg-white/20 hover:bg-white text-white hover:text-primary-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest transition-all border border-white/30"
              >
                {a.label}
              </button>
            ))}
            <div className="w-px h-6 bg-white/30 mx-2" />
            <button onClick={selectAll} className="text-xs font-bold hover:underline">
              Select All
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw size={32} className="animate-spin text-primary-500" />
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Fetching high-res media...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 px-6">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <Upload size={32} className="text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No field photos found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6">Capture inspection photos or documents on-site to build the job history.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md transition-all"
            >
              Upload First Batch
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {photos.map(photoCard)}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedByDate).map(([date, datePhotos]) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-4 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-2">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {date}
                  </h3>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                  <span className="text-xs text-gray-400 font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
                    {datePhotos.length} item{datePhotos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {datePhotos.map(photoCard)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {drawerPhoto && (
        <JobCamMediaDrawer
          photo={drawerPhoto}
          onClose={() => setDrawerPhoto(null)}
          onUpdate={updated => {
            setPhotos(ps => ps.map(p => p.id === updated.id ? updated : p));
            setDrawerPhoto(updated);
          }}
          onNext={() => {
            const idx = photos.findIndex(p => p.id === drawerPhoto.id);
            if (idx < photos.length - 1) setDrawerPhoto(photos[idx + 1]);
          }}
          onPrev={() => {
            const idx = photos.findIndex(p => p.id === drawerPhoto.id);
            if (idx > 0) setDrawerPhoto(photos[idx - 1]);
          }}
        />
      )}
    </div>
  );
};

export default JobCamTimeline;
