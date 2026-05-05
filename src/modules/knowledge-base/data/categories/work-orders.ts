import { Clipboard } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'work-orders',
    name: 'Work Orders',
    description: 'Purchase orders for production crews.',
    icon: Clipboard,
    accent: 'bg-lime-100',
    section: 'field',
    order: 3,
  },
  articles: [
    walkthrough({
      slug: 'work-orders-overview',
      title: 'Work orders overview',
      summary: 'How work orders / purchase orders track production work.',
      categorySlug: 'work-orders',
      tags: ['work-orders', 'overview'],
      readMinutes: 4,
      intro: 'Work orders (also called purchase orders or POs) authorize production work — internal crews, subs, or vendors.',
      videoDesc: 'Work orders tour (2 min)',
      steps: [
        { title: 'Open Work Orders', text: 'Sidebar.', screenshot: 'work orders sidebar' },
        { title: 'List view', text: 'PO number, status, vendor, total.', screenshot: 'list view' },
        { title: 'Click row', text: 'PO detail view.', screenshot: 'po detail' },
      ],
    }),
    walkthrough({
      slug: 'create-a-purchase-order',
      title: 'Create a purchase order',
      summary: 'Create a PO from a job with line items and vendor.',
      categorySlug: 'work-orders',
      tags: ['work-orders', 'create'],
      readMinutes: 4,
      intro: 'POs link to a job and authorize a vendor or sub to perform work or supply materials.',
      videoDesc: 'Create PO (2 min)',
      steps: [
        { title: 'Work Orders → New', text: '', screenshot: 'new po button' },
        { title: 'Pick job + vendor', text: '', screenshot: 'job + vendor pickers' },
        { title: 'Add line items', text: 'Labor, materials, or both.', screenshot: 'line items' },
        { title: 'Send to vendor', text: 'Email + portal link.', screenshot: 'send to vendor' },
      ],
    }),
    walkthrough({
      slug: 'assign-work-orders',
      title: 'Assign work orders',
      summary: 'Route POs to crews and track completion.',
      categorySlug: 'work-orders',
      tags: ['work-orders', 'assign'],
      readMinutes: 3,
      intro: 'Assign POs to internal crews or external subs.',
      videoDesc: 'Assign POs (90 sec)',
      steps: [
        { title: 'Open PO', text: '', screenshot: 'po detail' },
        { title: 'Pick assignee', text: 'Crew or sub vendor.', screenshot: 'assignee picker' },
        { title: 'Save', text: 'Assignee gets notification.', screenshot: 'saved' },
      ],
    }),
    walkthrough({
      slug: 'work-order-statuses',
      title: 'Work order statuses',
      summary: 'Draft → Sent → Approved → Received → Completed.',
      categorySlug: 'work-orders',
      tags: ['work-orders', 'statuses'],
      readMinutes: 3,
      intro: 'POs follow a 5-stage lifecycle from draft to completion.',
      videoDesc: 'PO statuses (90 sec)',
      steps: [
        { title: 'Draft', text: 'Internal — not sent.', screenshot: 'draft po' },
        { title: 'Sent', text: 'Sent to vendor.', screenshot: 'sent po' },
        { title: 'Approved', text: 'Vendor accepted.', screenshot: 'approved po' },
        { title: 'Received', text: 'Materials/work received.', screenshot: 'received po' },
        { title: 'Completed', text: 'PO closed.', screenshot: 'completed po' },
      ],
    }),
    walkthrough({
      slug: 'printing-and-emailing-pos',
      title: 'Print or email a PO',
      summary: 'Generate a printable PDF or email PO directly.',
      categorySlug: 'work-orders',
      tags: ['work-orders', 'print', 'email'],
      readMinutes: 3,
      intro: 'POs render as branded PDFs for print or email.',
      videoDesc: 'Print/email PO (90 sec)',
      steps: [
        { title: 'Open PO', text: '', screenshot: 'po detail' },
        { title: 'Print PDF', text: 'Download branded.', screenshot: 'print button' },
        { title: 'Email', text: 'Send to vendor with portal link.', screenshot: 'email modal' },
      ],
    }),
  ],
};

export default cm;
