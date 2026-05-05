import { Layers } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'sierra-templates',
    name: 'Templates',
    description: 'Pre-built Sierra agent templates for common use cases.',
    icon: Layers,
    accent: 'bg-fuchsia-100',
    section: 'sierra-ai',
    order: 5,
  },
  articles: [
    walkthrough({
      slug: 'agent-template-gallery',
      title: 'Agent template gallery',
      summary: 'Browse pre-built agent templates by use case.',
      categorySlug: 'sierra-templates',
      tags: ['sierra', 'templates'],
      readMinutes: 3,
      intro: 'Templates are pre-configured agents for common use cases — Lead Qualifier, Appointment Booker, FAQ Responder.',
      videoDesc: 'Template gallery (90 sec)',
      steps: [
        { title: 'Sierra → Templates', text: '', screenshot: 'templates tab' },
        { title: 'Browse by use case', text: '', screenshot: 'use case filters' },
        { title: 'Preview agent behavior', text: '', screenshot: 'agent preview' },
      ],
    }),
    walkthrough({
      slug: 'clone-a-template',
      title: 'Clone a template into your account',
      summary: 'Start from a template and customize.',
      categorySlug: 'sierra-templates',
      tags: ['sierra', 'templates', 'clone'],
      readMinutes: 3,
      intro: 'Cloning a template copies its prompts, voice, and tools into your account where you can customize.',
      videoDesc: 'Clone template (60 sec)',
      steps: [
        { title: 'Open a template', text: '', screenshot: 'template detail' },
        { title: 'Click "Use this template"', text: '', screenshot: 'use button' },
        { title: 'Rename', text: '', screenshot: 'rename input' },
        { title: 'Edit', text: 'Now you have your own agent.', screenshot: 'edit cloned' },
      ],
    }),
    walkthrough({
      slug: 'customize-a-template',
      title: 'Customize a cloned template',
      summary: 'Adapt a template to your business.',
      categorySlug: 'sierra-templates',
      tags: ['sierra', 'templates', 'customize'],
      readMinutes: 4,
      intro: 'Templates are starting points. Customize the prompt, voice, and tools to match your brand.',
      videoDesc: 'Customize template (2 min)',
      steps: [
        { title: 'Edit system prompt', text: 'Replace generic placeholders with your specifics.', screenshot: 'prompt editor' },
        { title: 'Add company info', text: 'Hours, pricing, services.', screenshot: 'info' },
        { title: 'Pick voice', text: '', screenshot: 'voice picker' },
        { title: 'Test', text: '', screenshot: 'test call' },
      ],
    }),
    walkthrough({
      slug: 'share-template-internally',
      title: 'Share an agent template internally',
      summary: 'Save a successful agent as a template for the rest of your team.',
      categorySlug: 'sierra-templates',
      tags: ['sierra', 'templates', 'share'],
      readMinutes: 3,
      intro: 'Save a working agent so other locations or team members can clone.',
      videoDesc: 'Share internally (90 sec)',
      steps: [
        { title: 'Open agent → Save as Template', text: '', screenshot: 'save as template' },
        { title: 'Name + description', text: '', screenshot: 'template metadata' },
        { title: 'Visible to team', text: 'Appears in Templates → Internal.', screenshot: 'internal templates' },
      ],
    }),
    walkthrough({
      slug: 'template-best-practices',
      title: 'Template best practices',
      summary: 'What to include in a high-quality agent template.',
      categorySlug: 'sierra-templates',
      tags: ['sierra', 'templates', 'best-practices'],
      readMinutes: 4,
      intro: 'A great template is generic enough to be reusable but specific enough to ship working.',
      videoDesc: 'Template tips (2 min)',
      steps: [
        { title: 'Use placeholders', text: '{{company_name}} for cloning.', screenshot: 'placeholder usage' },
        { title: 'Include test scenarios', text: 'In the description, list expected questions.', screenshot: 'test scenarios' },
        { title: 'Pin sources', text: 'Reference docs that inform the agent.', screenshot: 'sources pinned' },
      ],
    }),
  ],
};

export default cm;
