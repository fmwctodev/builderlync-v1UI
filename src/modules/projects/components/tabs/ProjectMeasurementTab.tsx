import { Ruler } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { Card, CardBody, CardHeader } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { OpenLegacyButton } from '../ProjectDrawer';

export function ProjectMeasurementTab({ card }: { card: PipelineCard }) {
  const hasMeasurement = Boolean(card.origin.measurementOrderId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Measurements"
          description="EagleView orders and DIY measurements stay in the existing workspace."
        />
        <CardBody>
          <p className="studio-text-muted">
            The Measurements module owns its own context provider and EagleView integration. Order
            placement, payment, and report retrieval all run through their existing flows — this
            tab just frames them.
          </p>
        </CardBody>
      </Card>

      {hasMeasurement ? (
        <Card>
          <CardHeader title="Linked order" description={`Order ${card.origin.measurementOrderId}`} />
          <CardBody>
            <OpenLegacyButton to={`measurements`} label="Open measurement order" />
          </CardBody>
        </Card>
      ) : (
        <EmptyState
          inline
          icon={<Ruler />}
          title="No measurement on file"
          description="Order an EagleView report or attach a DIY measurement to populate proposal line items."
          primaryAction={<OpenLegacyButton to="measurements" label="Order measurement" />}
        />
      )}
    </div>
  );
}
