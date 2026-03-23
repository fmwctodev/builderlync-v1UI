import { supabase } from '../../../shared/lib/supabase';
import type {
  GenerateAiProposalRequest,
  GenerateAiProposalResponse,
} from '../types/aiProposal';
import { updateProposal } from './proposalsNewApi';
import type { ProposalContent, ProposalSection } from '../types/proposalIntegration';

export async function generateAiProposal(
  request: GenerateAiProposalRequest
): Promise<GenerateAiProposalResponse> {
  const { data, error } = await supabase.functions.invoke('proposal-ai-generate', {
    body: request,
  });

  if (error) {
    return {
      success: false,
      sections_generated: 0,
      sections: [],
      error: { message: error.message ?? 'Failed to generate proposal sections' },
    };
  }

  return data as GenerateAiProposalResponse;
}

export async function applyAiSectionsToProposal(
  proposalId: string,
  organizationId: string,
  sections: ProposalSection[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data: existing } = await supabase
      .from('proposals')
      .select('content')
      .eq('id', proposalId)
      .maybeSingle();

    const existingContent = (existing?.content as ProposalContent) ?? {};
    const existingSections = existingContent.sections ?? [];

    const merged = [...existingSections, ...sections];

    const result = await updateProposal(proposalId, organizationId, {
      content: { ...existingContent, sections: merged } as ProposalContent,
    });

    return { success: result.success, message: result.message };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to apply sections';
    return { success: false, message };
  }
}
