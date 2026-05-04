import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid2x2 as Grid, List, SlidersHorizontal, X, CheckSquare, Square, Tag, Shield, Star, Briefcase, Upload, Search, ChevronLeft, RefreshCw, LayoutGrid } from 'lucide-react';
import {
  fetchJobMediaByJob,
  fetchAllJobPhotos,
  bulkUpdateJobPhotos,
  uploadJobPhoto,
} from '../../services/jobCamApi';
import type { JobPhoto, JobMediaFilters, BulkUpdatePayload, PhotoCategory, ReviewStatus } from '../../types/jobCam';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';
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
  const { jobId } = useParams<{ jobId?: string }>();
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
        jobId && jobId !== 'all' ? getJobs(1, 200) : Promise.resolve({ jobs: [] }),
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

  useEffect(() => { load(); }, [load]);

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
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
      }`}
      onClick={() => setDrawerPhoto(photo)}
    >
      <img
        src={photo.thumbnail_url ?? photo.file_url}
        alt={photo.description ?? photo.file_name}
        className="w-full h-full object-cover"
        onError={e => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          el.parentElement!.classList.add('flex', 'items-center', 'justify-center');
        }}
      />

      <button
        className="absolute top-2 left-2 z-10"
        onClick={e => { e.stopPropagation(); toggleSelect(photo.id); }}
      >
        {selected.has(photo.id) ? (
          <CheckSquare size={18} className="text-primary-500 drop-shadow-md" />
        ) : (
          <Square size={18} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-medium truncate">{photo.description ?? photo.file_name}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {photo.category && (
            <span className={`text-xs px-1.5 py-0.5 rounded text-white/90 bg-white/20 font-medium`}>
              {photo.category}
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${reviewBadge[photo.review_status]}`}>
            {photo.review_status}
          </span>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {photo.is_claim_relevant && (
          <div title="Claim relevant" className="w-5 h-5 rounded bg-orange-500/90 flex items-center justify-center">
            <Briefcase size={11} className="text-white" />
          </div>
        )}
        {photo.is_marketing_approved && (
          <div title="Marketing approved" className="w-5 h-5 rounded bg-green-500/90 flex items-center justify-center">
            <Star size={11} className="text-white" />
          </div>
        )}
        {photo.is_customer_shareable && (
          <div title="Customer shareable" className="w-5 h-5 rounded bg-primary-500/90 flex items-center justify-center">
            <Shield size={11} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-paper dark:bg-canvas">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {job ? job.name : jobId === 'all' ? 'All Job Photos' : 'Job Photos'}
            </h1>
            {job?.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{job.location}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{photos.length} photos</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={filters.search ?? ''}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900'
                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 ${viewMode === 'timeline' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-sm px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <Upload size={15} />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setFilters(f => ({ ...f, category: f.category === c.value ? undefined : c.value }))}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      filters.category === c.value
                        ? (categoryColor[c.value] ?? 'bg-gray-200 text-gray-700')
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Review Status</p>
              <div className="flex gap-1.5">
                {REVIEW_STATUSES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setFilters(f => ({ ...f, reviewStatus: f.reviewStatus === r.value ? undefined : r.value }))}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      filters.reviewStatus === r.value
                        ? reviewBadge[r.value]
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Flags</p>
              <div className="flex gap-1.5">
                {[
                  { key: 'isClaimRelevant' as const, label: 'Claim', icon: Briefcase },
                  { key: 'isCustomerShareable' as const, label: 'Shareable', icon: Shield },
                  { key: 'isMarketingApproved' as const, label: 'Marketing', icon: Star },
                ].map(flag => (
                  <button
                    key={flag.key}
                    onClick={() => setFilters(f => ({ ...f, [flag.key]: f[flag.key] ? undefined : true }))}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      filters[flag.key]
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <flag.icon size={11} />
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setFilters({})}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline self-end"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="bg-primary-600 text-white px-6 py-2.5 flex items-center gap-4">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            {[
              { label: 'Approve', action: () => handleBulkAction({ review_status: 'approved' }) },
              { label: 'Reject', action: () => handleBulkAction({ review_status: 'rejected' }) },
              { label: 'Mark Claim', action: () => handleBulkAction({ is_claim_relevant: true }) },
              { label: 'Mark Shareable', action: () => handleBulkAction({ is_customer_shareable: true }) },
              { label: 'Mark Marketing', action: () => handleBulkAction({ is_marketing_approved: true }) },
            ].map(a => (
              <button
                key={a.label}
                onClick={a.action}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium transition-colors"
              >
                {a.label}
              </button>
            ))}
            <button onClick={selectAll} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium">
              Select All
            </button>
            <button onClick={clearSelection} className="text-xs hover:text-primary-200">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw size={22} className="animate-spin text-gray-400" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Grid size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No photos found</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Upload the first photo
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {photos.map(photoCard)}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([date, datePhotos]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-paper dark:bg-canvas py-1">
                  {date} &bull; {datePhotos.length} photo{datePhotos.length !== 1 ? 's' : ''}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
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
        />
      )}
    </div>
  );
};

export default JobCamTimeline;
