import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckSquare, Camera, ChevronDown,
  RefreshCw, AlertTriangle, Settings, Play
} from 'lucide-react';
import {
  fetchTemplates, fetchJobShotlist, createJobShotlist
} from '../../../services/jobCamApi';
import type {
  JobCamTemplate, JobPhoto, JobFile
} from '../../../types/jobCam';
import EmptyStateActionCard from '../../../components/job-cam/EmptyStateActionCard';

interface Props {
  jobId: number;
  photos: JobPhoto[];
  files?: JobFile[];
}

const statusColors: Record<string, string> = {
  complete: 'bg-green-50 dark:bg-green-900/20 shadow-sm border border-green-100 dark:border-green-800',
  missing: 'bg-red-50 dark:bg-red-900/20 shadow-sm border border-red-100 dark:border-red-800',
  pending: 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
};

const categoryColor: Record<string, string> = {
  before: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  during: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  after: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  damage: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-primary-300',
  completion: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  claim: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const ChecklistTab: React.FC<Props> = ({ jobId }) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  
  const [shotlist, setShotlist] = useState<any>(null);
  const [templates, setTemplates] = useState<JobCamTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Try to fetch existing shotlist
      const activeShotlist = await fetchJobShotlist(jobId);
      
      if (activeShotlist) {
        setShotlist(activeShotlist);
        // Expand categories that have items
        if (activeShotlist.items) {
          const categories = new Set(activeShotlist.items.map((i: any) => i.category || i.section_name).filter(Boolean));
          setExpandedSections(categories as Set<string>);
        }
      } else {
        // 2. If no shotlist, load templates
        const data = await fetchTemplates('shotlist');
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
        }
      }
    } catch (e) {
      console.error('[ChecklistTab] load error:', e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const handleStartChecklist = async () => {
    if (!selectedTemplateId) return;
    setStarting(true);
    try {
      const template = templates.find(t => t.id === selectedTemplateId);
      await createJobShotlist(jobId, template?.name || 'Job Checklist', selectedTemplateId);
      await load();
    } catch (e) {
      console.error('[ChecklistTab] create error:', e);
    } finally {
      setStarting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
        <RefreshCw size={24} className="animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest">Loading Checklist...</span>
      </div>
    );
  }

  // --- State: No Checklist Active ---
  if (!shotlist) {
    return (
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckSquare size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Initialize Job Checklist</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 px-4">
              Standardize your job documentation by starting a checklist. Choose a template to begin tracking required photos and milestones.
            </p>

            {templates.length > 0 ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Select Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleStartChecklist}
                  disabled={starting || !selectedTemplateId}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 disabled:opacity-50 transition-all"
                >
                  {starting ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                  {starting ? 'Creating...' : 'Start Checklist'}
                </button>
                
                <button
                  onClick={() => navigate(`/org/${orgSlug}/job-cam/templates`)}
                  className="text-xs font-bold text-gray-400 hover:text-primary-500 transition-colors uppercase tracking-widest"
                >
                  Manage Templates
                </button>
              </div>
            ) : (
              <EmptyStateActionCard
                icon={Settings}
                title="No Templates Defined"
                description="You must create a shotlist template before you can start a checklist for this job."
                actionLabel="Go to Template Manager"
                onAction={() => navigate(`/org/${orgSlug}/job-cam/templates`)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- State: Active Checklist ---
  const items = shotlist.items || [];
  const groupedByCategory = (items as any[]).reduce((acc: Record<string, any[]>, item: any) => {
    const key = item.category || item.section_name || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const completedCount = items.filter((i: any) => i.status === 'complete').length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{shotlist.name}</h2>
              <button
                onClick={() => navigate(`/org/${orgSlug}/job-cam/templates`)}
                className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                title="Template Settings"
              >
                <Settings size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Standardized Shotlist Workflow</p>
          </div>
          
          <div className="flex flex-col items-end gap-2 pr-2 border-l border-gray-100 dark:border-gray-700 pl-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {completedCount}/{items.length} COMPLETED
              </span>
              <span className="text-lg font-black text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {(Object.entries(groupedByCategory) as [string, any[]][]).map(([category, categoryItems]) => {
            const catCompleted = categoryItems.filter((i: any) => i.status === 'complete').length;
            const isExpanded = expandedSections.has(category);

            return (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-1.5 rounded-lg transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                      <ChevronDown size={14} className="text-gray-400" />
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm ${categoryColor[category] ?? 'bg-gray-100 text-gray-500'}`}>
                      {category}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white tracking-tight">
                      {categoryItems.length} TASK{categoryItems.length !== 1 ? 'S' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2" />
                    <span className="text-xs font-black text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      {catCompleted} / {categoryItems.length} DONE
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700/50 divide-y divide-gray-50 dark:divide-gray-700/30 bg-gray-50/50 dark:bg-gray-900/10">
                    {categoryItems.map((item: any) => {
                      const status = item.status === 'complete' ? 'complete' : (item.is_required ? 'missing' : 'pending');
                      return (
                        <div key={item.id} className="group flex items-center gap-5 px-8 py-5 hover:bg-white dark:hover:bg-gray-800/80 transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${statusColors[status]}`}>
                            {status === 'complete' ? (
                              <CheckSquare size={18} className="text-green-600 dark:text-green-400" />
                            ) : status === 'missing' ? (
                              <AlertTriangle size={18} className="text-red-500 dark:text-red-400" />
                            ) : (
                              <Camera size={18} className="text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold tracking-tight ${status === 'complete' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                              {item.title}
                            </p>
                            {item.instructions && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.instructions}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {item.linked_media_count > 0 && (
                              <div className="flex -space-x-2">
                                <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md">
                                  {item.linked_media_count} PHOTO{item.linked_media_count > 1 ? 'S' : ''}
                                </span>
                              </div>
                            )}
                            
                            {item.is_required && status !== 'complete' && (
                              <span className="text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-md font-black uppercase tracking-widest border border-red-200/50 dark:border-red-900/50">Required</span>
                            )}
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
      </div>
    </div>
  );
};

export default ChecklistTab;
