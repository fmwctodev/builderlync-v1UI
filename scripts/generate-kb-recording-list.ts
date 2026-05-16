/**
 * KB Recording List generator
 *
 * Walks every article in `src/modules/knowledge-base/data/index.ts` and
 * emits two deliverables under `docs/`:
 *
 *   - `KB_RECORDING_LIST.md`  — shot-by-shot shooting script per article
 *   - `KB_RECORDING_LIST.csv` — progress tracker (one row per article)
 *
 * Re-runnable. Run after any KB edit to refresh the list:
 *
 *   npm run kb:recording-list
 *
 * Why this exists: the user is producing ~281 walkthrough videos to back
 * the placeholder `videoDesc` slots in the KB. Each article already
 * declares its target video length and the click-through steps it
 * documents — this script turns that structured data into a recording
 * script the user can follow live while screen-capturing.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  KB_ARTICLES,
  KB_CATEGORIES,
  SECTIONS,
  type KbArticle,
  type KbBlock,
  type KbCategory,
} from '../src/modules/knowledge-base/data/index';

// ============================================================================
// Paths
// ============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(REPO_ROOT, 'docs');
const MD_PATH = resolve(DOCS_DIR, 'KB_RECORDING_LIST.md');
const CSV_PATH = resolve(DOCS_DIR, 'KB_RECORDING_LIST.csv');

// ============================================================================
// Article → recording-script intermediate form
//
// The `walkthrough()` factory transforms input into a `KbBlock[]` body, so
// we have to read the rendered body to recover the original-author intent.
// This intermediate shape captures every field the MD + CSV need without
// caring whether the article came from walkthrough() or raw().
// ============================================================================

interface ShotStep {
  title: string;
  text: string;
  screenshot?: string;
}

interface RecordingSpec {
  // Identity
  section: string; // e.g. "Workspace"
  sectionOrder: number;
  categorySlug: string;
  categoryName: string;
  categoryOrder: number;
  articleSlug: string;
  articleTitle: string;
  // Metadata
  featured: boolean;
  readMinutes: number;
  filePath: string;
  // Recording content
  videoDesc: string | undefined;
  estDurationSec: number;
  intro: string;
  prereqs: string[];
  steps: ShotStep[];
  tips: string[];
  warnings: string[];
  related: { categorySlug: string; articleSlug: string }[];
}

// ============================================================================
// Body-block parser — recovers shoot-script fields from rendered KbBlock[]
// ============================================================================

const isVideoBlock = (b: KbBlock): b is Extract<KbBlock, { type: 'video' }> =>
  b.type === 'video';
const isParagraph = (b: KbBlock): b is Extract<KbBlock, { type: 'paragraph' }> =>
  b.type === 'paragraph';
const isHeading = (b: KbBlock): b is Extract<KbBlock, { type: 'heading' }> =>
  b.type === 'heading';
const isList = (b: KbBlock): b is Extract<KbBlock, { type: 'list' }> =>
  b.type === 'list';
const isSteps = (b: KbBlock): b is Extract<KbBlock, { type: 'steps' }> =>
  b.type === 'steps';
const isCallout = (b: KbBlock): b is Extract<KbBlock, { type: 'callout' }> =>
  b.type === 'callout';
const isRelated = (b: KbBlock): b is Extract<KbBlock, { type: 'related' }> =>
  b.type === 'related';

/**
 * Walk the body blocks and extract the structured fields a recording
 * script needs. Order doesn't matter for the extracted fields, but the
 * factory always emits intro → video → prereqs → steps → callouts → related.
 */
function parseBody(article: KbArticle): {
  intro: string;
  videoDesc: string | undefined;
  prereqs: string[];
  steps: ShotStep[];
  tips: string[];
  warnings: string[];
  related: { categorySlug: string; articleSlug: string }[];
} {
  const blocks = article.body ?? [];

  // Intro = first paragraph block
  const intro = (() => {
    const p = blocks.find(isParagraph);
    return p ? p.text : article.summary;
  })();

  // Video description = first video block's caption or placeholder.description
  const videoBlock = blocks.find(isVideoBlock);
  const videoDesc = videoBlock
    ? videoBlock.caption ?? videoBlock.placeholder?.description
    : undefined;

  // Prereqs = list block immediately following the "Before you start" heading
  const prereqs: string[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const cur = blocks[i];
    const nxt = blocks[i + 1];
    if (isHeading(cur) && /before you start/i.test(cur.text) && isList(nxt)) {
      prereqs.push(...nxt.items);
      break;
    }
  }

  // Steps = first steps block (walkthrough articles only have one)
  const stepsBlock = blocks.find(isSteps);
  const steps: ShotStep[] = stepsBlock
    ? stepsBlock.items.map((s) => ({
        title: s.title,
        text: s.text,
        screenshot: s.screenshot?.description,
      }))
    : [];

  // Tips / warnings = callouts of the respective tone
  const tips: string[] = [];
  const warnings: string[] = [];
  for (const b of blocks) {
    if (!isCallout(b)) continue;
    if (b.tone === 'tip') tips.push(b.text);
    else if (b.tone === 'warn') warnings.push(b.text);
  }

  // Related links = first related block (note: field is `articleSlugs`, not `items`)
  const relatedBlock = blocks.find(isRelated);
  const related = relatedBlock
    ? relatedBlock.articleSlugs.map((r) => ({
        categorySlug: r.categorySlug,
        articleSlug: r.articleSlug,
      }))
    : [];

  return { intro, videoDesc, prereqs, steps, tips, warnings, related };
}

// ============================================================================
// Duration heuristic
// ============================================================================

/**
 * Parse videoDesc like "Create a job (2 min)" or "Monitor reviews (90 sec)"
 * back to seconds. Fall back to a step-count-based estimate when no time
 * is declared (30s per step + 15s intro/outro pad).
 */
function estimateDurationSec(videoDesc: string | undefined, stepCount: number): number {
  if (videoDesc) {
    const minMatch = videoDesc.match(/\((\d+)\s*min\)/i);
    if (minMatch) return Number(minMatch[1]) * 60;
    const secMatch = videoDesc.match(/\((\d+)\s*sec\)/i);
    if (secMatch) return Number(secMatch[1]);
  }
  return 30 * Math.max(1, stepCount) + 15;
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} sec`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

// ============================================================================
// Build the RecordingSpec for every article
// ============================================================================

function buildSpecs(): RecordingSpec[] {
  const categoryBySlug = new Map<string, KbCategory>(
    KB_CATEGORIES.map((c) => [c.slug, c]),
  );
  const sectionById = new Map(SECTIONS.map((s) => [s.id, s]));

  return KB_ARTICLES.map((article) => {
    const category = categoryBySlug.get(article.categorySlug);
    if (!category) {
      throw new Error(`Article ${article.slug} references missing category ${article.categorySlug}`);
    }
    const section = sectionById.get(category.section);
    if (!section) {
      throw new Error(`Category ${category.slug} references missing section ${category.section}`);
    }

    const parsed = parseBody(article);
    const estDurationSec = estimateDurationSec(parsed.videoDesc, parsed.steps.length);

    return {
      section: section.name,
      sectionOrder: section.order,
      categorySlug: category.slug,
      categoryName: category.name,
      categoryOrder: category.order,
      articleSlug: article.slug,
      articleTitle: article.title,
      featured: !!article.featured,
      readMinutes: article.readMinutes,
      filePath: `src/modules/knowledge-base/data/categories/${category.slug}.ts`,
      videoDesc: parsed.videoDesc,
      estDurationSec,
      intro: parsed.intro,
      prereqs: parsed.prereqs,
      steps: parsed.steps,
      tips: parsed.tips,
      warnings: parsed.warnings,
      related: parsed.related,
    };
  });
}

// ============================================================================
// Markdown renderer
// ============================================================================

const escMd = (s: string): string =>
  s
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, ' ')
    .trim();

const slugifyAnchor = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function renderMarkdown(specs: RecordingSpec[]): string {
  // Sort: section.order → category.order → original article order
  const sorted = [...specs].sort((a, b) => {
    if (a.sectionOrder !== b.sectionOrder) return a.sectionOrder - b.sectionOrder;
    if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
    return 0;
  });

  // Overview / counts
  const totalSec = sorted.reduce((acc, s) => acc + s.estDurationSec, 0);
  const totalHrs = (totalSec / 3600).toFixed(1);
  const featuredCount = sorted.filter((s) => s.featured).length;

  const sectionGroups = new Map<string, RecordingSpec[]>();
  for (const s of sorted) {
    const arr = sectionGroups.get(s.section) ?? [];
    arr.push(s);
    sectionGroups.set(s.section, arr);
  }

  const sectionLines = [...sectionGroups.entries()]
    .map(([name, arr]) => {
      const cats = new Set(arr.map((a) => a.categorySlug)).size;
      return `${name} ${arr.length} (${cats} cats)`;
    })
    .join(' · ');

  // TOC
  const tocLines: string[] = ['## Table of contents', ''];
  for (const [sectionName, sectionSpecs] of sectionGroups) {
    const sectionAnchor = slugifyAnchor(sectionName);
    const catGroups = new Map<string, RecordingSpec[]>();
    for (const s of sectionSpecs) {
      const arr = catGroups.get(s.categorySlug) ?? [];
      arr.push(s);
      catGroups.set(s.categorySlug, arr);
    }
    tocLines.push(
      `- [${sectionName}](#${sectionAnchor}) — ${catGroups.size} categories · ${sectionSpecs.length} articles`,
    );
    for (const [, catSpecs] of catGroups) {
      const catName = catSpecs[0].categoryName;
      const anchor = slugifyAnchor(catName);
      tocLines.push(
        `  - [${catName}](#${anchor}) (${catSpecs.length})`,
      );
    }
  }

  // Body
  const bodyParts: string[] = [];
  for (const [sectionName, sectionSpecs] of sectionGroups) {
    bodyParts.push(`\n## ${sectionName}\n`);

    const catGroups = new Map<string, RecordingSpec[]>();
    for (const s of sectionSpecs) {
      const arr = catGroups.get(s.categorySlug) ?? [];
      arr.push(s);
      catGroups.set(s.categorySlug, arr);
    }

    for (const [, catSpecs] of catGroups) {
      const catName = catSpecs[0].categoryName;
      bodyParts.push(`\n### ${catName}\n`);
      bodyParts.push(`> _${catSpecs.length} articles · source: \`${catSpecs[0].filePath}\`_\n`);

      for (const spec of catSpecs) {
        const star = spec.featured ? '⭐ ' : '';
        const duration = formatDuration(spec.estDurationSec);
        bodyParts.push(`\n#### ${star}${spec.articleTitle}`);
        bodyParts.push(
          `**Slug:** \`${spec.categorySlug}/${spec.articleSlug}\` · ` +
          `**Target length:** ${duration}` +
          (spec.videoDesc && spec.videoDesc !== `${spec.articleTitle} (${duration})`
            ? ` · **Video title:** "${spec.videoDesc}"`
            : '') +
          (spec.featured ? ' · **Featured (priority)**' : ''),
        );
        bodyParts.push(`\n**Goal:** ${spec.intro}\n`);

        if (spec.prereqs.length > 0) {
          bodyParts.push(`**Before you start:**`);
          spec.prereqs.forEach((p) => bodyParts.push(`- ${p}`));
          bodyParts.push('');
        }

        // Shot list table
        if (spec.steps.length > 0) {
          bodyParts.push(`**Shot list:**\n`);
          bodyParts.push(
            `| # | What to show | What to click / say | Screenshot focus |`,
          );
          bodyParts.push(`|---|---|---|---|`);
          spec.steps.forEach((step, idx) => {
            bodyParts.push(
              `| ${idx + 1} | ${escMd(step.title)} | ${escMd(step.text)} | ${escMd(step.screenshot ?? '—')} |`,
            );
          });
          bodyParts.push('');
        } else {
          bodyParts.push(`_No discrete steps in source — record as a free-form overview._\n`);
        }

        if (spec.tips.length > 0 || spec.warnings.length > 0) {
          bodyParts.push(`**Mention on camera:**`);
          spec.tips.forEach((t) => bodyParts.push(`- 💡 Tip: ${t}`));
          spec.warnings.forEach((w) => bodyParts.push(`- ⚠️ Watch out: ${w}`));
          bodyParts.push('');
        }

        if (spec.related.length > 0) {
          bodyParts.push(
            `**Up next (cross-reference at end of recording):** ` +
            spec.related
              .map((r) => `\`${r.categorySlug}/${r.articleSlug}\``)
              .join(', '),
          );
          bodyParts.push('');
        }

        bodyParts.push(`---\n`);
      }
    }
  }

  return [
    `# BuilderLync KB — Screen Recording Master List`,
    ``,
    `_Generated by \`scripts/generate-kb-recording-list.ts\`. Re-run with \`npm run kb:recording-list\` after any KB edit._`,
    ``,
    `## Overview`,
    ``,
    `- **Total articles:** ${sorted.length}`,
    `- **Categories:** ${new Set(sorted.map((s) => s.categorySlug)).size}`,
    `- **Sections:** ${sectionGroups.size}`,
    `- **Featured (priority):** ${featuredCount}`,
    `- **Estimated total recording time:** ~${totalHrs} hrs of raw footage (sum of per-video estimates)`,
    `- **By section:** ${sectionLines}`,
    ``,
    `## How to use this document`,
    ``,
    `Each article below is a self-contained shooting script. Open the BuilderLync app in your screen-recording tool, navigate to the relevant module, then follow the shot list row-by-row. Mention the tips/warnings on camera. At the end of the recording, optionally point viewers to the cross-referenced articles in **Up next**.`,
    ``,
    `Featured articles (⭐) are the priority set — record these first since they're surfaced on the KB home and the Support hero.`,
    ``,
    `Companion progress tracker: \`docs/KB_RECORDING_LIST.csv\` — drop into Notion / Sheets / Airtable to track status / URL / notes per recording.`,
    ``,
    tocLines.join('\n'),
    bodyParts.join('\n'),
  ].join('\n');
}

// ============================================================================
// CSV renderer
// ============================================================================

function escCsv(v: string | number | boolean | undefined | null): string {
  if (v === undefined || v === null) return '';
  const s = String(v);
  // Quote if contains comma, quote, or newline
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function renderCsv(specs: RecordingSpec[]): string {
  const sorted = [...specs].sort((a, b) => {
    if (a.sectionOrder !== b.sectionOrder) return a.sectionOrder - b.sectionOrder;
    if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
    return a.articleSlug.localeCompare(b.articleSlug);
  });

  const headers = [
    'section',
    'section_order',
    'category_slug',
    'category_name',
    'category_order',
    'article_slug',
    'article_title',
    'featured',
    'read_minutes',
    'video_desc',
    'est_duration_sec',
    'step_count',
    'prereq_count',
    'has_tips',
    'has_warnings',
    'file_path',
    'recording_status',
    'recorded_url',
    'notes',
  ];

  const lines = [headers.join(',')];
  for (const s of sorted) {
    lines.push(
      [
        escCsv(s.section),
        escCsv(s.sectionOrder),
        escCsv(s.categorySlug),
        escCsv(s.categoryName),
        escCsv(s.categoryOrder),
        escCsv(s.articleSlug),
        escCsv(s.articleTitle),
        escCsv(s.featured),
        escCsv(s.readMinutes),
        escCsv(s.videoDesc ?? ''),
        escCsv(s.estDurationSec),
        escCsv(s.steps.length),
        escCsv(s.prereqs.length),
        escCsv(s.tips.length > 0),
        escCsv(s.warnings.length > 0),
        escCsv(s.filePath),
        '', // recording_status — user fills
        '', // recorded_url — user fills
        '', // notes — user fills
      ].join(','),
    );
  }
  return lines.join('\n');
}

// ============================================================================
// Main
// ============================================================================

function main() {
  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

  const specs = buildSpecs();

  const md = renderMarkdown(specs);
  writeFileSync(MD_PATH, md, 'utf8');

  const csv = renderCsv(specs);
  writeFileSync(CSV_PATH, csv, 'utf8');

  const totalSec = specs.reduce((acc, s) => acc + s.estDurationSec, 0);
  const totalHrs = (totalSec / 3600).toFixed(1);
  const featured = specs.filter((s) => s.featured).length;

  console.log(`✓ Wrote ${MD_PATH}`);
  console.log(`  - ${specs.length} articles · ${featured} featured · ~${totalHrs} hrs estimated`);
  console.log(`✓ Wrote ${CSV_PATH}`);
  console.log(`  - ${specs.length} data rows + 1 header`);
}

main();
