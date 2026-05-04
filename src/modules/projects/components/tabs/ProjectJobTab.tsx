import { HardHat } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { Card, CardBody, CardHeader } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { Button } from '../../../../shared/components/ui/Button';
import { OpenLegacyButton } from '../ProjectDrawer';
import { useNavigate, useParams } from 'react-router-dom';

export function ProjectJobTab({ card }: { card: PipelineCard }) {
  const navigate = useNavigate();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params.orgSlug ?? 'dev-org';
  const hasJob = Boolean(card.origin.jobId);

  if (hasJob) {
    return (
      <Card>
        <CardHeader
          title="Job linked"
          description={`Job #${card.origin.jobId}`}
          actions={
            <Button
              variant="primary"
              onClick={() => navigate(`/org/${orgSlug}/job-cam/jobs/${card.origin.jobId}`)}
            >
              Open in Job Cam
            </Button>
          }
        />
        <CardBody>
          <p className="studio-text-muted">
            The full job workspace — checklist, files, photos, reports, activity — is the existing
            JobDetailWorkspace. No data has been moved or copied.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <EmptyState
      icon={<HardHat />}
      title="No job yet"
      description="Convert a signed proposal to a job, or create one directly."
      primaryAction={<OpenLegacyButton to="jobs" label="Open jobs" />}
    />
  );
}
