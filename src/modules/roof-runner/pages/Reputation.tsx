import React, { useState } from 'react';
import { Send, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Camera, MessageSquare, MapPin, Star, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SendReviewRequestModal from '../components/reputation/SendReviewRequestModal';
import OverviewTab from '../components/reputation/OverviewTab';
import RequestsTab from '../components/reputation/RequestsTab';
import ReviewsTab from '../components/reputation/ReviewsTab';
import WidgetsTab from '../components/reputation/WidgetsTab';
import ListingsTab from '../components/reputation/ListingsTab';
import SettingsTab from '../components/reputation/SettingsTab';

const Reputation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'Requests' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'widgets', label: 'Widgets' },
    { id: 'listings', label: 'Listings' },
    { id: 'settings', label: 'Settings' },
    { id: 'gbp-optimization', label: 'GBP Optimization' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onOpenModal={() => setIsModalOpen(true)} />;
      case 'requests':
        return <RequestsTab onOpenModal={() => setIsModalOpen(true)} />;
      case 'reviews':
        return <ReviewsTab onOpenModal={() => setIsModalOpen(true)} />;
      case 'widgets':
        return <WidgetsTab />;
      case 'listings':
        return <ListingsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'gbp-optimization':
        return <GbpOptimizationTab onIntegrateGbp={() => navigate('/marketing/integrations')} />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Content for {tabs.find(tab => tab.id === activeTab)?.label} tab coming soon...
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reputation</h1>
        </div>

        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white rounded-t-lg'
                  : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>

      <SendReviewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Reputation;

// ============================================================================
// GBP Optimization tab — UXA-042 fix
//
// Replaces the previous "Nothing to see here!" placeholder with a structured
// optimization checklist covering the four highest-leverage GBP signals:
// posting cadence, photo coverage, review velocity, and NAP consistency.
// Each row shows status (✓ / warning / blocked), explanation, and a
// recommendation. Until the GBP integration is wired, items appear as
// "Connect to scan" with a CTA pointing to the GBP integration setup.
//
// When `localStorage.getItem('builderlync.gbp.connected') === 'true'` we
// render the same checklist with sample passing scores so users can see
// what a healthy GBP profile looks like. Real metrics will replace these
// once the GBP API is integrated server-side.
// ============================================================================

type GbpCheckStatus = 'pass' | 'warn' | 'fail' | 'unknown';

interface GbpCheck {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  unconnectedHint: string;
  // Demo values for the connected-state preview
  demoStatus: GbpCheckStatus;
  demoMetric: string;
  demoNarrative: string;
  recommendation: string;
}

const GBP_CHECKS: GbpCheck[] = [
  {
    id: 'posting-cadence',
    icon: MessageSquare,
    title: 'Posting cadence',
    description: 'Google ranks active profiles. Posting at least weekly signals an open, attentive business.',
    unconnectedHint: 'We will scan your posts and recommend a cadence once GBP is connected.',
    demoStatus: 'warn',
    demoMetric: 'Last post: 18 days ago',
    demoNarrative: 'Your profile has 2 posts in the last 90 days — Google rewards businesses posting at least weekly.',
    recommendation: 'Aim for 1 update per week. Mix offers, project completions, and seasonal tips.',
  },
  {
    id: 'photo-coverage',
    icon: Camera,
    title: 'Photo coverage',
    description: 'Profiles with 100+ photos earn 520% more calls than the GBP average.',
    unconnectedHint: 'We will count interior, exterior, team, and project photos once GBP is connected.',
    demoStatus: 'pass',
    demoMetric: '127 photos · all categories covered',
    demoNarrative: 'You have photos in every category Google scores: logo, cover, interior, exterior, team, products, identity.',
    recommendation: 'Add 1-2 fresh project photos monthly to keep the profile feeling current.',
  },
  {
    id: 'review-velocity',
    icon: Star,
    title: 'Review velocity',
    description: 'Steady review flow signals an active, trustworthy business — outweighing total review count.',
    unconnectedHint: 'We will measure new reviews per month + your reply rate once GBP is connected.',
    demoStatus: 'warn',
    demoMetric: '4 new reviews · 90 days · 50% reply rate',
    demoNarrative: 'Reply rate is the lowest-effort, highest-impact lever. Aim for 100% within 48 hours.',
    recommendation: 'Use the Reputation → Requests tab to ask 5 customers/week for a review.',
  },
  {
    id: 'nap-consistency',
    icon: MapPin,
    title: 'NAP consistency',
    description: 'Name / address / phone number must match exactly across GBP, your website, and major directories.',
    unconnectedHint: 'We will diff your GBP listing against your website and top directories once connected.',
    demoStatus: 'fail',
    demoMetric: '3 mismatches found',
    demoNarrative: 'Your phone number on Yelp differs from GBP. Inconsistencies actively hurt rankings.',
    recommendation: 'Update Yelp + Bing Places to match your GBP record exactly (no abbreviations differ).',
  },
  {
    id: 'service-areas',
    icon: FileText,
    title: 'Service area & categories',
    description: 'Your primary category and service area drive which queries trigger your listing.',
    unconnectedHint: 'We will validate your category vs. competitors once GBP is connected.',
    demoStatus: 'pass',
    demoMetric: 'Roofer · 12 service areas · 4 secondary categories',
    demoNarrative: 'Primary category and service-area coverage look solid for your geography.',
    recommendation: 'Re-validate quarterly — Google changes available categories regularly.',
  },
  {
    id: 'attributes-hours',
    icon: Clock,
    title: 'Attributes & hours',
    description: 'Special hours (holidays, storms) and accessibility attributes increase conversion.',
    unconnectedHint: 'We will compare your attributes against top-ranked roofers once GBP is connected.',
    demoStatus: 'pass',
    demoMetric: 'Hours up to date · 9 attributes set',
    demoNarrative: 'Attribute coverage matches or exceeds the top 3 competitors in your service area.',
    recommendation: 'Set special hours ahead of holidays and major storm forecasts.',
  },
];

const statusBadge: Record<GbpCheckStatus, { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }> = {
  pass: {
    label: 'Healthy',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Icon: CheckCircle2,
  },
  warn: {
    label: 'Needs attention',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  fail: {
    label: 'Action required',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Icon: XCircle,
  },
  unknown: {
    label: 'Connect to scan',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Icon: AlertTriangle,
  },
};

function GbpOptimizationTab({ onIntegrateGbp }: { onIntegrateGbp: () => void }) {
  // Until the GBP integration ships server-side, this flag lets us preview
  // the connected-state checklist locally for design + sales-demo purposes.
  // Real users see the unconnected (blocked) state by default.
  const isConnected =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('builderlync.gbp.connected') === 'true';

  const passCount = GBP_CHECKS.filter((c) => c.demoStatus === 'pass').length;
  const warnCount = GBP_CHECKS.filter((c) => c.demoStatus === 'warn').length;
  const failCount = GBP_CHECKS.filter((c) => c.demoStatus === 'fail').length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header / Score card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Google Business Profile health</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              We score the {GBP_CHECKS.length} signals that drive the largest share of GBP rankings and
              click-throughs. Each check links to the recommended fix.
            </p>
          </div>
          {!isConnected && (
            <button
              onClick={onIntegrateGbp}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Google Business Profile
            </button>
          )}
        </div>

        {isConnected && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-xs font-semibold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                Healthy
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{passCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">No action needed</div>
            </div>
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase">
                <AlertTriangle className="w-4 h-4" />
                Needs attention
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{warnCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quick wins</div>
            </div>
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-semibold uppercase">
                <XCircle className="w-4 h-4" />
                Action required
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{failCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hurting rankings</div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {GBP_CHECKS.map((check) => {
            const status: GbpCheckStatus = isConnected ? check.demoStatus : 'unknown';
            const badge = statusBadge[status];
            const Icon = check.icon;
            const StatusIcon = badge.Icon;
            return (
              <div key={check.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{check.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badge.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{check.description}</p>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-md bg-gray-50 dark:bg-gray-700/40 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Current</div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {isConnected ? check.demoMetric : check.unconnectedHint}
                        </div>
                        {isConnected && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{check.demoNarrative}</div>
                        )}
                      </div>
                      <div className="rounded-md bg-primary-50 dark:bg-primary-900/20 p-3 border border-primary-100 dark:border-primary-900/40">
                        <div className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400 mb-1">Recommendation</div>
                        <div className="text-sm text-gray-900 dark:text-white">{check.recommendation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      {!isConnected && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
          <strong className="text-gray-900 dark:text-white">Why this is blocked:</strong> The optimization checks
          read directly from your Google Business Profile. Connect GBP via Marketing → Integrations to start scanning.
          Your existing reviews and ratings are unaffected.
        </div>
      )}
    </div>
  );
}