import { supabase } from '../../../shared/lib/supabase';

export interface OrgProposalTemplate {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
}

export async function getProposalTemplatesByOrg(organizationId: string): Promise<OrgProposalTemplate[]> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('id, name, description, is_default')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data as OrgProposalTemplate[];
}
