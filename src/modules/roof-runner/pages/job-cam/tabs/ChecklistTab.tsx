import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckSquare, Camera, ChevronDown, ChevronRight,
  RefreshCw, Plus, AlertTriangle
} from 'lucide-react';
import {
  fetchTemplates, fetchTemplateById,
} from '../../../services/jobCamApi';
import type {
  JobCamTemplate, JobCamTemplateItem, JobPhoto, PhotoCategory
} from '../../../types/jobCam';
import EmptyStateActionCard from '../../../components/job-cam/EmptyStateActionCard';

interface Props {
  jobId: number;
  photos: JobPhoto[];
}

const categoryColor: Record<string, string> = {
  before: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  during: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  after: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  damage: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  completion: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  claim: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const ChecklistTab: React.FC<Props> = ({ jobId, photos }) => {
  const [templates, setTemplates] = useState<JobCamTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<JobCamTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates('shotlist');
      setTemplates(data);
      if (data.length > 0) {
        const full = await fetchTemplateById(data[0].id);
        setSelectedTemplate(full);
        if (full?.items) {
          const categories = new Set(full.items.map(i => i.category).filter(Boolean));
          setExpandedSections(categories as Set<string>);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSelectTemplate = async (id: string) => {
    const full = await fetchTemplateById(id);
    setSelectedTemplate(full);
    if (full?.items) {
      const categories = new Set(full.items.map(i => i.category).filter(Boolean));
      setExpandedSections(categories as Set<string>);
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyStateActionCard
        icon={CheckSquare}
        title="No checklists available"
        description="Create a shot list template to track required photos for this job type."
        actionLabel="Manage Templates"
        onAction={() => {}}
      />
    );
  }

  const items = selectedTemplate?.items ?? [];
  const groupedByCategory = items.reduce<Record<string, JobCamTemplateItem[]>>((acc, item) => {
    const key = item.category ?? 'uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getItemStatus = (item: JobCamTemplateItem) => {
    const matching = photos.filter(p =>
      p.category === item.category &&
      (item.description ? p.description?.toLowerCase().includes(item.name.toLowerCase()) : true)
    );
    if (matching.length > 0) return 'complete';
    if (item.is_required) return 'missing';
    return 'optional';
  };

  const completedCount = items.filter(i => getItemStatus(i) === 'complete').length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {templates.length > 1 && (
            <select
              value={selectedTemplate?.id ?? ''}
              onChange={e => handleSelectTemplate(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount}/{items.length} completed
          </span>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
        </div>
      </div>

      {Object.entries(groupedByCategory).map(([category, categoryItems]) => {
        const catCompleted = categoryItems.filter(i => getItemStatus(i) === 'complete').length;
        const isExpanded = expandedSections.has(category);

        return (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection(category)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${categoryColor[category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {category}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {catCompleted}/{categoryItems.length}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-700/50">
                {categoryItems.map(item => {
                  const status = getItemStatus(item);
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                        status === 'complete'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : status === 'missing'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {status === 'complete' ? (
                          <CheckSquare size={14} className="text-green-600 dark:text-green-400" />
                        ) : status === 'missing' ? (
                          <AlertTriangle size={14} className="text-red-500 dark:text-red-400" />
                        ) : (
                          <Camera size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${status === 'complete' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      {item.is_required && status !== 'complete' && (
                        <span className="text-xs text-red-500 font-medium">Required</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChecklistTab;
