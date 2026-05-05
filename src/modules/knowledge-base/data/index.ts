/**
 * BuilderLync Knowledge Base — aggregator and helper functions.
 *
 * This file imports every category module from `./categories/*.ts` and
 * exposes flat arrays + lookup helpers consumed by the KB pages and
 * Support hero card.
 *
 * Add a new category:
 *   1. Create `categories/<slug>.ts` exporting a `CategoryModule` default
 *   2. Import it below and add to `MODULES`
 *
 * The flat arrays (`KB_CATEGORIES`, `KB_ARTICLES`) are derived once at
 * module load — no runtime cost beyond the file imports.
 */

import type {
  KbArticle,
  KbCategory,
  CategoryModule,
  RedirectEntry,
  SectionId,
} from './types';
import { SECTIONS } from './types';

export type {
  KbArticle,
  KbCategory,
  KbBlock,
  KbStep,
  CategoryModule,
  SectionId,
  SectionMeta,
  RedirectEntry,
} from './types';
export { SECTIONS } from './types';

// Workspace
import dashboard from './categories/dashboard';
import pipelineAndOpportunities from './categories/pipeline-and-opportunities';
import jobs from './categories/jobs';
import calendar from './categories/calendar';
import contacts from './categories/contacts';
import conversations from './categories/conversations';
import jobCam from './categories/job-cam';
import proposals from './categories/proposals';
import measurements from './categories/measurements';
import payments from './categories/payments';

// Marketing & Growth
import formsAndFunnels from './categories/forms-and-funnels';
import campaigns from './categories/campaigns';
import socialPlanner from './categories/social-planner';
import googleAds from './categories/google-ads';
import metaAds from './categories/meta-ads';
import tiktokAds from './categories/tiktok-ads';
import attributionAndAnalytics from './categories/attribution-and-analytics';
import reputation from './categories/reputation';

// Sierra AI
import voiceAgents from './categories/voice-agents';
import smsAgents from './categories/sms-agents';
import knowledgeAndDocs from './categories/knowledge-and-docs';
import routingAndNumbers from './categories/routing-and-numbers';
import templates from './categories/sierra-templates';
import logsAndTesting from './categories/logs-and-testing';

// Field & Operations
import stormCanvassing from './categories/storm-canvassing';
import materialOrders from './categories/material-orders';
import workOrders from './categories/work-orders';
import catalogAndPricing from './categories/catalog-and-pricing';

// Automation & Reporting
import automations from './categories/automations';
import reporting from './categories/reporting';

// Settings (12)
import settingsProfile from './categories/settings-profile';
import settingsBusinessInfo from './categories/settings-business-info';
import settingsStaff from './categories/settings-staff';
import settingsRoles from './categories/settings-roles';
import settingsBilling from './categories/settings-billing';
import settingsIntegrations from './categories/settings-integrations';
import settingsCommunications from './categories/settings-communications';
import settingsPhoneSetup from './categories/settings-phone-setup';
import settingsBrandBoard from './categories/settings-brand-board';
import settingsCustomFields from './categories/settings-custom-fields';
import settingsNotifications from './categories/settings-notifications';
import settingsAuditLogs from './categories/settings-audit-logs';

// Support & Account
import gettingStarted from './categories/getting-started';
import accountAndPlan from './categories/account-and-plan';
import affiliates from './categories/affiliates';

// ============================================================================
// MODULES — registration in the order they should appear within their section
// ============================================================================

const MODULES: CategoryModule[] = [
  // Workspace
  dashboard, pipelineAndOpportunities, jobs, calendar, contacts, conversations,
  jobCam, proposals, measurements, payments,
  // Marketing & Growth
  formsAndFunnels, campaigns, socialPlanner, googleAds, metaAds, tiktokAds,
  attributionAndAnalytics, reputation,
  // Sierra AI
  voiceAgents, smsAgents, knowledgeAndDocs, routingAndNumbers, templates, logsAndTesting,
  // Field & Operations
  stormCanvassing, materialOrders, workOrders, catalogAndPricing,
  // Automation & Reporting
  automations, reporting,
  // Settings
  settingsProfile, settingsBusinessInfo, settingsStaff, settingsRoles,
  settingsBilling, settingsIntegrations, settingsCommunications, settingsPhoneSetup,
  settingsBrandBoard, settingsCustomFields, settingsNotifications, settingsAuditLogs,
  // Support & Account
  gettingStarted, accountAndPlan, affiliates,
];

// ============================================================================
// FLAT ARRAYS
// ============================================================================

export const KB_CATEGORIES: KbCategory[] = MODULES.map((m) => m.category);
export const KB_ARTICLES: KbArticle[] = MODULES.flatMap((m) => m.articles);

// ============================================================================
// REDIRECTS — old slugs that renamed during the v2 migration
// ============================================================================

export const KB_REDIRECTS: RedirectEntry[] = [
  // 29-article migration renames
  { fromPath: 'contacts/csv-import',                     toPath: 'contacts/import-contacts-from-csv' },
  { fromPath: 'sierra-ai/create-sierra-agent',           toPath: 'voice-agents/create-a-voice-agent' },
  { fromPath: 'payments-and-invoicing/send-an-invoice',  toPath: 'payments/create-an-invoice' },
  { fromPath: 'payments-and-invoicing/quickbooks-sync',  toPath: 'payments/quickbooks-two-way-sync' },
  { fromPath: 'material-and-work-orders/abc-supply-ordering', toPath: 'material-orders/place-a-material-order' },
  { fromPath: 'reporting/attribution-reports',           toPath: 'attribution-and-analytics/attribution-overview' },
  { fromPath: 'reporting/ai-reports',                    toPath: 'reporting/ai-executive-reports' },
  { fromPath: 'reputation/review-monitoring',            toPath: 'reputation/monitor-reviews' },
  { fromPath: 'settings-and-billing/subscription-and-billing', toPath: 'account-and-plan/subscription-and-billing' },

  // Old top-level categories that no longer exist (route was /support/knowledge-base/<old-cat>)
  { fromPath: 'pipeline-and-opportunities',              toPath: 'pipeline-and-opportunities' },  // unchanged path, kept for clarity
  { fromPath: 'sierra-ai',                               toPath: 'voice-agents' },
  { fromPath: 'payments-and-invoicing',                  toPath: 'payments' },
  { fromPath: 'material-and-work-orders',                toPath: 'material-orders' },
  { fromPath: 'settings-and-billing',                    toPath: 'account-and-plan' },
];

// ============================================================================
// HELPERS
// ============================================================================

/** All categories sorted by section order, then by `order`. */
export function getAllCategories(): KbCategory[] {
  return [...KB_CATEGORIES].sort((a, b) => {
    const sectionDelta = sectionOrderOf(a.section) - sectionOrderOf(b.section);
    if (sectionDelta !== 0) return sectionDelta;
    return a.order - b.order;
  });
}

/** Categories grouped by section, in order. */
export function getCategoriesBySection(): Array<{
  sectionId: SectionId;
  categories: KbCategory[];
}> {
  const bySection = new Map<SectionId, KbCategory[]>();
  for (const cat of getAllCategories()) {
    if (!bySection.has(cat.section)) bySection.set(cat.section, []);
    bySection.get(cat.section)!.push(cat);
  }
  return SECTIONS
    .map((s) => ({ sectionId: s.id, categories: bySection.get(s.id) ?? [] }))
    .filter((g) => g.categories.length > 0);
}

/** Look up a category by slug. */
export function getCategoryBySlug(slug: string): KbCategory | null {
  return KB_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/** All articles, most recently updated first. */
export function getAllArticles(): KbArticle[] {
  return [...KB_ARTICLES].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/** Articles in a given category. */
export function getArticlesByCategory(categorySlug: string): KbArticle[] {
  return KB_ARTICLES.filter((a) => a.categorySlug === categorySlug);
}

/** Look up an article by category + slug. */
export function getArticleBySlug(categorySlug: string, articleSlug: string): KbArticle | null {
  return (
    KB_ARTICLES.find(
      (a) => a.categorySlug === categorySlug && a.slug === articleSlug,
    ) ?? null
  );
}

/** Featured articles (max N). */
export function getFeaturedArticles(limit = 6): KbArticle[] {
  return KB_ARTICLES.filter((a) => a.featured).slice(0, limit);
}

/** Total article count. */
export function getArticleCount(): number {
  return KB_ARTICLES.length;
}

/** Total category count. */
export function getCategoryCount(): number {
  return KB_CATEGORIES.length;
}

/**
 * Keyword search — title > summary > tag > body. Case-insensitive.
 * Returns top `limit` articles ranked by score.
 */
export function searchArticles(query: string, limit = 20): KbArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  type Hit = { article: KbArticle; score: number };
  const hits: Hit[] = [];

  for (const article of KB_ARTICLES) {
    let score = 0;
    if (article.title.toLowerCase().includes(q)) score += 10;
    if (article.summary.toLowerCase().includes(q)) score += 5;
    if (article.tags.some((t) => t.toLowerCase().includes(q))) score += 3;

    if (score === 0) {
      const bodyText = article.body
        .map((b) => {
          if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'callout') return b.text;
          if (b.type === 'list') return b.items.join(' ');
          if (b.type === 'steps') return b.items.map((s) => `${s.title} ${s.text}`).join(' ');
          return '';
        })
        .join(' ')
        .toLowerCase();
      if (bodyText.includes(q)) score += 1;
    }

    if (score > 0) hits.push({ article, score });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit).map((h) => h.article);
}

/** Related articles — same category, ranked by tag overlap. */
export function getRelatedArticles(article: KbArticle, limit = 4): KbArticle[] {
  const candidates = KB_ARTICLES.filter(
    (a) => a.categorySlug === article.categorySlug && a.slug !== article.slug,
  );
  const tagSet = new Set(article.tags);
  return candidates
    .map((a) => ({ a, overlap: a.tags.filter((t) => tagSet.has(t)).length }))
    .sort((x, y) => y.overlap - x.overlap)
    .slice(0, limit)
    .map((x) => x.a);
}

/** Find a redirect target for an inbound URL. */
export function findRedirect(fromPath: string): string | null {
  const norm = fromPath.replace(/^\/+|\/+$/g, '');
  return KB_REDIRECTS.find((r) => r.fromPath === norm)?.toPath ?? null;
}

// ============================================================================
// INTERNAL
// ============================================================================

function sectionOrderOf(id: SectionId): number {
  const found = SECTIONS.find((s) => s.id === id);
  return found?.order ?? 999;
}
