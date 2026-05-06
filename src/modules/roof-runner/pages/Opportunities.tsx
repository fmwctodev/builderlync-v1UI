import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OpportunitiesHeader from '../components/opportunities/OpportunitiesHeader';
import FiltersAndSort, { OpportunityFilters } from '../components/opportunities/FiltersAndSort';
import KanbanBoard from '../components/opportunities/KanbanBoard';
import OpportunitiesTable from '../components/opportunities/OpportunitiesTable';
import AddOpportunityModal from '../components/opportunities/AddOpportunityModal';
import ViewEditOpportunityModal from '../components/opportunities/ViewEditOpportunityModal';
import PipelinesList from '../components/opportunities/PipelinesList';
import CreatePipelineModal from '../components/opportunities/CreatePipelineModal';
import EditPipelineModal from '../components/opportunities/EditPipelineModal';
import type { OpportunityWithDetails } from '../types/opportunities';

export default function Opportunities() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [activeView, setActiveView] = useState<'opportunities' | 'pipelines'>('opportunities');
  const [internalView, setInternalView] = useState<'board' | 'list' | 'settings'>('board');
  const [activeTab, setActiveTab] = useState<string>('opportunities');

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [showCreatePipelineModal, setShowCreatePipelineModal] = useState(false);
  const [showEditPipelineModal, setShowEditPipelineModal] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter and search state
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Removed embedded pipelines service call
  }, []);

  const handleOpportunityAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRowClick = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setShowViewEditModal(true);
  };

  const handleModalClose = () => {
    setShowViewEditModal(false);
    setSelectedOpportunityId(null);
  };

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePipelineCreated = () => {
    setRefreshKey(prev => prev + 1);
    // Reload pipelines in header
    window.dispatchEvent(new Event('reload-pipelines'));
  };

  const handlePipelineUpdated = () => {
    setRefreshKey(prev => prev + 1);
    // Reload pipelines in header
    window.dispatchEvent(new Event('reload-pipelines'));
  };

  const handlePipelineDeleted = () => {
    setRefreshKey(prev => prev + 1);
    // Reload pipelines in header and reset selection
    setSelectedPipelineId('default');
    window.dispatchEvent(new Event('reload-pipelines'));
  };

  const handleEditPipeline = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setShowEditPipelineModal(true);
  };

  const handleClosePipelineModal = () => {
    setShowEditPipelineModal(false);
    setSelectedPipelineId(null);
  };

  const handleCreateJob = (opportunity: OpportunityWithDetails) => {
    // Navigate to jobs page with opportunity data
    navigate(`${orgPrefix}/jobs`, {
      state: {
        createFromOpportunity: true,
        opportunityData: opportunity
      }
    });
    setShowViewEditModal(false);
  };

  const handleFiltersChange = (newFilters: OpportunityFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <OpportunitiesHeader
        selectedPipelineId={selectedPipelineId}
        setSelectedPipelineId={setSelectedPipelineId}
        onAddOpportunity={() => setShowAddModal(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddPipeline={() => setShowCreatePipelineModal(true)}
        internalView={internalView}
        onInternalViewChange={setInternalView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-grow p-4">
        {activeView === 'opportunities' ? (
          <>
            {internalView === 'board' && (
              <KanbanBoard key={refreshKey} selectedPipelineId={selectedPipelineId} />
            )}
            {internalView === 'list' && (
              <>
                <FiltersAndSort 
                  onFiltersChange={handleFiltersChange}
                  onSearchChange={handleSearchChange}
                  selectedPipelineId={selectedPipelineId}
                />
                <OpportunitiesTable
                  key={refreshKey}
                  onRowClick={handleRowClick}
                  selectedPipelineId={selectedPipelineId}
                  filters={filters}
                  searchTerm={searchTerm}
                />
              </>
            )}
            {internalView === 'settings' && (
              <OpportunitiesSettingsPanel
                onManagePipelines={() => setActiveView('pipelines')}
              />
            )}
          </>
        ) : (
          <PipelinesList
            onEdit={handleEditPipeline}
            onDelete={handlePipelineDeleted}
            refreshKey={refreshKey}
          />
        )}
      </main>

      <AddOpportunityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleOpportunityAdded}
        defaultJobType="Commercial"
        selectedPipelineId={selectedPipelineId}
      />

      <ViewEditOpportunityModal
        isOpen={showViewEditModal}
        opportunityId={selectedOpportunityId}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCreateJob={handleCreateJob}
      />

      <CreatePipelineModal
        isOpen={showCreatePipelineModal}
        onClose={() => setShowCreatePipelineModal(false)}
        onSuccess={handlePipelineCreated}
      />

      <EditPipelineModal
        isOpen={showEditPipelineModal}
        pipelineId={selectedPipelineId}
        onClose={handleClosePipelineModal}
        onSuccess={handlePipelineUpdated}
      />
    </div>
  );
}

// ============================================================================
// Opportunities Settings panel — UXA-034 fix
//
// Replaces the previous "Settings panel coming soon..." placeholder with a
// real settings surface. Three sections:
//   1) Default pipeline picker — driven by the live pipelines API.
//   2) Workflow defaults — auto-archive after N days, require value on
//      create. Persisted to localStorage as a graceful fallback (no
//      dedicated settings endpoint exists yet).
//   3) Quick-link to the full pipeline manager (PipelinesList) so users
//      can edit stages without leaving the Settings view.
// ============================================================================

interface OpportunitySettings {
  defaultPipelineId: string | null;
  autoArchiveAfterDays: number; // 0 = never
  requireValueOnCreate: boolean;
}
const OPP_SETTINGS_KEY = 'builderlync.opportunities.settings';
const defaultOpportunitySettings: OpportunitySettings = {
  defaultPipelineId: null,
  autoArchiveAfterDays: 0,
  requireValueOnCreate: false,
};
const loadOpportunitySettings = (): OpportunitySettings => {
  if (typeof window === 'undefined') return defaultOpportunitySettings;
  try {
    const raw = window.localStorage.getItem(OPP_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        defaultPipelineId: parsed.defaultPipelineId ?? null,
        autoArchiveAfterDays: Number(parsed.autoArchiveAfterDays ?? 0) || 0,
        requireValueOnCreate: !!parsed.requireValueOnCreate,
      };
    }
  } catch {
    // ignore parse error
  }
  return defaultOpportunitySettings;
};

function OpportunitiesSettingsPanel({ onManagePipelines }: { onManagePipelines: () => void }) {
  const [settings, setSettings] = useState<OpportunitySettings>(() => loadOpportunitySettings());
  const [savedSettings, setSavedSettings] = useState<OpportunitySettings>(() => loadOpportunitySettings());
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dirty =
    settings.defaultPipelineId !== savedSettings.defaultPipelineId ||
    settings.autoArchiveAfterDays !== savedSettings.autoArchiveAfterDays ||
    settings.requireValueOnCreate !== savedSettings.requireValueOnCreate;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Lazy-load to avoid pulling pipelinesApi for users who never visit
        // the settings panel.
        const { pipelinesApi } = await import('../services/pipelinesApi');
        const data = await pipelinesApi.getPipelines();
        if (alive) {
          setPipelines(data.map((p) => ({ id: p.id, name: p.name })));
        }
      } catch (err) {
        console.error('Failed to load pipelines for settings:', err);
      } finally {
        if (alive) setPipelinesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 200)); // visual feedback
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(OPP_SETTINGS_KEY, JSON.stringify(settings));
      }
      setSavedSettings(settings);
    } catch (err) {
      console.error('Failed to save opportunity settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Opportunities Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Defaults that apply across all pipelines and the Add Opportunity flow.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {saving ? 'Saving…' : dirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Default pipeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default pipeline</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              The pipeline new opportunities are placed in unless one is selected explicitly.
            </p>
            {pipelinesLoading ? (
              <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : (
              <select
                value={settings.defaultPipelineId ?? ''}
                onChange={(e) => setSettings((s) => ({ ...s, defaultPipelineId: e.target.value || null }))}
                className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">— Use first available pipeline —</option>
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Auto-archive */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auto-archive opportunities after</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Closed-won and closed-lost opportunities older than this are hidden by default. Set to 0 to keep them visible forever.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={settings.autoArchiveAfterDays}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, autoArchiveAfterDays: Math.max(0, Number(e.target.value) || 0) }))
                }
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
              {settings.autoArchiveAfterDays === 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(disabled)</span>
              )}
            </div>
          </div>

          {/* Require value */}
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg cursor-pointer max-w-2xl">
            <div className="pr-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Require an opportunity value on create</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                When enabled, the Add Opportunity form will reject submissions without a deal value.
              </div>
            </div>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.requireValueOnCreate}
              onChange={(e) => setSettings((s) => ({ ...s, requireValueOnCreate: e.target.checked }))}
            />
            <div className={`relative w-10 h-5 rounded-full transition-colors ${settings.requireValueOnCreate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: settings.requireValueOnCreate ? 'translateX(20px)' : 'translateX(2px)' }}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pipelines &amp; stages</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
              Each pipeline has its own stages, colors, and default rules. Use the full pipeline manager to add or rearrange stages.
            </p>
          </div>
          <button
            onClick={onManagePipelines}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium whitespace-nowrap"
          >
            Manage Pipelines →
          </button>
        </div>
      </div>
    </div>
  );
}
