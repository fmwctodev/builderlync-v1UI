/**
 * Studio design tokens (TS export).
 *
 * Mirror of the Tailwind config's color/spacing/motion values for components
 * that need them at runtime (Framer Motion variants, inline styles, JS-driven
 * animations). The Tailwind classes remain the canonical source for static CSS.
 *
 * Do NOT import this in legacy pages — the legacy palette stays defined in
 * tailwind.config.js. This file only exposes the new Studio system.
 */

export const studioColors = {
  paper: '#FAFAF7',
  canvas: '#0B0B0F',

  surface: {
    1: '#FFFFFF',
    2: '#F5F5F0',
    3: '#EDEDE7',
    'd-1': '#131318',
    'd-2': '#1A1A21',
    'd-3': '#22222B',
  },

  ink: {
    1: '#0F0F12',
    2: '#3F3F46',
    3: '#6B6B73',
    4: '#A0A0A8',
    'd-1': '#FAFAFA',
    'd-2': '#D4D4D8',
    'd-3': '#A0A0A8',
    'd-4': '#71717A',
  },

  edge: {
    soft:   'rgba(15,15,18,0.06)',
    base:   'rgba(15,15,18,0.10)',
    strong: 'rgba(15,15,18,0.16)',
    'd-soft':   'rgba(255,255,255,0.06)',
    'd-base':   'rgba(255,255,255,0.10)',
    'd-strong': 'rgba(255,255,255,0.16)',
  },

  signal: {
    50:  '#FFF1F2',
    100: '#FFE0E2',
    500: '#E11D2A',
    600: '#C7141F',
    700: '#A30F18',
    ink: '#3F0A0F',
  },

  ok:   '#0E8A5F',
  warn: '#B8791D',
  info: '#2563A6',

  stage: {
    lead:        '#6B6B73',
    booked:      '#2563A6',
    measurement: '#7A4FB5',
    proposal:    '#B8791D',
    job:         '#0E8A5F',
    invoice:     '#1F8A8A',
    production:  '#C7541F',
    closed:      '#A0A0A8',
  },
} as const;

export const studioRadii = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
} as const;

export const studioShadows = {
  s1: '0 1px 0 rgba(15,15,18,0.04), 0 1px 2px rgba(15,15,18,0.06)',
  s2: '0 4px 24px -8px rgba(15,15,18,0.10), 0 1px 0 rgba(15,15,18,0.04)',
  s3: '0 24px 48px -16px rgba(15,15,18,0.18), 0 2px 0 rgba(15,15,18,0.04)',
  ringSoft:   '0 0 0 1px rgba(15,15,18,0.08)',
  signalRing: '0 0 0 4px rgba(225,29,42,0.16)',
} as const;

export const studioMotion = {
  ease: {
    out:   [0.22, 1, 0.36, 1] as [number, number, number, number],
    inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  },
  spring: { type: 'spring' as const, stiffness: 380, damping: 32 },
  duration: {
    fast: 0.12,  // 120ms — micro-hovers, focus rings
    base: 0.20,  // 200ms — card hovers, fade-ups
    slow: 0.32,  // 320ms — drawer slide
  },
} as const;

export const studioSpacing = {
  pagePad:    32,
  sectionGap: 24,
  pagePadMobile: 16,
} as const;

export const studioLayout = {
  railWidth:         64,
  railWidthExpanded: 240,
  topbarHeight:      40,
  drawerWidth:       '50%',
  drawerMaxWidth:    840,
  mobileTabBarHeight: 56,
} as const;

/** Stage values used across the Pipeline view-model. */
export const STAGE_ORDER = [
  'lead',
  'booked_estimate',
  'measurement',
  'proposal',
  'job',
  'production',
  'invoice',
  'closed',
] as const;

export type PipelineStage = typeof STAGE_ORDER[number];

/** Display label for each stage — sentence case, no shouting. */
export const STAGE_LABELS: Record<PipelineStage, string> = {
  lead: 'Lead',
  booked_estimate: 'Booked',
  measurement: 'Measurement',
  proposal: 'Proposal',
  job: 'Job',
  production: 'Production',
  invoice: 'Invoice',
  closed: 'Closed',
};

/** Tailwind class name for each stage's chip. Match `studio-stage-*` in index.css. */
export const STAGE_CHIP_CLASS: Record<PipelineStage, string> = {
  lead: 'studio-stage-lead',
  booked_estimate: 'studio-stage-booked',
  measurement: 'studio-stage-measurement',
  proposal: 'studio-stage-proposal',
  job: 'studio-stage-job',
  production: 'studio-stage-production',
  invoice: 'studio-stage-invoice',
  closed: 'studio-stage-closed',
};

/** Hex value for each stage (Framer Motion / SVG / inline style use). */
export const STAGE_COLOR: Record<PipelineStage, string> = {
  lead: studioColors.stage.lead,
  booked_estimate: studioColors.stage.booked,
  measurement: studioColors.stage.measurement,
  proposal: studioColors.stage.proposal,
  job: studioColors.stage.job,
  production: studioColors.stage.production,
  invoice: studioColors.stage.invoice,
  closed: studioColors.stage.closed,
};

/**
 * Feature flag accessor — Vite import.meta.env style.
 *
 * Defaults to ON. Set `VITE_NEW_SHELL=0` (or `false`) in `.env.local` to
 * temporarily fall back to the legacy 240px sidebar Layout. The legacy
 * Layout file remains in the codebase and is wired up as a fallback so
 * a single env var can flip the entire app back without code changes.
 */
export const isNewShellEnabled = (): boolean => {
  const flag = (import.meta as { env?: Record<string, string> }).env?.VITE_NEW_SHELL;
  if (flag === '0' || flag === 'false') return false;
  return true; // default: Studio shell is on
};
