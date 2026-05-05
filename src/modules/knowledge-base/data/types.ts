/**
 * BuilderLync Knowledge Base — types and section definitions.
 *
 * Content lives in `src/modules/knowledge-base/data/categories/*.ts` —
 * one file per category. Each file exports its category metadata + an
 * array of articles. The aggregator at `data/index.ts` joins them.
 *
 * Why one file per category? Authoring scales — when you want to edit
 * the Jobs articles, you open the Jobs file. The whole KB compiles into
 * one chunk via Vite (the module is React.lazy'd at the route).
 */

import type { LucideIcon } from 'lucide-react';

// ============================================================================
// SECTIONS — top-level groupings shown in the KB sidebar
// ============================================================================

export type SectionId =
  | 'workspace'
  | 'marketing'
  | 'sierra-ai'
  | 'field'
  | 'automation-reporting'
  | 'settings'
  | 'support-account';

export interface SectionMeta {
  id: SectionId;
  name: string;
  description: string;
  /** Sort order in the sidebar. */
  order: number;
}

export const SECTIONS: SectionMeta[] = [
  { id: 'workspace',           name: 'Workspace',           description: 'Day-to-day modules.',                       order: 1 },
  { id: 'marketing',           name: 'Marketing & Growth',  description: 'Forms, campaigns, ads, attribution.',       order: 2 },
  { id: 'sierra-ai',           name: 'Sierra AI',           description: 'Voice and SMS agents, knowledge, routing.', order: 3 },
  { id: 'field',               name: 'Field & Operations',  description: 'Storm canvassing, materials, work orders.', order: 4 },
  { id: 'automation-reporting',name: 'Automation & Reporting', description: 'Workflows and reports.',                order: 5 },
  { id: 'settings',            name: 'Settings',            description: 'Configuration and admin.',                  order: 6 },
  { id: 'support-account',     name: 'Support & Account',   description: 'Onboarding, plan, affiliates.',             order: 7 },
];

// ============================================================================
// CATEGORY
// ============================================================================

export interface KbCategory {
  /** URL-safe identifier — used in the route path. */
  slug: string;
  /** Display name shown in cards, breadcrumbs, headings. */
  name: string;
  /** One-line description shown on the home grid. */
  description: string;
  /** Lucide icon for the category card. */
  icon: LucideIcon;
  /** Tailwind background class for the icon tile (light mode). Dark uses /20. */
  accent: string;
  /** Section this category belongs to (drives sidebar grouping). */
  section: SectionId;
  /** Sort order within the section (lower = earlier). */
  order: number;
}

// ============================================================================
// CONTENT BLOCKS — discriminated union for article body
// ============================================================================

/**
 * A content block is a structured piece of an article body. Using
 * structured blocks (rather than raw markdown) keeps the renderer
 * dependency-free and ensures consistent styling.
 *
 * `video`, `image`, and `screenshot` blocks all support a `placeholder`
 * mode: if `src` is omitted but `placeholder` is set, the renderer shows
 * a labeled "coming soon" component. Drop in a real `src` later — same
 * schema, no rewrite.
 */
export type KbBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; tone?: 'info' | 'tip' | 'warn'; title?: string; text: string }
  | { type: 'video'; src?: string; placeholder?: { description: string }; caption?: string }
  | { type: 'image'; src?: string; placeholder?: { description: string }; alt: string; caption?: string }
  | { type: 'screenshot'; src?: string; placeholder?: { description: string }; alt: string; caption?: string }
  | { type: 'steps'; items: KbStep[] }
  | { type: 'code'; language?: string; text: string }
  | { type: 'related'; articleSlugs: { categorySlug: string; articleSlug: string }[] };

export interface KbStep {
  title: string;
  text: string;
  /** Inline screenshot for this step. `src` empty → renders placeholder. */
  screenshot?: { description: string; src?: string };
}

// ============================================================================
// ARTICLE
// ============================================================================

export interface KbArticle {
  /** URL-safe identifier — used in the route path. */
  slug: string;
  /** Article title shown on cards and at the top of the detail view. */
  title: string;
  /** Short summary (1-2 sentences) — shown on lists and search results. */
  summary: string;
  /** Slug of the parent category. Must exist in KB_CATEGORIES. */
  categorySlug: string;
  /** Free-form tags for search relevance. Lowercase. */
  tags: string[];
  /**
   * Primary video at the top of the article. Either `src` (real URL)
   * or `placeholder.description` (renders the VideoPlaceholder).
   */
  primaryVideo?: { src?: string; placeholder?: { description: string } };
  /** ISO timestamp when the article was last updated. */
  updatedAt: string;
  /** Author display name. */
  author?: string;
  /** Featured on the home page if true. */
  featured?: boolean;
  /** Estimated read time in minutes. */
  readMinutes?: number;
  /** Structured body blocks. */
  body: KbBlock[];
}

// ============================================================================
// CATEGORY MODULE — what each category file exports
// ============================================================================

/**
 * Each `data/categories/<slug>.ts` file exports a default of this shape.
 * The aggregator in `data/index.ts` reads them all and flattens them.
 */
export interface CategoryModule {
  category: KbCategory;
  articles: KbArticle[];
}

// ============================================================================
// LEGACY URL REDIRECTS — pre-existing slugs that renamed in migration
// ============================================================================

/**
 * Maps old article slugs to new (categorySlug, articleSlug) tuples so that
 * inbound links to renamed articles continue to work via a Navigate replace.
 */
export interface RedirectEntry {
  /** Path under /support/knowledge-base/ — e.g. "marketing/csv-import". */
  fromPath: string;
  /** Path to redirect to — e.g. "contacts/import-contacts-from-csv". */
  toPath: string;
}
