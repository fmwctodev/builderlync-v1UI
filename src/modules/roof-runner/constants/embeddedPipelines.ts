import type { JobType } from '../types/opportunities';
import { Home, Building2, Shield } from 'lucide-react';

export const EMBEDDED_PIPELINE_IDS = {
  RESIDENTIAL: '00000000-0000-0000-0000-000000000001',
  COMMERCIAL: '00000000-0000-0000-0000-000000000002',
  INSURANCE: '00000000-0000-0000-0000-000000000003',
} as const;

export const EMBEDDED_PIPELINE_TYPES: JobType[] = ['Residential', 'Commercial', 'Insurance'];

export const EMBEDDED_PIPELINE_COLORS: Record<JobType, string> = {
  Residential: '#10b981',
  Commercial: '#2563eb',
  Insurance: '#ea580c',
};

export const EMBEDDED_PIPELINE_ICONS = {
  Residential: Home,
  Commercial: Building2,
  Insurance: Shield,
};

export const EMBEDDED_PIPELINE_NAMES: Record<JobType, string> = {
  Residential: 'Residential',
  Commercial: 'Commercial',
  Insurance: 'Insurance',
};

export const DEFAULT_PIPELINE_STAGES = [
  { name: 'New Lead', order_position: 0, color: '#dc2626', include_in_funnel: true, include_in_distribution: true },
  { name: 'Follow-Up 1', order_position: 1, color: '#2563eb', include_in_funnel: true, include_in_distribution: true },
  { name: 'Follow-Up 2', order_position: 2, color: '#eab308', include_in_funnel: true, include_in_distribution: true },
  { name: 'Follow-Up 3', order_position: 3, color: '#16a34a', include_in_funnel: true, include_in_distribution: true },
  { name: 'Long Term Follow Up', order_position: 4, color: '#9333ea', include_in_funnel: true, include_in_distribution: true },
  { name: 'In Convo', order_position: 5, color: '#10b981', include_in_funnel: true, include_in_distribution: true },
  { name: 'Inspection/Estimate Booked (Creates Job)', order_position: 6, color: '#059669', include_in_funnel: true, include_in_distribution: true },
  { name: 'Job Qualified', order_position: 7, color: '#6366f1', include_in_funnel: true, include_in_distribution: true },
  { name: 'Job Unqualified', order_position: 8, color: '#ef4444', include_in_funnel: true, include_in_distribution: true },
];

export function getEmbeddedPipelineId(jobType: JobType): string {
  switch (jobType) {
    case 'Residential':
      return EMBEDDED_PIPELINE_IDS.RESIDENTIAL;
    case 'Commercial':
      return EMBEDDED_PIPELINE_IDS.COMMERCIAL;
    case 'Insurance':
      return EMBEDDED_PIPELINE_IDS.INSURANCE;
    default:
      return EMBEDDED_PIPELINE_IDS.COMMERCIAL;
  }
}

export function isEmbeddedPipeline(pipelineId: string): boolean {
  return Object.values(EMBEDDED_PIPELINE_IDS).includes(pipelineId as any);
}

export function canDeletePipeline(pipelineId: string): boolean {
  return !isEmbeddedPipeline(pipelineId);
}

export function getJobTypeFromPipelineId(pipelineId: string): JobType | null {
  switch (pipelineId) {
    case EMBEDDED_PIPELINE_IDS.RESIDENTIAL:
      return 'Residential';
    case EMBEDDED_PIPELINE_IDS.COMMERCIAL:
      return 'Commercial';
    case EMBEDDED_PIPELINE_IDS.INSURANCE:
      return 'Insurance';
    default:
      return null;
  }
}

export function getEmbeddedPipelineStages() {
  return [...DEFAULT_PIPELINE_STAGES];
}
