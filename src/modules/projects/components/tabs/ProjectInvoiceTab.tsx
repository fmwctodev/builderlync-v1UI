import { CreditCard } from 'lucide-react';
import type { PipelineCard } from '../../../../shared/lib/pipeline';
import { Card, CardBody, CardHeader } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { OpenLegacyButton } from '../ProjectDrawer';

export function ProjectInvoiceTab({ card }: { card: PipelineCard }) {
  const hasInvoice = Boolean(card.origin.invoiceId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Invoices"
          description="Invoicing, payments, and transactions stay in the existing Payments workspace."
        />
        <CardBody>
          <p className="studio-text-muted">
            Drafting an invoice, applying coupons, and recording transactions all run through the
            existing payments endpoints. This tab summarizes what&apos;s already there.
          </p>
        </CardBody>
      </Card>

      {hasInvoice ? (
        <Card>
          <CardHeader title="Linked invoice" description={`Invoice ${card.origin.invoiceId}`} />
          <CardBody>
            <OpenLegacyButton to="payments" label="Open payments" />
          </CardBody>
        </Card>
      ) : (
        <EmptyState
          inline
          icon={<CreditCard />}
          title="No invoice yet"
          description="Send an invoice once production wraps up."
          primaryAction={<OpenLegacyButton to="payments" label="Open payments" />}
        />
      )}
    </div>
  );
}
