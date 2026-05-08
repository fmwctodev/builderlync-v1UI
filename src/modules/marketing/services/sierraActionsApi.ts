import { supabase } from '../../../shared/lib/supabase';
import type { SierraAction, SierraRecommendation, RecommendationType } from '../types/marketing';
import { isStagingMode } from '../../../shared/utils/stagingAuth';
import { DEMO_SIERRA_RECOMMENDATIONS } from '../../../shared/utils/demoFixtures';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

// Map our flat DEMO_SIERRA_RECOMMENDATIONS shape onto the SierraAction /
// SierraRecommendation interfaces the components expect.
const buildStagingActions = (): SierraAction[] =>
  DEMO_SIERRA_RECOMMENDATIONS.map((r) => ({
    id: r.id,
    org_id: DEMO_ORG_ID,
    recommendation_id: r.id,
    type: r.type as RecommendationType,
    title: r.title,
    rationale: r.reasoning,
    expected_impact: r.impact_label,
    confidence_score: r.confidence,
    linked_entities: [],
    approval_state: r.status === 'completed' ? 'approved' : r.status === 'pending' ? 'pending' : 'rejected',
    execution_state: r.status === 'completed' ? 'completed' : 'pending',
    executed_at: r.status === 'completed' ? r.created_at : undefined,
    result_summary: r.status === 'completed' ? r.summary : undefined,
    can_rollback: false,
    created_at: r.created_at,
  }));

const buildStagingRecommendations = (): SierraRecommendation[] =>
  DEMO_SIERRA_RECOMMENDATIONS.filter((r) => r.status === 'pending').map((r) => ({
    id: r.id,
    org_id: DEMO_ORG_ID,
    type: r.type as RecommendationType,
    title: r.title,
    rationale: r.reasoning,
    expected_impact: r.impact_label,
    confidence_score: r.confidence,
    linked_entities: [],
    status: 'active',
    created_at: r.created_at,
  }));

function rowToAction(row: Record<string, unknown>): SierraAction {
  return {
    id: row.id as string,
    org_id: row.organization_id as string,
    recommendation_id: row.recommendation_id as string | undefined,
    type: row.type as RecommendationType,
    title: row.title as string,
    rationale: row.rationale as string,
    expected_impact: row.expected_impact as string,
    confidence_score: (row.confidence_score as number) ?? 0,
    linked_entities: (row.linked_entities as SierraAction['linked_entities']) ?? [],
    approval_state: (row.approval_state as SierraAction['approval_state']) ?? 'pending',
    execution_state: (row.execution_state as SierraAction['execution_state']) ?? 'pending',
    executed_at: row.executed_at as string | undefined,
    result_summary: row.result_summary as string | undefined,
    can_rollback: (row.can_rollback as boolean) ?? false,
    created_at: row.created_at as string,
  };
}

function rowToRecommendation(row: Record<string, unknown>): SierraRecommendation {
  return {
    id: row.id as string,
    org_id: row.organization_id as string,
    type: row.type as RecommendationType,
    title: row.title as string,
    rationale: row.rationale as string,
    expected_impact: row.expected_impact as string,
    confidence_score: (row.confidence_score as number) ?? 0,
    linked_entities: (row.linked_entities as SierraRecommendation['linked_entities']) ?? [],
    status: (row.status as SierraRecommendation['status']) ?? 'active',
    created_at: row.created_at as string,
  };
}

export const sierraActionsApi = {
  async getActions(orgId: string | null): Promise<SierraAction[]> {
    if (isStagingMode()) return buildStagingActions();
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('sierra_marketing_actions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToAction);
  },

  async getRecommendations(orgId: string | null): Promise<SierraRecommendation[]> {
    if (isStagingMode()) return buildStagingRecommendations();
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('sierra_marketing_recommendations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToRecommendation);
  },

  async approveAction(id: string, orgId: string | null): Promise<SierraAction> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('sierra_marketing_actions')
      .update({
        approval_state: 'approved',
        execution_state: 'completed',
        executed_at: new Date().toISOString(),
        result_summary: 'Action approved and executed.',
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return rowToAction(data);
  },

  async rejectAction(id: string, orgId: string | null): Promise<SierraAction> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('sierra_marketing_actions')
      .update({ approval_state: 'rejected' })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return rowToAction(data);
  },

  async snoozeAction(id: string, orgId: string | null): Promise<SierraAction> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('sierra_marketing_actions')
      .update({ approval_state: 'snoozed' })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();
    if (error) throw error;
    return rowToAction(data);
  },

  async dismissRecommendation(id: string, orgId: string | null): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('sierra_marketing_recommendations')
      .update({ status: 'dismissed' })
      .eq('id', id)
      .eq('organization_id', organizationId);
    if (error) throw error;
  },
};
