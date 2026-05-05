import { Palette } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-brand-board',
    name: 'Brand Board',
    description: 'Logo, colors, fonts, templates — your brand across documents.',
    icon: Palette,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 9,
  },
  articles: [
    walkthrough({
      slug: 'brand-board-overview',
      title: 'Brand Board overview',
      summary: 'Your logo, colors, and fonts applied across BuilderLync.',
      categorySlug: 'settings-brand-board',
      tags: ['brand', 'overview'],
      readMinutes: 3,
      intro: 'Brand Board defines logo + colors + fonts used in proposals, invoices, forms, emails.',
      videoDesc: 'Brand Board tour (60 sec)',
      steps: [
        { title: 'Settings → Brand Board', text: '', screenshot: 'brand section' },
        { title: 'Logo + colors + fonts', text: '', screenshot: 'brand fields' },
        { title: 'Preview', text: 'See it on a sample proposal.', screenshot: 'preview' },
      ],
    }),
    walkthrough({
      slug: 'upload-logo',
      title: 'Upload your logo',
      summary: 'Add light + dark variants.',
      categorySlug: 'settings-brand-board',
      tags: ['brand', 'logo'],
      readMinutes: 2,
      intro: 'Upload SVG (preferred) or PNG.',
      videoDesc: 'Upload logo (45 sec)',
      steps: [
        { title: 'Brand Board → Logo', text: '', screenshot: 'logo section' },
        { title: 'Upload light + dark', text: 'Both variants for different backgrounds.', screenshot: 'upload variants' },
      ],
    }),
    walkthrough({
      slug: 'set-brand-colors',
      title: 'Set brand colors',
      summary: 'Primary, secondary, and accent.',
      categorySlug: 'settings-brand-board',
      tags: ['brand', 'colors'],
      readMinutes: 2,
      intro: 'Colors propagate to proposals, forms, public pages.',
      videoDesc: 'Brand colors (45 sec)',
      steps: [
        { title: 'Brand Board → Colors', text: '', screenshot: 'colors section' },
        { title: 'Pick hex values', text: '', screenshot: 'color pickers' },
        { title: 'Save', text: '', screenshot: 'save' },
      ],
    }),
    walkthrough({
      slug: 'pick-brand-fonts',
      title: 'Pick brand fonts',
      summary: 'Headings + body — Google Fonts library.',
      categorySlug: 'settings-brand-board',
      tags: ['brand', 'fonts'],
      readMinutes: 2,
      intro: 'Pick from Google Fonts; system loads them on public-facing surfaces.',
      videoDesc: 'Brand fonts (45 sec)',
      steps: [
        { title: 'Brand Board → Fonts', text: '', screenshot: 'fonts section' },
        { title: 'Pick heading font', text: '', screenshot: 'heading font' },
        { title: 'Pick body font', text: '', screenshot: 'body font' },
      ],
    }),
    walkthrough({
      slug: 'brand-troubleshooting',
      title: 'Brand troubleshooting',
      summary: 'When brand doesn\'t apply to a specific document or page.',
      categorySlug: 'settings-brand-board',
      tags: ['brand', 'troubleshooting'],
      readMinutes: 2,
      intro: 'Most issues are template overrides — clear pins.',
      videoDesc: 'Troubleshooting (45 sec)',
      steps: [
        { title: 'Check template', text: 'Some templates pin colors.', screenshot: 'template pin' },
        { title: 'Clear cache', text: 'Hard refresh.', screenshot: 'refresh' },
      ],
    }),
  ],
};

export default cm;
