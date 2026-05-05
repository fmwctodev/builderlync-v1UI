import { Type } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'settings-custom-fields',
    name: 'Custom Fields',
    description: 'Add custom fields to contacts, jobs, opportunities.',
    icon: Type,
    accent: 'bg-slate-100',
    section: 'settings',
    order: 10,
  },
  articles: [
    walkthrough({
      slug: 'custom-fields-overview',
      title: 'Custom fields overview',
      summary: 'When and how to use custom fields.',
      categorySlug: 'settings-custom-fields',
      tags: ['custom-fields', 'overview'],
      readMinutes: 3,
      intro: 'Custom fields capture business-specific data the standard schema doesn\'t cover.',
      videoDesc: 'Custom fields tour (60 sec)',
      steps: [
        { title: 'Settings → Custom Fields', text: '', screenshot: 'custom fields' },
        { title: 'Pick entity', text: 'Contacts / Jobs / Opportunities.', screenshot: 'entity tabs' },
        { title: 'Existing fields list', text: '', screenshot: 'fields list' },
      ],
    }),
    walkthrough({
      slug: 'add-a-custom-field',
      title: 'Add a custom field',
      summary: 'Define a new field with type and required flag.',
      categorySlug: 'settings-custom-fields',
      tags: ['custom-fields', 'add'],
      readMinutes: 3,
      intro: 'Pick the right type — text, number, date, dropdown, multi-select, file.',
      videoDesc: 'Add field (60 sec)',
      steps: [
        { title: 'Click +New Field', text: '', screenshot: 'new field button' },
        { title: 'Pick type', text: '', screenshot: 'type picker' },
        { title: 'Label + required toggle', text: '', screenshot: 'field config' },
        { title: 'Save + use in form', text: 'Drag to layout.', screenshot: 'drag to layout' },
      ],
    }),
    walkthrough({
      slug: 'field-types',
      title: 'Custom field types',
      summary: 'Text, number, date, dropdown, multi-select, file, currency, boolean.',
      categorySlug: 'settings-custom-fields',
      tags: ['custom-fields', 'types'],
      readMinutes: 4,
      intro: 'Each type has different validation and UI affordances.',
      videoDesc: 'Field types (90 sec)',
      steps: [
        { title: 'Text', text: 'Free-form short text.', screenshot: 'text field' },
        { title: 'Number / Currency', text: 'With formatting.', screenshot: 'number field' },
        { title: 'Date', text: 'Date picker.', screenshot: 'date field' },
        { title: 'Dropdown / Multi-select', text: 'With pre-defined options.', screenshot: 'dropdown' },
        { title: 'File', text: 'Upload single file.', screenshot: 'file field' },
      ],
    }),
    walkthrough({
      slug: 'field-layout',
      title: 'Edit form layout',
      summary: 'Drag fields to reorder; group into sections.',
      categorySlug: 'settings-custom-fields',
      tags: ['custom-fields', 'layout'],
      readMinutes: 3,
      intro: 'Layout determines where fields appear in the create/edit form.',
      videoDesc: 'Layout editor (60 sec)',
      steps: [
        { title: 'Form Layout tab', text: '', screenshot: 'layout tab' },
        { title: 'Drag to reorder', text: '', screenshot: 'drag fields' },
        { title: 'Add section', text: 'Group related fields.', screenshot: 'section' },
      ],
    }),
    walkthrough({
      slug: 'custom-fields-troubleshooting',
      title: 'Custom fields troubleshooting',
      summary: 'When fields don\'t appear or values don\'t save.',
      categorySlug: 'settings-custom-fields',
      tags: ['custom-fields', 'troubleshooting'],
      readMinutes: 3,
      intro: 'Most issues are layout placement or required-field validation.',
      videoDesc: 'Troubleshooting (45 sec)',
      steps: [
        { title: 'Check layout', text: 'Field must be on the active layout.', screenshot: 'layout check' },
        { title: 'Check role permissions', text: 'Some roles can\'t edit certain fields.', screenshot: 'role check' },
      ],
    }),
  ],
};

export default cm;
