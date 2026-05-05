/**
 * Authoring helpers — factories that produce a KbArticle from a
 * compact, declarative input.
 *
 * Goal: make ~285 walkthrough articles tractable. Each article would
 * otherwise take 100-200 lines of structured KbBlock declarations. With
 * `walkthrough()` it's 30-50 lines of inputs.
 */

import type { KbArticle, KbBlock, KbStep } from './types';

const NOW = '2026-05-04T00:00:00.000Z';

// ============================================================================
// walkthrough() — the standard step-by-step article factory
// ============================================================================

export interface WalkthroughInput {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  tags?: string[];
  /** Read time in minutes (default 4). */
  readMinutes?: number;
  /** Mark as featured on the KB home + Support hero. */
  featured?: boolean;
  /** ISO timestamp; defaults to NOW. */
  updatedAt?: string;
  /** Author display; defaults to "BuilderLync Team". */
  author?: string;

  /** Intro paragraph — what this article covers and why. */
  intro: string;
  /** Description for the primary video placeholder, e.g. "Create a job (2 min)". */
  videoDesc?: string;
  /** "Before you start" prerequisites. Optional but recommended. */
  prereqs?: string[];
  /** Step-by-step instructions. Each step can have an inline screenshot. */
  steps: WalkthroughStep[];
  /** "Tips" callouts. */
  tips?: string[];
  /** "Watch out" warnings. */
  warnings?: string[];
  /** Related articles to show at the bottom. */
  related?: { categorySlug: string; articleSlug: string }[];
  /** Custom closing paragraph(s) before related articles. */
  closing?: string;
}

export interface WalkthroughStep {
  title: string;
  text: string;
  /** Description of the screenshot to capture. Placeholder until src ships. */
  screenshot?: string;
}

export function walkthrough(input: WalkthroughInput): KbArticle {
  const body: KbBlock[] = [];

  // 1. Intro
  body.push({ type: 'paragraph', text: input.intro });

  // 2. Primary video placeholder
  if (input.videoDesc) {
    body.push({
      type: 'video',
      placeholder: { description: input.videoDesc },
      caption: input.videoDesc,
    });
  }

  // 3. "Before you start" — prereqs
  if (input.prereqs && input.prereqs.length > 0) {
    body.push({ type: 'heading', level: 2, text: 'Before you start' });
    body.push({ type: 'list', items: input.prereqs });
  }

  // 4. Steps
  if (input.steps.length > 0) {
    body.push({ type: 'heading', level: 2, text: 'Step-by-step' });
    body.push({
      type: 'steps',
      items: input.steps.map<KbStep>((s) => ({
        title: s.title,
        text: s.text,
        screenshot: s.screenshot ? { description: s.screenshot } : undefined,
      })),
    });
  }

  // 5. Tips
  if (input.tips && input.tips.length > 0) {
    for (const tip of input.tips) {
      body.push({ type: 'callout', tone: 'tip', title: 'Tip', text: tip });
    }
  }

  // 6. Warnings
  if (input.warnings && input.warnings.length > 0) {
    for (const w of input.warnings) {
      body.push({ type: 'callout', tone: 'warn', title: 'Heads up', text: w });
    }
  }

  // 7. Closing
  if (input.closing) {
    body.push({ type: 'heading', level: 2, text: "What's next" });
    body.push({ type: 'paragraph', text: input.closing });
  }

  // 8. Related
  if (input.related && input.related.length > 0) {
    if (!input.closing) {
      body.push({ type: 'heading', level: 2, text: "What's next" });
    }
    body.push({ type: 'related', articleSlugs: input.related });
  }

  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    categorySlug: input.categorySlug,
    tags: input.tags ?? [],
    primaryVideo: input.videoDesc
      ? { placeholder: { description: input.videoDesc } }
      : undefined,
    updatedAt: input.updatedAt ?? NOW,
    author: input.author ?? 'BuilderLync Team',
    featured: input.featured,
    readMinutes: input.readMinutes ?? 4,
    body,
  };
}

// ============================================================================
// concept() — for "What is X?" / overview articles (no steps)
// ============================================================================

export interface ConceptInput {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  tags?: string[];
  readMinutes?: number;
  featured?: boolean;
  updatedAt?: string;
  videoDesc?: string;

  /** Body paragraphs and headings. Pass strings (paragraphs) or `{h2: '...'}` (heading lvl 2). */
  sections: Array<string | { h2: string } | { h3: string } | { list: string[] } | { tip: string } | { warn: string }>;
  related?: { categorySlug: string; articleSlug: string }[];
}

export function concept(input: ConceptInput): KbArticle {
  const body: KbBlock[] = [];
  for (const section of input.sections) {
    if (typeof section === 'string') {
      body.push({ type: 'paragraph', text: section });
    } else if ('h2' in section) {
      body.push({ type: 'heading', level: 2, text: section.h2 });
    } else if ('h3' in section) {
      body.push({ type: 'heading', level: 3, text: section.h3 });
    } else if ('list' in section) {
      body.push({ type: 'list', items: section.list });
    } else if ('tip' in section) {
      body.push({ type: 'callout', tone: 'tip', title: 'Tip', text: section.tip });
    } else if ('warn' in section) {
      body.push({ type: 'callout', tone: 'warn', title: 'Heads up', text: section.warn });
    }
  }

  if (input.videoDesc) {
    // Insert video right after the first paragraph
    const insertIndex = body.findIndex((b) => b.type === 'paragraph') + 1;
    body.splice(insertIndex, 0, {
      type: 'video',
      placeholder: { description: input.videoDesc },
      caption: input.videoDesc,
    });
  }

  if (input.related && input.related.length > 0) {
    body.push({ type: 'heading', level: 2, text: "What's next" });
    body.push({ type: 'related', articleSlugs: input.related });
  }

  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    categorySlug: input.categorySlug,
    tags: input.tags ?? [],
    primaryVideo: input.videoDesc
      ? { placeholder: { description: input.videoDesc } }
      : undefined,
    updatedAt: input.updatedAt ?? NOW,
    author: 'BuilderLync Team',
    featured: input.featured,
    readMinutes: input.readMinutes ?? 3,
    body,
  };
}

// ============================================================================
// raw() — escape hatch for custom KbBlock[] bodies (used for migrated articles)
// ============================================================================

export interface RawInput {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  tags?: string[];
  readMinutes?: number;
  featured?: boolean;
  updatedAt?: string;
  author?: string;
  primaryVideoUrl?: string;
  primaryVideoDesc?: string;
  body: KbBlock[];
}

export function raw(input: RawInput): KbArticle {
  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    categorySlug: input.categorySlug,
    tags: input.tags ?? [],
    primaryVideo: input.primaryVideoUrl
      ? { src: input.primaryVideoUrl }
      : input.primaryVideoDesc
        ? { placeholder: { description: input.primaryVideoDesc } }
        : undefined,
    updatedAt: input.updatedAt ?? NOW,
    author: input.author ?? 'BuilderLync Team',
    featured: input.featured,
    readMinutes: input.readMinutes ?? 4,
    body: input.body,
  };
}
