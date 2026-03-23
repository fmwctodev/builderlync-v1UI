import React, { useState, useCallback, useEffect } from 'react';
import { Plus, ArrowRight, TrendingUp, Users, Eye, Copy, ExternalLink, BarChart2, Loader2 } from 'lucide-react';
import type { MarketingFunnel } from '../../types/marketing';
import { funnelsApi } from '../../services/funnelsApi';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

const FUNNEL_TEMPLATES = [
  {
    id: 't1',
    name: 'Storm Response Funnel',
    description: 'Emergency tarp + inspection offer. Best for post-storm surge.',
    expectedCPL: '$22',
    closeRate: '38%',
    category: 'storm',
    funnel_type: 'storm_response',
    headline: 'Storm Damage? We Respond in 24 Hours',
    offer: 'Free storm damage inspection',
  },
  {
    id: 't2',
    name: 'Free Inspection Funnel',
    description: 'Classic free roof inspection offer. Works year-round.',
    expectedCPL: '$45',
    closeRate: '28%',
    category: 'inspection',
    funnel_type: 'free_inspection',
    headline: 'Get a Free Roof Inspection Today',
    offer: 'Free inspection with no obligation',
  },
  {
    id: 't3',
    name: 'Insurance Claim Funnel',
    description: 'Designed for homeowners with hail or wind damage claims.',
    expectedCPL: '$38',
    closeRate: '42%',
    category: 'insurance',
    funnel_type: 'insurance_claim',
    headline: 'We Handle Your Insurance Claim Start to Finish',
    offer: 'Free damage assessment + claim assistance',
  },
  {
    id: 't4',
    name: 'Financing Offer Funnel',
    description: '0% financing for 18 months. Targets price-sensitive leads.',
    expectedCPL: '$52',
    closeRate: '22%',
    category: 'financing',
    funnel_type: 'financing',
    headline: '0% Financing for 18 Months on Any Roof',
    offer: '0% APR financing available',
  },
  {
    id: 't5',
    name: 'Senior Homeowner Funnel',
    description: 'Senior discount + easy scheduling for 55+ homeowners.',
    expectedCPL: '$41',
    closeRate: '31%',
    category: 'demographic',
    funnel_type: 'senior_discount',
    headline: 'Senior Homeowner Special — Save 10%',
    offer: '10% senior discount on all services',
  },
  {
    id: 't6',
    name: 'Commercial Roofing Funnel',
    description: 'B2B targeted. Property managers and commercial owners.',
    expectedCPL: '$88',
    closeRate: '18%',
    category: 'commercial',
    funnel_type: 'commercial',
    headline: 'Commercial Roofing — On Time, On Budget',
    offer: 'Free commercial roof assessment',
  },
];

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

interface FunnelCardProps {
  funnel: MarketingFunnel;
}

const FunnelCard: React.FC<FunnelCardProps> = ({ funnel }) => {
  const conversionRate = funnel.submissions > 0 ? ((funnel.appointments_booked / funnel.submissions) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{funnel.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[funnel.status]}`}>{funnel.status}</span>
          </div>
          <p className="text-xs text-gray-500">{funnel.funnel_type.replace(/_/g, ' ')} · {funnel.offer}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600"><ExternalLink size={14} /></button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1.5 font-medium">Mini Funnel</p>
        <div className="flex items-center gap-1 text-xs">
          <div className="flex-1 text-center">
            <p className="font-bold text-gray-900 dark:text-white">{funnel.submissions}</p>
            <p className="text-gray-500">Submissions</p>
          </div>
          <ArrowRight size={10} className="text-gray-400 shrink-0" />
          <div className="flex-1 text-center">
            <p className="font-bold text-gray-900 dark:text-white">{funnel.appointments_booked}</p>
            <p className="text-gray-500">Appointments</p>
          </div>
          <ArrowRight size={10} className="text-gray-400 shrink-0" />
          <div className="flex-1 text-center">
            <p className="font-bold text-green-600 dark:text-green-400">{funnel.close_rate}%</p>
            <p className="text-gray-500">Close Rate</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          <TrendingUp size={10} className="inline mr-0.5" />{conversionRate}% form→appt
        </span>
        <div className="flex gap-1.5 ml-auto">
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Eye size={12} /> Preview
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Copy size={12} /> Embed
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <BarChart2 size={12} /> Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export const FormsFunnelsTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [funnels, setFunnels] = useState<MarketingFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'funnels' | 'templates' | 'forms'>('funnels');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await funnelsApi.getFunnels(orgId);
      setFunnels(data);
    } catch {
      addToast('error', 'Failed to load funnels');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const handleNewFunnel = async () => {
    try {
      const funnel = await funnelsApi.createFunnel({
        name: 'New Funnel',
        funnel_type: 'free_inspection',
        headline: '',
        offer: '',
      }, orgId);
      setFunnels((prev) => [funnel, ...prev]);
      addToast('success', 'New funnel created');
      setActiveTab('funnels');
    } catch {
      addToast('error', 'Failed to create funnel');
    }
  };

  const handleUseTemplate = async (template: typeof FUNNEL_TEMPLATES[number]) => {
    setCreatingTemplateId(template.id);
    try {
      const funnel = await funnelsApi.createFunnel({
        name: template.name,
        funnel_type: template.funnel_type,
        headline: template.headline,
        offer: template.offer,
      }, orgId);
      setFunnels((prev) => [funnel, ...prev]);
      addToast('success', `"${template.name}" added to your funnels`);
      setActiveTab('funnels');
    } catch {
      addToast('error', 'Failed to create funnel from template');
    } finally {
      setCreatingTemplateId(null);
    }
  };

  const totalSubmissions = funnels.reduce((s, f) => s + f.submissions, 0);
  const totalAppointments = funnels.reduce((s, f) => s + f.appointments_booked, 0);
  const avgCloseRate = funnels.length > 0 ? (funnels.reduce((s, f) => s + f.close_rate, 0) / funnels.length).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Funnels', value: funnels.filter((f) => f.status === 'active').length.toString() },
          { label: 'Total Submissions', value: totalSubmissions.toLocaleString() },
          { label: 'Appointments Booked', value: totalAppointments.toLocaleString() },
          { label: 'Avg Close Rate', value: `${avgCloseRate}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['funnels', 'templates', 'forms'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${activeTab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              {t === 'funnels' ? 'My Funnels' : t === 'templates' ? 'Templates' : 'Forms Library'}
            </button>
          ))}
        </div>
        <button
          onClick={handleNewFunnel}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          {activeTab === 'forms' ? 'New Form' : 'New Funnel'}
        </button>
      </div>

      {activeTab === 'funnels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funnels.length === 0 && (
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No funnels yet</p>
              <p className="text-xs text-gray-500 mb-4">Create a funnel or use a template to get started.</p>
              <button
                onClick={() => setActiveTab('templates')}
                className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Browse Templates
              </button>
            </div>
          )}
          {funnels.map((f) => <FunnelCard key={f.id} funnel={f} />)}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FUNNEL_TEMPLATES.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium capitalize">{t.category}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{t.description}</p>
              <div className="flex items-center gap-4 text-xs mb-3">
                <div>
                  <p className="text-gray-500">Expected CPL</p>
                  <p className="font-bold text-gray-900 dark:text-white">{t.expectedCPL}</p>
                </div>
                <div>
                  <p className="text-gray-500">Close Rate</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{t.closeRate}</p>
                </div>
              </div>
              <button
                onClick={() => handleUseTemplate(t)}
                disabled={creatingTemplateId === t.id}
                className="w-full flex items-center justify-center gap-1.5 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                {creatingTemplateId === t.id && <Loader2 size={12} className="animate-spin" />}
                Use This Template
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'forms' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Forms Library</p>
          <p className="text-xs text-gray-500 mb-4">Manage your lead capture forms, embed codes, and form submissions.</p>
          <button className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            Go to Forms Builder
          </button>
        </div>
      )}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
