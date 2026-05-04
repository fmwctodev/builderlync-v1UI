import { Search, X } from 'lucide-react';
import type { PipelineFilters as Filters } from '../../../shared/lib/pipeline';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Switch } from '../../../shared/components/ui/Switch';
import { Select } from '../../../shared/components/ui/Select';

export interface PipelineFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
}

export function PipelineFiltersBar({ filters, onChange, onReset }: PipelineFiltersProps) {
  const dirty =
    filters.search !== '' ||
    filters.ownerName !== null ||
    filters.jobType !== null ||
    filters.minValue !== null ||
    filters.maxValue !== null ||
    filters.myProjectsOnly;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="w-[280px]">
        <Input
          leadingIcon={<Search />}
          placeholder="Search projects, contacts, addresses…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="w-[180px]">
        <Select<'residential' | 'commercial' | 'insurance' | '__all'>
          value={filters.jobType ?? '__all'}
          onChange={(v) => onChange({ ...filters, jobType: v === '__all' ? null : v })}
          options={[
            { value: '__all', label: 'All job types' },
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'insurance', label: 'Insurance' },
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={filters.myProjectsOnly}
          onChange={(v) => onChange({ ...filters, myProjectsOnly: v })}
          label="My projects only"
        />
        <span className="studio-text-body text-ink-2 dark:text-ink-d-2">My projects</span>
      </div>

      {dirty && (
        <Button variant="quiet" size="sm" leadingIcon={<X />} onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
