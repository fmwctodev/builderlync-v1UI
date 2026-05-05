import { BookOpen } from 'lucide-react';
import { walkthrough } from '../authoring';
import type { CategoryModule } from '../types';

const cm: CategoryModule = {
  category: {
    slug: 'knowledge-and-docs',
    name: 'Knowledge & Documents',
    description: 'Sierra agent knowledge bases — uploaded docs the agent can reference.',
    icon: BookOpen,
    accent: 'bg-fuchsia-100',
    section: 'sierra-ai',
    order: 3,
  },
  articles: [
    walkthrough({
      slug: 'upload-knowledge-documents',
      title: 'Upload knowledge documents',
      summary: 'Add PDFs, Word docs, and pages to your agent\'s knowledge base.',
      categorySlug: 'knowledge-and-docs',
      tags: ['sierra', 'knowledge', 'upload'],
      readMinutes: 4,
      intro: 'Sierra agents can reference uploaded documents to answer customer questions accurately.',
      videoDesc: 'Upload knowledge (2 min)',
      steps: [
        { title: 'Sierra → Knowledge tab', text: '', screenshot: 'knowledge tab' },
        { title: 'Click Upload', text: 'PDF, DOCX, TXT.', screenshot: 'upload button' },
        { title: 'Wait for indexing', text: 'Auto-chunked and embedded.', screenshot: 'indexing progress' },
        { title: 'Attach to agent', text: 'Pick which agent uses this knowledge.', screenshot: 'agent attach' },
      ],
    }),
    walkthrough({
      slug: 'pdf-and-doc-indexing',
      title: 'PDF and document indexing',
      summary: 'How BuilderLync chunks and embeds your documents for retrieval.',
      categorySlug: 'knowledge-and-docs',
      tags: ['sierra', 'indexing', 'embedding'],
      readMinutes: 4,
      intro: 'When you upload a doc, BuilderLync extracts text, chunks by semantic boundary, and creates embeddings for retrieval.',
      videoDesc: 'Indexing (2 min)',
      steps: [
        { title: 'Upload', text: 'PDF, DOCX, MD.', screenshot: 'upload' },
        { title: 'View chunks', text: 'See how the doc was split.', screenshot: 'chunks view' },
        { title: 'Test retrieval', text: 'Query the knowledge base directly.', screenshot: 'retrieval test' },
      ],
      tips: ['Quality of chunks affects answer quality. Long PDFs with consistent headings index best.'],
    }),
    walkthrough({
      slug: 'knowledge-source-priority',
      title: 'Knowledge source priority',
      summary: 'When multiple sources have conflicting info, which wins.',
      categorySlug: 'knowledge-and-docs',
      tags: ['sierra', 'knowledge', 'priority'],
      readMinutes: 3,
      intro: 'You can attach multiple knowledge sources to an agent. Priority determines which wins on conflict.',
      videoDesc: 'Source priority (90 sec)',
      steps: [
        { title: 'Knowledge tab', text: 'List of attached sources.', screenshot: 'sources list' },
        { title: 'Drag to reorder', text: 'Top = highest priority.', screenshot: 'reorder' },
        { title: 'Test', text: '', screenshot: 'test conflict resolution' },
      ],
    }),
    walkthrough({
      slug: 'test-agent-against-knowledge',
      title: 'Test the agent against knowledge',
      summary: 'Simulate questions to verify the agent retrieves the right info.',
      categorySlug: 'knowledge-and-docs',
      tags: ['sierra', 'knowledge', 'test'],
      readMinutes: 3,
      intro: 'Test before you ship.',
      videoDesc: 'Test knowledge (90 sec)',
      steps: [
        { title: 'Sierra → Test tab', text: '', screenshot: 'test tab' },
        { title: 'Ask a question', text: 'Like a customer would.', screenshot: 'question input' },
        { title: 'Inspect retrieval', text: 'See which chunks were retrieved.', screenshot: 'retrieved chunks' },
      ],
    }),
    walkthrough({
      slug: 'update-and-resync-documents',
      title: 'Update and re-sync documents',
      summary: 'When source docs change, re-index so the agent uses fresh info.',
      categorySlug: 'knowledge-and-docs',
      tags: ['sierra', 'knowledge', 'update'],
      readMinutes: 3,
      intro: 'Edit your source doc, re-upload, and BuilderLync re-indexes — old version archived.',
      videoDesc: 'Re-sync (90 sec)',
      steps: [
        { title: 'Open the source', text: '', screenshot: 'source detail' },
        { title: 'Re-upload', text: 'Replace file.', screenshot: 'replace button' },
        { title: 'Re-index', text: 'Auto-triggered.', screenshot: 'reindexing progress' },
      ],
    }),
  ],
};

export default cm;
