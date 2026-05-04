import { FileCheck, Sparkles } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { Card, CardBody, CardHeader } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { Button } from '../../../../shared/components/ui/Button';
import { OpenLegacyButton } from '../ProjectDrawer';
import { useNavigate, useParams } from 'react-router-dom';

export function ProjectProposalTab({ card }: { card: PipelineCard }) {
  const navigate = useNavigate();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params.orgSlug ?? 'dev-org';
  const hasProposal = Boolean(card.origin.proposalId);

  if (hasProposal) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Proposal attached"
            description={`Proposal ${card.origin.proposalId}`}
            actions={
              <Button
                variant="primary"
                trailingIcon={<FileCheck />}
                onClick={() => navigate(`/org/${orgSlug}/proposals/${card.origin.proposalId}`)}
              >
                Open in proposal builder
              </Button>
            }
          />
          <CardBody>
            <p className="studio-text-muted">
              Editing happens in the existing proposal builder. Status, signing, and revisions all
              flow through the unchanged endpoints.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <EmptyState
      icon={<FileCheck />}
      title="No proposal yet"
      description="Generate one with Sierra (uses the contact + measurement) or build manually."
      primaryAction={
        <Button
          variant="primary"
          leadingIcon={<Sparkles />}
          onClick={() => navigate(`/org/${orgSlug}/proposals/ai-generate`)}
        >
          Generate with AI
        </Button>
      }
      secondaryAction={<OpenLegacyButton to="proposals" label="Build manually" />}
    />
  );
}
