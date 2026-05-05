import { ShoppingCart } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'catalog-and-pricing',
    name: 'Catalog & Pricing',
    description: 'Reusable items, services, and pricing tiers.',
    icon: ShoppingCart,
    accent: 'bg-lime-100',
    section: 'field',
    order: 4,
  },
  articles: [
    walkthrough({
      slug: 'catalog-overview',
      title: 'Catalog overview',
      summary: 'Reusable items, services, and pricing flow into proposals and invoices.',
      categorySlug: 'catalog-and-pricing',
      tags: ['catalog', 'overview'],
      readMinutes: 4,
      intro: 'The catalog is your master list of services, materials, and packages — referenced from proposals, invoices, and POs.',
      videoDesc: 'Catalog tour (2 min)',
      steps: [
        { title: 'Open Catalog', text: 'Sidebar.', screenshot: 'catalog sidebar' },
        { title: 'Items list', text: '', screenshot: 'items list' },
        { title: 'Click item', text: 'Detail view with pricing tiers.', screenshot: 'item detail' },
      ],
    }),
    walkthrough({
      slug: 'add-a-catalog-item',
      title: 'Add a catalog item',
      summary: 'Create a reusable item with pricing.',
      categorySlug: 'catalog-and-pricing',
      tags: ['catalog', 'item', 'create'],
      readMinutes: 3,
      intro: 'Add an item once — use it in every proposal.',
      videoDesc: 'Add item (90 sec)',
      steps: [
        { title: 'Catalog → +New', text: '', screenshot: 'new item' },
        { title: 'Name + description', text: '', screenshot: 'item form' },
        { title: 'Pricing', text: 'Flat or tiered.', screenshot: 'pricing input' },
        { title: 'Save', text: '', screenshot: 'item saved' },
      ],
    }),
    walkthrough({
      slug: 'pricing-tiers',
      title: 'Pricing tiers',
      summary: 'Set different prices for different customer types or volumes.',
      categorySlug: 'catalog-and-pricing',
      tags: ['catalog', 'pricing', 'tiers'],
      readMinutes: 4,
      intro: 'Tiers let you charge different prices for residential vs commercial vs insurance work.',
      videoDesc: 'Pricing tiers (2 min)',
      steps: [
        { title: 'Item detail → Pricing tiers', text: '', screenshot: 'pricing tiers' },
        { title: 'Add tier', text: 'Name (e.g. "Insurance"), price.', screenshot: 'add tier' },
        { title: 'Apply in proposal', text: 'Tier picker shows on each line item.', screenshot: 'tier picker in proposal' },
      ],
    }),
    walkthrough({
      slug: 'import-pricing-from-csv',
      title: 'Import pricing from CSV',
      summary: 'Bulk-import or update catalog items via CSV.',
      categorySlug: 'catalog-and-pricing',
      tags: ['catalog', 'csv', 'import'],
      readMinutes: 4,
      intro: 'CSV import is the fastest way to set up a catalog or do mass price updates.',
      videoDesc: 'CSV import (2 min)',
      steps: [
        { title: 'Catalog → Import', text: '', screenshot: 'import button' },
        { title: 'Upload CSV', text: 'Required columns: name, sku, price.', screenshot: 'upload zone' },
        { title: 'Map columns', text: '', screenshot: 'column mapping' },
        { title: 'Run', text: 'New rows created; matching SKUs updated.', screenshot: 'import progress' },
      ],
    }),
    walkthrough({
      slug: 'linking-catalog-to-proposals',
      title: 'Link the catalog to proposals',
      summary: 'How proposal line items pull from the catalog.',
      categorySlug: 'catalog-and-pricing',
      tags: ['catalog', 'proposals'],
      readMinutes: 3,
      intro: 'When you add a line item to a proposal, search the catalog for consistency.',
      videoDesc: 'Catalog in proposals (90 sec)',
      steps: [
        { title: 'Proposal → Add line item', text: '', screenshot: 'add line item' },
        { title: 'Search catalog', text: 'Autocomplete by name or SKU.', screenshot: 'catalog search' },
        { title: 'Pick tier', text: '', screenshot: 'tier picker' },
        { title: 'Adjust quantity', text: 'Subtotal computes live.', screenshot: 'quantity field' },
      ],
      related: [{ categorySlug: 'proposals', articleSlug: 'proposal-line-items' }],
    }),
  ],
};

export default cm;
