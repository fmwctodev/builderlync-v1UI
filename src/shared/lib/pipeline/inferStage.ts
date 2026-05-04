import type { Job } from '../../store/services/jobsApi';
import type { Proposal } from '../../store/services/proposalsApi';
import type { Invoice } from '../../store/services/paymentsApi';
import type { PipelineStage } from '../../tokens';

/**
 * Stage inference rules.
 *
 * Pure function — given the legacy records, produce a stage. UI-only; the
 * inferred stage is never written back to the database. If a contractor's
 * data doesn't match any rule cleanly, we fall back to `lead`.
 *
 * Tunable: edit this file to refine the rules without touching pages.
 */

const PRODUCTION_WORKFLOW_STAGES = new Set([
  'scheduled',
  'in_progress',
  'inspection',
  'punchlist',
  'materials_ordered',
]);

const CLOSED_WORKFLOW_STAGES = new Set([
  'closed',
  'completed',
  'cancelled',
  'lost',
  'won',
  'archived',
]);

export function inferStageForJob(
  job: Job,
  invoicesForCustomer: Invoice[],
  _proposals: Proposal[],
): PipelineStage {
  const stage = (job.workflowStages || '').toLowerCase().trim();

  if (CLOSED_WORKFLOW_STAGES.has(stage)) {
    return 'closed';
  }

  // Invoice exists with non-zero balance => invoice stage
  const hasOutstandingInvoice = invoicesForCustomer.some(
    (inv) => inv.amount > 0 && (inv.status === 'due' || inv.status === 'overdue' || inv.status === 'draft'),
  );
  const hasReceivedInvoice = invoicesForCustomer.some((inv) => inv.status === 'received');

  // Closed when all invoices are received AND no production is pending
  if (hasReceivedInvoice && !hasOutstandingInvoice && !PRODUCTION_WORKFLOW_STAGES.has(stage)) {
    return 'closed';
  }

  if (hasOutstandingInvoice) {
    return 'invoice';
  }

  if (PRODUCTION_WORKFLOW_STAGES.has(stage)) {
    return 'production';
  }

  // Default: a Job record exists => job stage
  return 'job';
}

export function inferStageForProposal(proposal: Proposal): PipelineStage {
  const status = (proposal.status || '').toLowerCase();

  if (status === 'archived') return 'closed';
  // 'completed' on a proposal typically means signed/won — but if no Job
  // exists yet, the contractor still has work to do to convert it.
  if (status === 'payments') return 'invoice';
  return 'proposal';
}

export function inferStageForLooseContact(): PipelineStage {
  // Contacts without any Job/Proposal/Measurement attached are leads.
  return 'lead';
}
