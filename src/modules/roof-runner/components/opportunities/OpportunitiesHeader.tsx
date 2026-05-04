import { useState, useEffect } from 'react';
import { Grid3X3, List, Upload, Plus, Settings } from 'lucide-react';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import type { JobType } from '../../types/opportunities';
import { Button, Select, Tabs, Chip } from '../../../../shared/components/ui';

interface OpportunitiesHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedJobType: JobType | 'all';
  setSelectedJobType: (type: JobType | 'all') => void;
  onAddOpportunity: () => void;
  activeView?: 'opportunities' | 'pipelines';
  onViewChange?: (view: 'opportunities' | 'pipelines') => void;
  onAddPipeline?: () => void;
  internalView?: 'board' | 'list' | 'settings';
  onInternalViewChange?: (view: 'board' | 'list' | 'settings') => void;
}

export default function OpportunitiesHeader({
  activeTab: _activeTab,
  setActiveTab: _setActiveTab,
  selectedJobType,
  setSelectedJobType,
  onAddOpportunity,
  activeView = 'opportunities',
  onViewChange,
  onAddPipeline,
  internalView = 'board',
  onInternalViewChange,
}: OpportunitiesHeaderProps) {
  const [opportunityCounts, setOpportunityCounts] = useState<Record<JobType, number>>({
    Residential: 0,
    Commercial: 0,
    Insurance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunityCounts();
  }, []);

  const loadOpportunityCounts = async () => {
    try {
      setLoading(true);
      const counts = await opportunitiesApi.getOpportunityCountsByAllJobTypes();
      setOpportunityCounts(counts);
    } catch (error) {
      console.error('Error loading opportunity counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = Object.values(opportunityCounts).reduce((sum, count) => sum + count, 0);

  const getCurrentCount = () => {
    if (selectedJobType === 'all') return totalCount;
    return opportunityCounts[selectedJobType as JobType] || 0;
  };

  return (
    <header className="bg-surface-1 dark:bg-surface-d-1 border-b border-edge-soft dark:border-edge-d-soft sticky top-0 z-10">
      <div className="max-w-full mx-auto px-studio-page">
        {onViewChange && (
          <div className="pt-3">
            <Tabs<'opportunities' | 'pipelines'>
              value={activeView}
              onChange={onViewChange}
              items={[
                { id: 'opportunities', label: 'Opportunities' },
                { id: 'pipelines',     label: 'Pipelines' },
              ]}
              className="border-b-0"
            />
          </div>
        )}

        {activeView === 'opportunities' && (
          <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-[200px]">
                <Select<JobType | 'all'>
                  value={selectedJobType}
                  onChange={setSelectedJobType}
                  options={[
                    { value: 'all', label: 'All opportunities' },
                    { value: 'Residential', label: 'Residential' },
                    { value: 'Commercial', label: 'Commercial' },
                    { value: 'Insurance', label: 'Insurance' },
                  ]}
                />
              </div>
              <Chip>{loading ? '…' : getCurrentCount()}</Chip>

              <div className="h-6 w-px bg-edge-base dark:bg-edge-d-base" />

              {onInternalViewChange && (
                <Tabs<'board' | 'list' | 'settings'>
                  value={internalView}
                  onChange={onInternalViewChange}
                  items={[
                    { id: 'board',    label: 'Board view', icon: <Grid3X3 /> },
                    { id: 'list',     label: 'List view',  icon: <List /> },
                    { id: 'settings', label: 'Settings',   icon: <Settings /> },
                  ]}
                  className="border-b-0"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" leadingIcon={<Upload />}>
                Import
              </Button>
              <Button variant="primary" leadingIcon={<Plus />} onClick={onAddOpportunity}>
                Add Opportunity
              </Button>
            </div>
          </div>
        )}

        {activeView === 'pipelines' && onAddPipeline && (
          <div className="py-4 flex items-center justify-end">
            <Button variant="primary" leadingIcon={<Plus />} onClick={onAddPipeline}>
              Create Pipeline
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
