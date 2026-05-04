import React from 'react';
import { Search, Filter, Grid, List, Settings } from 'lucide-react';
import NewButtonDropdown from './NewButtonDropdown';
import { Input, Button, Select, Tabs } from '../../../shared/components/ui';

interface JobsHeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedJobType: string;
  setSelectedJobType: (type: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onNewJob: () => void;
  onNewReport: () => void;
  onNewCustomer: () => void;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  selectedJobType,
  setSelectedJobType,
  showFilters,
  setShowFilters,
  onNewJob,
  onNewReport,
  onNewCustomer
}) => {
  return (
    <div className="bg-surface-1 dark:bg-surface-d-1 border-b border-edge-soft dark:border-edge-d-soft px-studio-page py-5 flex-shrink-0">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="studio-text-label mb-1">Workspace</div>
          <h1 className="studio-text-title-1">Jobs</h1>
        </div>
        <NewButtonDropdown
          onNewJob={onNewJob}
          onNewReport={onNewReport}
          onNewCustomer={onNewCustomer}
        />
      </div>

      <div className="flex items-center gap-5 mb-4">
        <div className="w-[200px]">
          <Select<string>
            value={selectedJobType}
            onChange={setSelectedJobType}
            options={[
              { value: 'all', label: 'All jobs' },
              { value: 'residential', label: 'Residential' },
              { value: 'commercial', label: 'Commercial' },
              { value: 'insurance', label: 'Insurance' },
            ]}
          />
        </div>

        <div className="h-6 w-px bg-edge-base dark:bg-edge-d-base" />

        <Tabs<string>
          value={activeView}
          onChange={setActiveView}
          items={[
            { id: 'board',    label: 'Board view', icon: <Grid /> },
            { id: 'list',     label: 'List view',  icon: <List /> },
            { id: 'settings', label: 'Settings',   icon: <Settings /> },
          ]}
          className="border-b-0"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-96">
          <Input
            leadingIcon={<Search />}
            placeholder="Search jobs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-56">
          <Select<string>
            value={selectedFilter}
            onChange={setSelectedFilter}
            options={[
              { value: 'default',  label: 'Default' },
              { value: 'awaiting', label: 'Awaiting Adjuster Inspection' },
            ]}
          />
        </div>
        <Button
          variant="secondary"
          leadingIcon={<Filter />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </div>
    </div>
  );
};

export default JobsHeader;
