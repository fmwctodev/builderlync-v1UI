import type { SierraRecommendation, SierraAction, MarketingKPIs, Campaign } from '../types/marketing';
import { seedRecommendations, seedActions } from '../data/marketingSeedData';

export interface SierraEngineResult {
  recommendations: SierraRecommendation[];
  pendingActions: SierraAction[];
  completedActions: SierraAction[];
  summary: string;
}

export function generateSierraSummary(kpis: MarketingKPIs): string {
  const topChannel = 'Google Ads';
  const revenueFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpis.revenue_influenced);
  return `This week, your marketing generated ${kpis.leads} leads across all channels. ${topChannel} delivered the strongest close rate at 39%. You have ${kpis.jobs_won} jobs won this month, contributing ${revenueFormatted} in influenced revenue. Sierra has identified 4 actions that could add an estimated $72,000+ in pipeline this month — 3 require your approval.`;
}

export function getRecommendations(): SierraRecommendation[] {
  return seedRecommendations.filter((r) => r.status === 'active');
}

export function getPendingActions(): SierraAction[] {
  return seedActions.filter((a) => a.approval_state === 'pending');
}

export function getCompletedActions(): SierraAction[] {
  return seedActions.filter((a) => a.execution_state === 'completed');
}

export function approveAction(actionId: string, actions: SierraAction[]): SierraAction[] {
  return actions.map((a) =>
    a.id === actionId
      ? { ...a, approval_state: 'approved' as const, execution_state: 'completed' as const, executed_at: new Date().toISOString(), result_summary: 'Action approved and executed by user.' }
      : a
  );
}

export function rejectAction(actionId: string, actions: SierraAction[]): SierraAction[] {
  return actions.map((a) =>
    a.id === actionId ? { ...a, approval_state: 'rejected' as const } : a
  );
}

export function snoozeAction(actionId: string, actions: SierraAction[]): SierraAction[] {
  return actions.map((a) =>
    a.id === actionId ? { ...a, approval_state: 'snoozed' as const } : a
  );
}

export function generateCampaignAssets(brief: Partial<Campaign>) {
  const serviceLabel = brief.service_type?.replace(/_/g, ' ') || 'roofing';
  const goalLabel = brief.goal?.replace(/_/g, ' ') || 'leads';
  const offerLabel = brief.offer_type?.replace(/_/g, ' ') || 'free inspection';

  return {
    headlines: [
      `Free ${serviceLabel.charAt(0).toUpperCase() + serviceLabel.slice(1)} Estimate — Book Today`,
      `Trusted ${serviceLabel.charAt(0).toUpperCase() + serviceLabel.slice(1)} Contractors Near You`,
      `${offerLabel.charAt(0).toUpperCase() + offerLabel.slice(1)} — Limited Spots Available`,
    ],
    primary_text: [
      `Looking for reliable ${serviceLabel} services? Our certified team is ready to help. Get your ${offerLabel} today — no obligation.`,
      `Homeowners in your area trust us for ${serviceLabel}. Schedule your ${offerLabel} and let us protect your home.`,
    ],
    descriptions: ['Licensed & Insured', '5-Star Rated', 'Same-Day Availability'],
    ctas: [`Book ${offerLabel.charAt(0).toUpperCase() + offerLabel.slice(1)}`, 'Schedule Now', 'Get Started'],
    audience_suggestions: [
      `Homeowners 35-65 in target geography`,
      `Lookalike of past customers (top 10%)`,
      `Retargeting: website visitors last 30 days`,
    ],
    keyword_suggestions: [
      `${serviceLabel} near me`,
      `${offerLabel} ${serviceLabel}`,
      `best ${serviceLabel} contractor`,
      `${serviceLabel} company`,
    ],
    negative_keywords: ['diy', 'jobs', 'materials', 'how to', 'cost of'],
    creative_prompts: [
      `Before/after ${serviceLabel} photo from recent job`,
      `Crew on-site with branded truck in background`,
      `Homeowner testimonial with star rating overlay`,
    ],
    landing_page_structure: `Hero headline + offer → Trust badges (licensed/insured/5-star) → Short 3-field form → Review snippets → FAQ → Secondary CTA`,
    form_fields: ['Full Name', 'Phone Number', 'Property Address'],
    followup_automation_draft: `Immediate: SMS confirmation with booking link → 1hr: Auto-call attempt via Sierra → 24hr: Email nurture with social proof → 3-day: Re-engagement SMS if no response → 7-day: Final offer SMS`,
  };
}
