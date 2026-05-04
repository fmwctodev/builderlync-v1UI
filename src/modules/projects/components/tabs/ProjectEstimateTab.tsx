import { DollarSign } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { Card, CardBody, CardHeader } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { OpenLegacyButton } from '../ProjectDrawer';

export function ProjectEstimateTab({ card: _card }: { card: PipelineCard }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Instant Estimator"
          description="Templated estimates run from the existing estimator workspace."
        />
        <CardBody>
          <p className="studio-text-muted">
            The estimator stays in its current workspace — no data has changed. Open it below to
            run a templated quote for this contact, or convert directly to a proposal.
          </p>
        </CardBody>
      </Card>

      <EmptyState
        inline
        icon={<DollarSign />}
        title="No estimate yet"
        description="Run the Instant Estimator to generate a quick quote that can be promoted to a proposal."
        primaryAction={<OpenLegacyButton to="instant-estimator" label="Open Instant Estimator" />}
      />
    </div>
  );
}
