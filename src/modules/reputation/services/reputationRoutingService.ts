import { supabase } from '../../../shared/lib/supabase';
import type { ReputationRoutingRule, RoutingRuleFormValues } from '../types';

export async function listRules(orgId: string): Promise<ReputationRoutingRule[]> {
  const { data, error } = await supabase
    .from('reputation_routing_rules')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch routing rules: ${error.message}`);
  }

  return (data ?? []) as ReputationRoutingRule[];
}

export async function createRule(
  orgId: string,
  rule: RoutingRuleFormValues
): Promise<ReputationRoutingRule> {
  const { data, error } = await supabase
    .from('reputation_routing_rules')
    .insert({ org_id: orgId, ...rule })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create routing rule: ${error.message}`);
  }

  return data as ReputationRoutingRule;
}

export async function updateRule(
  id: string,
  rule: Partial<RoutingRuleFormValues>
): Promise<ReputationRoutingRule> {
  const { data, error } = await supabase
    .from('reputation_routing_rules')
    .update(rule)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update routing rule: ${error.message}`);
  }

  return data as ReputationRoutingRule;
}

export async function deleteRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('reputation_routing_rules')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete routing rule: ${error.message}`);
  }
}
