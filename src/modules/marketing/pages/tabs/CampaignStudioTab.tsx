import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MoreHorizontal, ChevronRight, Check, X, Eye, Copy, Loader2, Play, Pause } from 'lucide-react';
import { GlobalFilterBar } from '../../components/sierra/GlobalFilterBar';
import { marketingCampaignsApi } from '../../services/marketingCampaignsApi';
import { generateCampaignAssets } from '../../services/sierraEngine';
import type { Campaign, CampaignWizardState, GoalType, ServiceType, ChannelType } from '../../types/marketing';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending_approval: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const WIZARD_STEPS = [
  { id: 1, label: 'Goal' },
  { id: 2, label: 'Service' },
  { id: 3, label: 'Geography' },
  { id: 4, label: 'Budget' },
  { id: 5, label: 'Channels' },
  { id: 6, label: 'Creative' },
  { id: 7, label: 'Review' },
];

const GOALS: { value: GoalType; label: string; description: string }[] = [
  { value: 'roof_inspections', label: 'Free Roof Inspections', description: 'Drive appointment bookings for free inspections' },
  { value: 'storm_response', label: 'Storm Response Leads', description: 'Capitalize on storm damage in your area' },
  { value: 'estimates_booked', label: 'Estimates Booked', description: 'Fill your estimate calendar' },
  { value: 'emergency_repairs', label: 'Emergency Repairs', description: 'Capture urgent repair calls' },
  { value: 'financing_leads', label: 'Financing Leads', description: 'Promote financing options to close more jobs' },
  { value: 'calls', label: 'Inbound Calls', description: 'Drive phone calls to your team' },
  { value: 'form_leads', label: 'Form Submissions', description: 'Collect leads via landing page forms' },
  { value: 'brand_awareness', label: 'Brand Awareness', description: 'Build local brand recognition' },
];

const SERVICES: { value: ServiceType; label: string }[] = [
  { value: 'residential_roofing', label: 'Residential Roofing' },
  { value: 'commercial_roofing', label: 'Commercial Roofing' },
  { value: 'roof_repair', label: 'Roof Repair' },
  { value: 'emergency_tarp', label: 'Emergency Tarp' },
  { value: 'siding', label: 'Siding' },
  { value: 'gutters', label: 'Gutters' },
  { value: 'solar', label: 'Solar' },
];

const CHANNELS_OPTIONS: { value: ChannelType; label: string; recommended?: boolean }[] = [
  { value: 'google_ads', label: 'Google Search Ads', recommended: true },
  { value: 'local_services_ads', label: 'Google Local Services Ads', recommended: true },
  { value: 'meta_ads', label: 'Meta (Facebook/Instagram)', recommended: true },
  { value: 'tiktok_ads', label: 'TikTok Ads' },
  { value: 'microsoft_ads', label: 'Microsoft Ads' },
  { value: 'youtube', label: 'YouTube Ads' },
];

const BUDGET_MODES = [
  { value: 'conservative', label: 'Conservative', range: '$30–50/day', description: 'Lower risk, slower ramp' },
  { value: 'balanced', label: 'Balanced', range: '$75–100/day', description: 'Recommended for most campaigns' },
  { value: 'aggressive', label: 'Aggressive', range: '$150–200/day', description: 'Maximum lead volume' },
  { value: 'storm_surge', label: 'Storm Surge', range: '$300+/day', description: 'All-in during active storm events' },
];

const BUDGET_DAILY_MAP: Record<string, number> = {
  conservative: 40,
  balanced: 87,
  aggressive: 175,
  storm_surge: 350,
};

interface WizardProps {
  onClose: () => void;
  onCreated: (c: Campaign) => void;
  orgId: string | null;
}

const CampaignWizard: React.FC<WizardProps> = ({ onClose, onCreated, orgId }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<CampaignWizardState>({});
  const [generatedAssets, setGeneratedAssets] = useState<ReturnType<typeof generateCampaignAssets> | null>(null);
  const [showAssets, setShowAssets] = useState(false);
  const [launching, setLaunching] = useState(false);

  const update = (patch: Partial<CampaignWizardState>) => setState((s) => ({ ...s, ...patch }));

  const handleNext = () => {
    if (step === 5 && !generatedAssets) {
      const assets = generateCampaignAssets({ goal: state.goal, service_type: state.service_type, offer_type: state.goal?.replace(/_/g, ' ') });
      setGeneratedAssets(assets);
    }
    if (step < 7) setStep((s) => s + 1);
  };

  const canNext = () => {
    if (step === 1) return !!state.goal;
    if (step === 2) return !!state.service_type;
    if (step === 3) return !!state.geography;
    if (step === 4) return !!state.budget_mode;
    return true;
  };

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const dailyBudget = state.budget_mode ? BUDGET_DAILY_MAP[state.budget_mode] ?? 75 : 75;
      const campaign = await marketingCampaignsApi.createCampaign({
        name: `${state.goal?.replace(/_/g, ' ')} — ${state.service_type?.replace(/_/g, ' ')} (${state.geography})`,
        goal: state.goal,
        service_type: state.service_type,
        geography: state.geography,
        budget_daily: dailyBudget,
        budget_monthly: dailyBudget * 30,
        channels: state.channels || [],
        generated_assets: generatedAssets || undefined,
      }, orgId);
      onCreated(campaign);
      onClose();
    } catch {
      setLaunching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Campaign — Sierra Wizard</h2>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of {WIZARD_STEPS.length}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          {WIZARD_STEPS.map((s) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer ${step >= s.id ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}
                onClick={() => s.id < step && setStep(s.id)}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step > s.id ? 'bg-red-500 text-white' : step === s.id ? 'bg-red-100 text-red-600 border-2 border-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                  {step > s.id ? <Check size={10} /> : s.id}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {s.id < WIZARD_STEPS.length && <div className={`flex-1 h-0.5 ${step > s.id ? 'bg-red-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">What's the primary goal of this campaign?</p>
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => update({ goal: g.value })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${state.goal === g.value ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{g.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Which service are you promoting?</p>
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update({ service_type: s.value })}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${state.service_type === s.value ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Where should this campaign run?</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['service_area', 'radius', 'zip_list', 'storm_zones'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ geography_type: t })}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${state.geography_type === t ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{t.replace(/_/g, ' ')}</p>
                  </button>
                ))}
              </div>
              <input
                value={state.geography ?? ''}
                onChange={(e) => update({ geography: e.target.value })}
                placeholder="e.g. Tampa, FL 30-mile radius"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Set your budget intensity</p>
              {BUDGET_MODES.map((b) => (
                <button
                  key={b.value}
                  onClick={() => update({ budget_mode: b.value as CampaignWizardState['budget_mode'] })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${state.budget_mode === b.value ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{b.range}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Which channels should this campaign use?</p>
              {CHANNELS_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    const current = state.channels ?? [];
                    const next = current.includes(c.value) ? current.filter((x) => x !== c.value) : [...current, c.value];
                    update({ channels: next });
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex justify-between items-center ${(state.channels ?? []).includes(c.value) ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.label}</p>
                    {c.recommended && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Recommended</span>}
                  </div>
                  {(state.channels ?? []).includes(c.value) && <Check size={16} className="text-red-500" />}
                </button>
              ))}
            </div>
          )}

          {step === 6 && generatedAssets && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Sierra-generated creative assets</p>
                <button onClick={() => setShowAssets(!showAssets)} className="text-xs text-red-600 flex items-center gap-1">
                  <Eye size={12} /> {showAssets ? 'Hide' : 'Preview all'}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Headlines</p>
                  {generatedAssets.headlines.map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <p className="text-sm text-gray-900 dark:text-white">{h}</p>
                      <button className="text-gray-400 hover:text-gray-600"><Copy size={12} /></button>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedAssets.keyword_suggestions.map((k, i) => (
                      <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Audience Suggestions</p>
                  {generatedAssets.audience_suggestions.map((a, i) => (
                    <p key={i} className="text-xs text-gray-600 dark:text-gray-400 py-0.5">• {a}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Follow-up Automation</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{generatedAssets.followup_automation_draft}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Launch Mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto_launch', 'review_before_launch', 'draft_only'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => update({ approval_mode: m })}
                      className={`p-2 text-xs rounded-lg border-2 transition-all font-medium ${state.approval_mode === m ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                    >
                      {m === 'auto_launch' ? 'Auto Launch' : m === 'review_before_launch' ? 'Review First' : 'Save Draft'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Campaign Summary</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                {[
                  { label: 'Goal', value: state.goal?.replace(/_/g, ' ') },
                  { label: 'Service', value: state.service_type?.replace(/_/g, ' ') },
                  { label: 'Geography', value: state.geography },
                  { label: 'Budget Mode', value: state.budget_mode?.replace(/_/g, ' ') },
                  { label: 'Channels', value: (state.channels ?? []).join(', ').replace(/_/g, ' ') || 'None selected' },
                  { label: 'Launch Mode', value: state.approval_mode?.replace(/_/g, ' ') ?? 'Draft' },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{r.value ?? '—'}</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Sierra's Forecast</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">Based on your settings, Sierra estimates 18–34 leads/month at $42–68 CPL, with 3–6 jobs won at the current close rate.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => step > 1 ? setStep((s) => s - 1) : onClose()}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={step === 7 ? handleLaunch : handleNext}
            disabled={!canNext() || launching}
            className="text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            {launching && <Loader2 size={14} className="animate-spin" />}
            {step === 7 ? (launching ? 'Creating...' : 'Launch Campaign') : 'Continue'}
            {step < 7 && !launching && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CampaignStudioTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [dateRange, setDateRange] = useState('30d');
  const [showWizard, setShowWizard] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketingCampaignsApi.getCampaigns(orgId);
      setCampaigns(data);
    } catch {
      addToast('error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async (c: Campaign) => {
    const newStatus = c.status === 'active' ? 'paused' : 'active';
    try {
      await marketingCampaignsApi.updateStatus(c.id, newStatus, orgId);
      setCampaigns((prev) => prev.map((x) => x.id === c.id ? { ...x, status: newStatus } : x));
      addToast('success', `Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch {
      addToast('error', 'Failed to update campaign status');
    }
  };

  const handleDuplicate = async (c: Campaign) => {
    try {
      const copy = await marketingCampaignsApi.duplicateCampaign(c.id, orgId);
      setCampaigns((prev) => [copy, ...prev]);
      addToast('success', 'Campaign duplicated');
    } catch {
      addToast('error', 'Failed to duplicate campaign');
    }
  };

  const filtered = campaigns.filter((c) => filter === 'all' || c.status === filter);
  const totalSpend = campaigns.filter((c) => c.status === 'active').reduce((s, c) => s + c.spend, 0);
  const totalLeads = campaigns.filter((c) => c.status === 'active').reduce((s, c) => s + c.leads, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-6">
      <GlobalFilterBar dateRange={dateRange} onDateRangeChange={setDateRange} onChannelChange={() => {}} />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Spend', value: loading ? '—' : `$${(totalSpend / 1000).toFixed(1)}K` },
          { label: 'Total Leads', value: loading ? '—' : totalLeads.toString() },
          { label: 'Revenue Attributed', value: loading ? '—' : `$${(totalRevenue / 1000).toFixed(0)}K` },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'active', 'paused', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spend</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jobs Won</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Close %</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">No campaigns found.</td>
                  </tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{c.service_type?.replace(/_/g, ' ')} · {c.channels.join(', ').replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[c.status]}`}>{c.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">${c.spend.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{c.leads}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">${c.cpl}</td>
                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">{c.jobs_won}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">${c.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${c.close_rate >= 30 ? 'text-green-600 dark:text-green-400' : c.close_rate >= 20 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                        {c.close_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(c.status === 'active' || c.status === 'paused') && (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title={c.status === 'active' ? 'Pause' : 'Activate'}
                          >
                            {c.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(c)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Duplicate"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showWizard && (
        <CampaignWizard
          onClose={() => setShowWizard(false)}
          onCreated={(c) => {
            setCampaigns((prev) => [c, ...prev]);
            addToast('success', 'Campaign created successfully');
          }}
          orgId={orgId}
        />
      )}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
