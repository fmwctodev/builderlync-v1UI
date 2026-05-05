import { Building2 } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-business-info',
    name: 'Business Info',
    description: 'Company name, address, phone, EIN, business hours.',
    icon: Building2,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 2,
  },
  articles: [
    walkthrough({
      slug: 'business-info-overview',
      title: 'Business info overview',
      summary: 'Company details that appear on proposals, invoices, and the public site.',
      categorySlug: 'settings-business-info',
      tags: ['business', 'overview'],
      readMinutes: 3,
      intro: 'Business info populates legal company info across documents and integrations.',
      videoDesc: 'Business info tour (60 sec)',
      steps: [
        { title: 'Settings → Business Info', text: '', screenshot: 'business info section' },
        { title: 'Legal vs friendly name', text: 'Both fields — legal for contracts, friendly for marketing.', screenshot: 'name fields' },
        { title: 'Address + phone + email', text: '', screenshot: 'contact fields' },
      ],
    }),
    walkthrough({
      slug: 'set-business-address',
      title: 'Set your business address',
      summary: 'Address used on invoices, proposals, and EagleView.',
      categorySlug: 'settings-business-info',
      tags: ['business', 'address'],
      readMinutes: 2,
      intro: 'Business address must match your legal entity address.',
      videoDesc: 'Address (30 sec)',
      steps: [
        { title: 'Business Info → Address', text: '', screenshot: 'address section' },
        { title: 'Type or autocomplete', text: '', screenshot: 'autocomplete' },
        { title: 'Save', text: 'Propagates to documents.', screenshot: 'save' },
      ],
    }),
    walkthrough({
      slug: 'business-hours',
      title: 'Set business hours',
      summary: 'Operating hours used by Sierra agents and bookable calendars.',
      categorySlug: 'settings-business-info',
      tags: ['business', 'hours'],
      readMinutes: 3,
      intro: 'Business hours drive agent routing and bookable slot windows.',
      videoDesc: 'Business hours (60 sec)',
      steps: [
        { title: 'Business Info → Hours', text: '', screenshot: 'hours grid' },
        { title: 'Per day open/close', text: '', screenshot: 'day toggles' },
        { title: 'Holidays', text: 'Add closed dates.', screenshot: 'holiday list' },
      ],
    }),
    walkthrough({
      slug: 'tax-and-ein',
      title: 'Tax info and EIN',
      summary: 'Add EIN and default tax rate for invoices.',
      categorySlug: 'settings-business-info',
      tags: ['business', 'tax', 'ein'],
      readMinutes: 3,
      intro: 'EIN appears on invoices for B2B customers; tax rate auto-applies to invoice line items.',
      videoDesc: 'Tax + EIN (60 sec)',
      steps: [
        { title: 'Business Info → Tax', text: '', screenshot: 'tax section' },
        { title: 'EIN', text: '', screenshot: 'ein field' },
        { title: 'Default tax rate', text: '', screenshot: 'tax rate' },
      ],
    }),
    walkthrough({
      slug: 'business-info-troubleshooting',
      title: 'Business info troubleshooting',
      summary: 'When changes don\'t propagate or appear wrong.',
      categorySlug: 'settings-business-info',
      tags: ['business', 'troubleshooting'],
      readMinutes: 2,
      intro: 'Most issues are propagation delay or template overrides.',
      videoDesc: 'Troubleshooting (45 sec)',
      steps: [
        { title: 'Check template overrides', text: 'Some templates pin business info — clear pins.', screenshot: 'template pins' },
        { title: 'Clear cache', text: 'Hard refresh.', screenshot: 'refresh' },
      ],
    }),
  ],
};

export default cm;
