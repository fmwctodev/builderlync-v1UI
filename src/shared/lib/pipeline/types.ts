import type { PipelineStage } from '../../tokens';

export type { PipelineStage };

/**
 * Pipeline card — UI-only view-model, NEVER persisted.
 *
 * Derived from existing data sources (jobs, proposals, invoices, contacts).
 * The `origin` block holds the back-pointers to legacy records so the
 * Project drawer can load existing page bodies without joining a new entity.
 */
export interface PipelineCard {
  /** Stable synthetic id, e.g. `job:108`, `proposal:42`, `oppty:7`. */
  cardKey: string;

  /** Pointers back to legacy records this card represents. */
  origin: {
    jobId?: number;
    proposalId?: string;
    invoiceId?: string;
    contactId?: string;
    measurementOrderId?: number;
    /** Free-form additional source ids the drawer may need. */
    [key: string]: string | number | undefined;
  };

  // Display-only — derived live from existing slices/fixtures.
  title: string;
  contactName: string;
  contactId: string | null;
  address: string;
  estimatedValue: number;
  currentStage: PipelineStage;
  ownerName: string | null;
  ownerInitials: string | null;
  daysInStage: number;
  /** Stage-specific badge — e.g. "Sent 3d", "EagleView pending", "Signed". */
  stageBadge?: string;
  /** Source — "Storm", "Web form", "Referral", etc. */
  source?: string;
  jobType?: 'residential' | 'commercial' | 'insurance' | string;
  tags?: string[];
  /** Timestamp the card last changed (used for sort, "updated 3d ago"). */
  updatedAt: string;
}

/**
 * Filter state for the Pipeline view.
 * Lives in component-local state (no slice) so navigating away resets it.
 */
export interface PipelineFilters {
  ownerName: string | null;
  jobType: 'residential' | 'commercial' | 'insurance' | null;
  minValue: number | null;
  maxValue: number | null;
  search: string;
  /** Stages to render. Default = all 8. */
  stages: PipelineStage[];
  /** Show only cards owned by the current user. */
  myProjectsOnly: boolean;
}

export const DEFAULT_FILTERS: PipelineFilters = {
  ownerName: null,
  jobType: null,
  minValue: null,
  maxValue: null,
  search: '',
  stages: [
    'lead',
    'booked_estimate',
    'measurement',
    'proposal',
    'job',
    'production',
    'invoice',
    'closed',
  ],
  myProjectsOnly: false,
};
