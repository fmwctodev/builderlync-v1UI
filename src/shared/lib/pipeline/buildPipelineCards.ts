import type { Job } from '../../store/services/jobsApi';
import type { Proposal } from '../../store/services/proposalsApi';
import type { Invoice } from '../../store/services/paymentsApi';
import type { Contact } from '../../store/services/contactsApi';
import type { PipelineCard } from './types';
import { inferStageForJob, inferStageForProposal, inferStageForLooseContact } from './inferStage';

interface BuildInputs {
  jobs: Job[];
  proposals: Proposal[];
  invoices: Invoice[];
  contacts: Contact[];
}

/**
 * Pure builder: legacy records -> PipelineCard[].
 *
 * Card identity is keyed by the legacy origin record (`job:108`, `proposal:42`,
 * `oppty:7`) — we do NOT merge by contact + address. If the underlying data
 * has duplicates, they show up as duplicate cards (same as the legacy pages
 * today). The drawer can `attachMeasurement`-style link related records via
 * the existing slice actions when the user takes action.
 *
 * Stage precedence: a Job that has a Proposal still produces a Job card —
 * the orphan Proposal does NOT also produce a Proposal card. This keeps the
 * pipeline from double-counting one project.
 */
export function buildPipelineCards({ jobs, proposals, invoices, contacts }: BuildInputs): PipelineCard[] {
  const cards: PipelineCard[] = [];
  const seenContactIds = new Set<string>();
  const proposalIdsAttachedToJob = new Set<string>();

  const contactById = new Map<string, Contact>();
  for (const c of contacts) contactById.set(c.id, c);

  // Group invoices by customer for stage inference
  const invoicesByCustomer = new Map<string, Invoice[]>();
  for (const inv of invoices) {
    const cid = inv.customer_id ?? '';
    if (!cid) continue;
    const list = invoicesByCustomer.get(cid) ?? [];
    list.push(inv);
    invoicesByCustomer.set(cid, list);
  }

  // 1) Jobs are the highest-priority cards. They subsume their linked Proposals.
  for (const job of jobs) {
    const contactId = job.contactId ? String(job.contactId) : null;
    const contact = contactId ? contactById.get(contactId) ?? null : null;

    const customerKey = contact?.id ?? '';
    const customerInvoices = invoicesByCustomer.get(customerKey) ?? [];
    // Only proposals explicitly linked to THIS job get folded into the job
    // card. Customer-level matching produced false positives that hid valid
    // standalone proposals as the same customer's repeat work.
    const jobProposals = proposals.filter((p) => p.job_id === job.id);
    for (const p of jobProposals) {
      if (p.id) proposalIdsAttachedToJob.add(p.id);
    }

    const stage = inferStageForJob(job, customerInvoices, jobProposals);
    const linkedInvoice = customerInvoices[0];

    cards.push({
      cardKey: `job:${job.id}`,
      origin: {
        jobId: job.id,
        proposalId: jobProposals[0]?.id,
        invoiceId: linkedInvoice?.id,
        contactId: contact?.id,
      },
      title: job.name || 'Untitled job',
      contactName: contact?.full_name ?? job.contactName ?? '—',
      contactId: contact?.id ?? null,
      address: contact?.address ?? job.location ?? '',
      estimatedValue: Number(job.jobValue ?? 0),
      currentStage: stage,
      ownerName: job.jobOwner ?? null,
      ownerInitials: deriveInitials(job.jobOwner),
      daysInStage: daysSince(job.updatedAt ?? job.createdAt),
      stageBadge: stageBadgeForJob(job, customerInvoices, jobProposals),
      source: job.source,
      jobType: job.jobType,
      updatedAt: job.updatedAt ?? job.createdAt,
    });

    if (contact?.id) seenContactIds.add(contact.id);
  }

  // 2) Orphan proposals — proposal records not yet attached to a Job.
  for (const proposal of proposals) {
    if (proposal.id && proposalIdsAttachedToJob.has(proposal.id)) continue;
    const contact = proposal.customer_id ? contactById.get(proposal.customer_id) ?? null : null;
    const stage = inferStageForProposal(proposal);

    cards.push({
      cardKey: `proposal:${proposal.id}`,
      origin: {
        proposalId: proposal.id,
        contactId: contact?.id,
      },
      title: proposal.title || 'Untitled proposal',
      contactName: contact?.full_name ?? '—',
      contactId: contact?.id ?? null,
      address: contact?.address ?? '',
      estimatedValue: Number(proposal.value ?? 0),
      currentStage: stage,
      ownerName: proposal.created_by ?? null,
      ownerInitials: deriveInitials(proposal.created_by),
      daysInStage: daysSince(proposal.date_modified ?? proposal.created_at),
      stageBadge: stageBadgeForProposal(proposal),
      updatedAt: proposal.date_modified ?? proposal.created_at ?? new Date().toISOString(),
    });

    if (contact?.id) seenContactIds.add(contact.id);
  }

  // 3) Loose contacts (leads) — contacts not yet attached to a Job or Proposal.
  for (const contact of contacts) {
    if (seenContactIds.has(contact.id)) continue;
    cards.push({
      cardKey: `oppty:${contact.id}`,
      origin: {
        contactId: contact.id,
      },
      title: contact.full_name || 'New lead',
      contactName: contact.full_name,
      contactId: contact.id,
      address: contact.address ?? '',
      estimatedValue: 0,
      currentStage: inferStageForLooseContact(),
      ownerName: null,
      ownerInitials: null,
      daysInStage: daysSince(contact.updated_at ?? contact.created_at),
      updatedAt: contact.updated_at ?? contact.created_at ?? new Date().toISOString(),
    });
  }

  return cards;
}

// ---------- helpers ----------

function daysSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  const days = Math.max(0, Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24)));
  return days;
}

function deriveInitials(name: string | null | undefined): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function stageBadgeForJob(job: Job, invoices: Invoice[], _proposals: Proposal[]): string | undefined {
  const stage = (job.workflowStages || '').toLowerCase();
  const overdue = invoices.find((i) => i.status === 'overdue');
  if (overdue) return 'Invoice overdue';
  if (stage === 'in_progress') return 'In progress';
  if (stage === 'punchlist') return 'Punchlist';
  if (stage === 'inspection') return 'Inspection';
  if (job.proposalsId) return 'Proposal attached';
  return undefined;
}

function stageBadgeForProposal(p: Proposal): string | undefined {
  if (p.status === 'waiting') return 'Awaiting signature';
  if (p.status === 'completed') return 'Signed';
  if (p.status === 'draft') return 'Draft';
  return undefined;
}
