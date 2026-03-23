import { supabase } from '../../../shared/lib/supabase';
import type {
  ProposalAuditEvent,
  ProposalAuditEventType,
} from '../types/proposalIntegration';

export interface AuditEventResponse {
  success: boolean;
  data?: ProposalAuditEvent;
  message?: string;
}

export interface AuditEventsResponse {
  success: boolean;
  data: ProposalAuditEvent[];
  message?: string;
}

export async function logAuditEvent(
  proposalId: string,
  organizationId: string,
  eventType: ProposalAuditEventType,
  metadata: Record<string, unknown> = {},
  estimateSnapshotId?: string
): Promise<AuditEventResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('proposal_audit_trail')
      .insert({
        proposal_id: proposalId,
        organization_id: organizationId,
        event_type: eventType,
        user_id: user?.id ?? null,
        estimate_snapshot_id: estimateSnapshotId ?? null,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as ProposalAuditEvent };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to log audit event';
    console.error('Error logging audit event:', error);
    return { success: false, message };
  }
}

export async function getAuditTrail(
  proposalId: string,
  organizationId: string
): Promise<AuditEventsResponse> {
  try {
    const { data, error } = await supabase
      .from('proposal_audit_trail')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: (data ?? []) as ProposalAuditEvent[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch audit trail';
    console.error('Error fetching audit trail:', error);
    return { success: false, data: [], message };
  }
}

export async function getRecentEvents(
  proposalId: string,
  organizationId: string,
  limit = 10
): Promise<AuditEventsResponse> {
  try {
    const { data, error } = await supabase
      .from('proposal_audit_trail')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data ?? []) as ProposalAuditEvent[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recent events';
    console.error('Error fetching recent events:', error);
    return { success: false, data: [], message };
  }
}

export async function getEventsByType(
  proposalId: string,
  organizationId: string,
  eventType: ProposalAuditEventType
): Promise<AuditEventsResponse> {
  try {
    const { data, error } = await supabase
      .from('proposal_audit_trail')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('organization_id', organizationId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: (data ?? []) as ProposalAuditEvent[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch events by type';
    console.error('Error fetching events by type:', error);
    return { success: false, data: [], message };
  }
}
