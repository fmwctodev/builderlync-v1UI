import { Package } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'material-orders',
    name: 'Material Orders',
    description: 'Order materials from ABC Supply, SRS, and QXO/Beacon.',
    icon: Package,
    accent: 'bg-lime-100',
    section: 'field',
    order: 2,
  },
  articles: [
    walkthrough({
      slug: 'material-orders-overview',
      title: 'Material orders overview',
      summary: 'How supplier integrations let you order from a job in one click.',
      categorySlug: 'material-orders',
      tags: ['materials', 'overview'],
      readMinutes: 4,
      intro: 'BuilderLync integrates with major roofing suppliers — order materials from a job, track delivery, sync to invoices.',
      videoDesc: 'Material orders tour (2 min)',
      steps: [
        { title: 'Open Material Orders', text: 'Sidebar.', screenshot: 'material orders sidebar' },
        { title: 'Pick supplier', text: 'ABC Supply, SRS, QXO/Beacon.', screenshot: 'supplier picker' },
        { title: 'Search products', text: 'Supplier catalog inline.', screenshot: 'product search' },
        { title: 'Place order', text: 'Tied to a job.', screenshot: 'place order' },
      ],
    }),
    walkthrough({
      slug: 'place-a-material-order',
      title: 'Place a material order',
      summary: 'Order materials directly from a job.',
      categorySlug: 'material-orders',
      tags: ['materials', 'order', 'place'],
      featured: true,
      readMinutes: 4,
      intro: 'From any job you can place a supplier order — no need to leave BuilderLync.',
      videoDesc: 'Place order (2 min)',
      steps: [
        { title: 'Open the job', text: '', screenshot: 'job detail' },
        { title: 'Click Order Materials', text: '', screenshot: 'order button' },
        { title: 'Pick supplier + branch', text: 'Nearest branch auto-suggests.', screenshot: 'branch picker' },
        { title: 'Add line items', text: 'From catalog or custom.', screenshot: 'line items' },
        { title: 'Confirm + submit', text: 'Order goes to supplier.', screenshot: 'confirm modal' },
      ],
      related: [{ categorySlug: 'material-orders', articleSlug: 'track-order-status' }],
    }),
    walkthrough({
      slug: 'connect-abc-supply',
      title: 'Connect ABC Supply',
      summary: 'Authorize your ABC Supply account for native ordering.',
      categorySlug: 'material-orders',
      tags: ['abc-supply', 'connect'],
      readMinutes: 3,
      intro: 'ABC Supply is a primary roofing material supplier — connect via OAuth.',
      videoDesc: 'Connect ABC (90 sec)',
      steps: [
        { title: 'Settings → Integrations → ABC Supply', text: '', screenshot: 'abc tile' },
        { title: 'OAuth', text: 'Use ABC online account credentials.', screenshot: 'oauth' },
        { title: 'Pick branches', text: 'Active branches you order from.', screenshot: 'branches' },
      ],
    }),
    walkthrough({
      slug: 'connect-srs-distribution',
      title: 'Connect SRS Distribution',
      summary: 'Connect SRS for material ordering.',
      categorySlug: 'material-orders',
      tags: ['srs', 'connect'],
      readMinutes: 3,
      intro: 'SRS Distribution is BuilderLync\'s second-tier supplier integration. May require a feature flag.',
      videoDesc: 'Connect SRS (90 sec)',
      steps: [
        { title: 'Verify feature flag', text: 'Settings → Features → SRS Distribution.', screenshot: 'feature flag' },
        { title: 'Settings → Integrations → SRS', text: '', screenshot: 'srs tile' },
        { title: 'Authorize', text: '', screenshot: 'authorize' },
      ],
    }),
    walkthrough({
      slug: 'connect-qxo-beacon',
      title: 'Connect QXO (Beacon)',
      summary: 'Connect QXO/Beacon for ordering.',
      categorySlug: 'material-orders',
      tags: ['qxo', 'beacon', 'connect'],
      readMinutes: 3,
      intro: 'QXO (formerly Beacon) provides another supplier integration option.',
      videoDesc: 'Connect QXO (90 sec)',
      steps: [
        { title: 'Settings → Integrations → QXO', text: '', screenshot: 'qxo tile' },
        { title: 'Account credentials', text: '', screenshot: 'credentials' },
        { title: 'Verify connection', text: '', screenshot: 'verify' },
      ],
    }),
    walkthrough({
      slug: 'track-order-status',
      title: 'Track order status',
      summary: 'See order status from placement to delivery.',
      categorySlug: 'material-orders',
      tags: ['materials', 'tracking'],
      readMinutes: 3,
      intro: 'Order status updates pull from the supplier — Created, Pending, In Progress, Delivered.',
      videoDesc: 'Track orders (90 sec)',
      steps: [
        { title: 'Material Orders → list view', text: '', screenshot: 'orders list' },
        { title: 'Filter by status', text: '', screenshot: 'status filter' },
        { title: 'Open order detail', text: 'Status timeline + delivery info.', screenshot: 'order detail' },
      ],
    }),
  ],
};

export default cm;
