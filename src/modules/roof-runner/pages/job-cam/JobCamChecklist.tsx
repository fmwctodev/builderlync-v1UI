import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, AlertCircle, ChevronLeft,
  UserPlus, RotateCcw, Camera, RefreshCw, Image, ChevronDown, ChevronUp
} from 'lucide-react';
import { fetchTemplates, fetchJobMediaByJob } from '../../services/jobCamApi';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';
import type { JobCamTemplate, JobCamTemplateItem, JobPhoto } from '../../types/jobCam';
import JobCamMediaDrawer from './JobCamMediaDrawer';

type ItemStatus = 'complete' | 'needs_review' | 'missing';

interface ReviewItem {
  templateItem: JobCamTemplateItem;
  linkedPhotos: JobPhoto[];
  status: ItemStatus;
}

const statusConfig: Record<ItemStatus, { icon: React.ElementType; color: string; label: string; bg: string }> = {
  complete: { icon: CheckCircle2, color: 'text-green-600', label: 'Complete', bg: 'bg-green-50 dark:bg-green-900/20' },
  needs_review: { icon: AlertCircle, color: 'text-amber-600', label: 'Needs Review', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  missing: { icon: Circle, color: 'text-gray-400', label: 'Missing', bg: 'bg-gray-50 dark:bg-gray-800' },
};

const JobCamChecklist: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [templates, setTemplates] = useState<JobCamTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<JobCamTemplate | null>(null);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerPhoto, setDrawerPhoto] = useState<JobPhoto | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const numericJobId = Number(jobId);
      const [jobsData, shotlistTemplates, jobPhotos] = await Promise.all([
        getJobs(1, 200),
        fetchTemplates('shotlist'),
        fetchJobMediaByJob(numericJobId),
      ]);

      const foundJob = jobsData.jobs.find((j: Job) => j.id === numericJobId);
      setJob(foundJob ?? null);
      setTemplates(shotlistTemplates);
      setPhotos(jobPhotos);

      if (shotlistTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(shotlistTemplates[0]);
      }
    } catch (e) {
      console.error('Error loading checklist:', e);
    } finally {
      setLoading(false);
    }
  }, [jobId, selectedTemplate]);

  useEffect(() => { load(); }, [jobId]);

  useEffect(() => {
    if (!selectedTemplate?.items) return;
    const items: ReviewItem[] = (selectedTemplate.items ?? []).map(item => {
      const linked = photos.filter(p => {
        if (p.checklist_item_id === item.id) return true;
        if (item.category && p.category === item.category) return true;
        return false;
      });

      let status: ItemStatus = 'missing';
      if (linked.length > 0) {
        const hasPending = linked.some(p => p.review_status === 'pending');
        status = hasPending ? 'needs_review' : 'complete';
      }

      return { templateItem: item, linkedPhotos: linked, status };
    });

    setReviewItems(items);

    const toExpand = new Set<string>();
    items.filter(i => i.status === 'missing' || i.status === 'needs_review').forEach(i => {
      toExpand.add(i.templateItem.phase ?? 'general');
    });
    setExpandedSections(toExpand);
  }, [selectedTemplate, photos]);

  const groupedItems = reviewItems.reduce<Record<string, ReviewItem[]>>((acc, item) => {
    const key = item.templateItem.phase ?? 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const phaseLabel: Record<string, string> = {
    pre_install: 'Pre-Install',
    during_install: 'During Install',
    post_install: 'Post-Install',
    damage_assessment: 'Damage Assessment',
    claim: 'Claim',
    general: 'General',
  };

  const completedCount = reviewItems.filter(i => i.status === 'complete').length;
  const totalCount = reviewItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={22} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Checklist Review
          </h1>
          {job && <p className="text-sm text-gray-500 dark:text-gray-400">{job.name} &bull; {job.location}</p>}
        </div>
      </div>

      {templates.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shot list template:</label>
          <select
            value={selectedTemplate?.id ?? ''}
            onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value) ?? null)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
          >
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Documentation Progress
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {completedCount} of {totalCount} required shots completed
            </p>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress === 100 ? 'bg-green-500' : progress >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3">
          {(['complete', 'needs_review', 'missing'] as ItemStatus[]).map(s => {
            const count = reviewItems.filter(i => i.status === s).length;
            const cfg = statusConfig[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <cfg.icon size={14} className={cfg.color} />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>{count}</strong> {cfg.label.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Camera size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No shot list templates</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create a shot list template to start tracking documentation completeness.</p>
          <button
            onClick={() => navigate('../templates')}
            className="text-sm px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedItems).map(([phase, items]) => {
            const isExpanded = expandedSections.has(phase);
            const phaseComplete = items.filter(i => i.status === 'complete').length;
            const hasIssues = items.some(i => i.status !== 'complete');

            return (
              <div key={phase} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection(phase)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {hasIssues ? (
                      <AlertCircle size={18} className="text-amber-500" />
                    ) : (
                      <CheckCircle2 size={18} className="text-green-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {phaseLabel[phase] ?? phase}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {phaseComplete}/{items.length}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {items.map(item => {
                      const cfg = statusConfig[item.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={item.templateItem.id} className={`px-5 py-4 ${cfg.bg}`}>
                          <div className="flex items-start gap-3">
                            <StatusIcon size={18} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.templateItem.name}
                                </p>
                                {item.templateItem.is_required && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">Required</span>
                                )}
                                {item.templateItem.category && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">
                                    {item.templateItem.category}
                                  </span>
                                )}
                              </div>
                              {item.templateItem.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.templateItem.description}</p>
                              )}

                              {item.linkedPhotos.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {item.linkedPhotos.slice(0, 4).map(photo => (
                                    <button
                                      key={photo.id}
                                      onClick={() => setDrawerPhoto(photo)}
                                      className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0 hover:opacity-80 transition-opacity"
                                    >
                                      <img
                                        src={photo.thumbnail_url ?? photo.file_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  ))}
                                  {item.linkedPhotos.length > 4 && (
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-medium flex-shrink-0">
                                      +{item.linkedPhotos.length - 4}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                              {item.status === 'missing' && (
                                <button
                                  onClick={() => navigate(`../../jobs/${jobId}?category=${item.templateItem.category ?? ''}`)}
                                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                >
                                  <Camera size={12} />
                                  Add photo
                                </button>
                              )}
                              {item.status === 'needs_review' && (
                                <button
                                  onClick={() => item.linkedPhotos[0] && setDrawerPhoto(item.linkedPhotos[0])}
                                  className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                                >
                                  <Image size={12} />
                                  Review
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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

export default JobCamChecklist;
