import { Clipboard } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { Card, CardBody, CardHeader } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { OpenLegacyButton } from '../ProjectDrawer';

export function ProjectProductionTab({ card }: { card: PipelineCard }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Production"
          description="Work orders, material orders, and the on-site Job Cam workspace stay in their existing pages."
        />
        <CardBody>
          <p className="studio-text-muted">
            Production status is tracked via the job&apos;s <code className="font-mono">workflowStages</code>{' '}
            field. The pipeline reads it; nothing here writes back.
          </p>
        </CardBody>
      </Card>

      {card.origin.jobId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OpenLegacyButton to="work-orders" label="Open work orders" />
          <OpenLegacyButton to="material-orders" label="Open material orders" />
          <OpenLegacyButton to={`job-cam/jobs/${card.origin.jobId}`} label="Open Job Cam" />
        </div>
      ) : (
        <EmptyState
          inline
          icon={<Clipboard />}
          title="No production work yet"
          description="Convert a signed proposal to a job to start scheduling crews."
        />
      )}
    </div>
  );
}
