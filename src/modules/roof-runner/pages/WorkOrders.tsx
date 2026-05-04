import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  PageContainer, PageHeader, Section, Input, Select, Chip,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
} from '../../../shared/components/ui';

export default function PurchaseOrders() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const statusOptions = [
    { value: '',          label: 'All statuses' },
    { value: 'draft',     label: 'Draft' },
    { value: 'sent',      label: 'Sent' },
    { value: 'approved',  label: 'Approved' },
    { value: 'received',  label: 'Received' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <PageContainer>
      <PageHeader eyebrow="Tools" title="Purchase Orders" subtitle="Track P.O.s issued to vendors against active jobs." />

      <Section>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              leadingIcon={<Search />}
              placeholder="Search by P.O. number, vendor, job…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select<string>
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>P.O. #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Associated job</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead numeric>Amount</TableHead>
              <TableHead>Date created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <PurchaseOrderRow />
            <PurchaseOrderRow />
            <PurchaseOrderRow />
          </TableBody>
        </Table>
      </Section>
    </PageContainer>
  );
}

function PurchaseOrderRow() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <TableRow>
      <TableCell>
        <Chip tone="warn">Draft</Chip>
      </TableCell>
      <TableCell>#PO-001</TableCell>
      <TableCell>ABC Supply Co.</TableCell>
      <TableCell>Job #1247 — Main St Roof</TableCell>
      <TableCell>Mike Smith</TableCell>
      <TableCell numeric>$2,450.00</TableCell>
      <TableCell>2024-01-15</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 relative">
          <Button variant="quiet" size="sm">View</Button>
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="More"
          >
            ⋯
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 z-20 rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 overflow-hidden">
              <button className="w-full px-3 h-9 text-left studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2">Download</button>
              <button className="w-full px-3 h-9 text-left studio-text-body hover:bg-surface-2 dark:hover:bg-surface-d-2">Edit</button>
              <button className="w-full px-3 h-9 text-left studio-text-body text-signal-500 hover:bg-signal-50 dark:hover:bg-signal-500/10">Delete</button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
