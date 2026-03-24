import React, { useState, useCallback } from 'react';
import {
  Search, SlidersHorizontal, LayoutGrid, List, RefreshCw,
  Briefcase, Shield, Star
} from 'lucide-react';
import type {
  JobPhoto, JobMediaFilters, BulkUpdatePayload,
  PhotoCategory, ReviewStatus
} from '../../../types/jobCam';
import {
  fetchJobMediaByJob, bulkUpdateJobPhotos,
} from '../../../services/jobCamApi';
import MediaCard from '../../../components/job-cam/MediaCard';
import BulkActionBar from '../../../components/job-cam/BulkActionBar';
import EmptyStateActionCard from '../../../components/job-cam/EmptyStateActionCard';
import JobCamMediaDrawer from '../JobCamMediaDrawer';
import { format } from 'date-fns';
import { Camera } from 'lucide-react';

const CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'during', label: 'During' },
  { value: 'after', label: 'After' },
  { value: 'damage', label: 'Damage' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'completion', label: 'Completion' },
  { value: 'claim', label: 'Claim' },
];

const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const reviewBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const categoryColor: Record<string, string> = {
  before: 'bg-primary-100 text-primary-700',
  during: 'bg-amber-100 text-amber-700',
  after: 'bg-green-100 text-green-700',
  damage: 'bg-red-100 text-red-700',
  inspection: 'bg-sky-100 text-sky-700',
  completion: 'bg-teal-100 text-teal-700',
  claim: 'bg-orange-100 text-orange-700',
};

interface Props {
  jobId: number;
  photos: JobPhoto[];
  setPhotos: (photos: JobPhoto[] | ((prev: JobPhoto[]) => JobPhoto[])) => void;
  onUploadClick: () => void;
  onRefresh: () => void;
}

const PhotosTab: React.FC<Props> = ({ jobId, photos, setPhotos, onUploadClick, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobMediaFilters>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerPhoto, setDrawerPhoto] = useState<JobPhoto | null>(null);

  const filteredPhotos = photos.filter(p => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.reviewStatus && p.review_status !== filters.reviewStatus) return false;
    if (filters.isClaimRelevant && !p.is_claim_relevant) return false;
    if (filters.isCustomerShareable && !p.is_customer_shareable) return false;
    if (filters.isMarketingApproved && !p.is_marketing_approved) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.description?.toLowerCase().includes(q) && !p.file_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (patch: BulkUpdatePayload) => {
    if (selected.size === 0) return;
    try {
      await bulkUpdateJobPhotos(Array.from(selected), patch);
      setSelected(new Set());
      onRefresh();
    } catch (e) {
      console.error('Bulk update failed:', e);
    }
  };

  const groupedByDate = filteredPhotos.reduce<Record<string, JobPhoto[]>>((acc, photo) => {
    const key = format(new Date(photo.capture_date), 'MMMM d, yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  const drawerIndex = drawerPhoto ? filteredPhotos.findIndex(p => p.id === drawerPhoto.id) : -1;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-2">
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
          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{filteredPhotos.length} photos</span>
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
        <BulkActionBar
          count={selected.size}
          onAction={handleBulkAction}
          onSelectAll={() => setSelected(new Set(filteredPhotos.map(p => p.id)))}
          onClear={() => setSelected(new Set())}
        />
      )}

      <div className="flex-1 overflow-auto p-6">
        {filteredPhotos.length === 0 ? (
          <EmptyStateActionCard
            icon={Camera}
            title="No photos yet"
            description="Upload photos from the field or office to start documenting this job."
            actionLabel="Upload Photos"
            onAction={onUploadClick}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {filteredPhotos.map(photo => (
              <MediaCard
                key={photo.id}
                photo={photo}
                selected={selected.has(photo.id)}
                onSelect={() => toggleSelect(photo.id)}
                onClick={() => setDrawerPhoto(photo)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([date, datePhotos]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-gray-50 dark:bg-gray-900 py-1 z-10">
                  {date} &bull; {datePhotos.length} photo{datePhotos.length !== 1 ? 's' : ''}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                  {datePhotos.map(photo => (
                    <MediaCard
                      key={photo.id}
                      photo={photo}
                      selected={selected.has(photo.id)}
                      onSelect={() => toggleSelect(photo.id)}
                      onClick={() => setDrawerPhoto(photo)}
                    />
                  ))}
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
            setPhotos((ps: JobPhoto[]) => ps.map(p => p.id === updated.id ? updated : p));
            setDrawerPhoto(updated);
          }}
          onNext={drawerIndex < filteredPhotos.length - 1 ? () => setDrawerPhoto(filteredPhotos[drawerIndex + 1]) : undefined}
          onPrev={drawerIndex > 0 ? () => setDrawerPhoto(filteredPhotos[drawerIndex - 1]) : undefined}
        />
      )}
    </div>
  );
};

export default PhotosTab;
