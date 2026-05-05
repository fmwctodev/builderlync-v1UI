import { CreditCard } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-billing',
    name: 'Billing',
    description: 'Subscription, seats, payment method, invoices.',
    icon: CreditCard,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 5,
  },
  articles: [
    walkthrough({
      slug: 'billing-overview',
      title: 'Billing overview',
      summary: 'Subscription tier, seats, monthly fees, invoices.',
      categorySlug: 'settings-billing',
      tags: ['billing', 'overview'],
      readMinutes: 3,
      intro: 'Billing is owner-only by default. Shows current plan, usage, and invoices.',
      videoDesc: 'Billing tour (60 sec)',
      steps: [
        { title: 'Settings → Billing', text: '', screenshot: 'billing section' },
        { title: 'Current plan', text: '', screenshot: 'current plan' },
        { title: 'Seats used / available', text: '', screenshot: 'seats' },
      ],
    }),
    walkthrough({
      slug: 'update-payment-method',
      title: 'Update your payment method',
      summary: 'Change the credit card on file.',
      categorySlug: 'settings-billing',
      tags: ['billing', 'payment'],
      readMinutes: 2,
      intro: 'Update the card before it expires to avoid service interruption.',
      videoDesc: 'Update payment (45 sec)',
      steps: [
        { title: 'Billing → Payment Method', text: '', screenshot: 'payment method' },
        { title: 'Update card', text: 'New card form.', screenshot: 'update card' },
        { title: 'Save', text: '', screenshot: 'saved' },
      ],
    }),
    walkthrough({
      slug: 'add-or-remove-seats',
      title: 'Add or remove seats',
      summary: 'Buy more seats or remove unused ones.',
      categorySlug: 'settings-billing',
      tags: ['billing', 'seats'],
      readMinutes: 3,
      intro: 'Seats are billed monthly; changes prorate.',
      videoDesc: 'Manage seats (60 sec)',
      steps: [
        { title: 'Billing → Seats', text: '', screenshot: 'seats section' },
        { title: 'Add or remove', text: '', screenshot: 'seat counter' },
        { title: 'Confirm change', text: 'Prorated charge or credit appears on next invoice.', screenshot: 'confirm' },
      ],
    }),
    walkthrough({
      slug: 'view-invoices',
      title: 'View past invoices',
      summary: 'Download monthly BuilderLync invoices.',
      categorySlug: 'settings-billing',
      tags: ['billing', 'invoices'],
      readMinutes: 2,
      intro: 'BuilderLync invoices download as PDF.',
      videoDesc: 'View invoices (45 sec)',
      steps: [
        { title: 'Billing → Invoices', text: '', screenshot: 'invoices list' },
        { title: 'Download', text: 'Per invoice.', screenshot: 'download button' },
      ],
    }),
    walkthrough({
      slug: 'billing-troubleshooting',
      title: 'Billing troubleshooting',
      summary: 'Failed payments, plan questions, refunds.',
      categorySlug: 'settings-billing',
      tags: ['billing', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Most billing issues resolve by updating the payment method.',
      videoDesc: 'Troubleshooting (60 sec)',
      steps: [
        { title: 'Failed payment', text: 'Update card; retry charge.', screenshot: 'retry' },
        { title: 'Refund', text: 'Contact Support.', screenshot: 'support link' },
      ],
    }),
  ],
};

export default cm;
