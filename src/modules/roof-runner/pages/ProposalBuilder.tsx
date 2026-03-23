import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useProposalBuilder } from '../hooks/useProposalBuilder';
import { ProposalBuilderHeader } from '../components/proposals/builder/ProposalBuilderHeader';
import { ProposalSectionNav } from '../components/proposals/builder/ProposalSectionNav';
import { ProposalLineItemsEditor } from '../components/proposals/builder/ProposalLineItemsEditor';
import { ProposalTotalsSection } from '../components/proposals/builder/ProposalTotalsSection';
import { EstimatorSourceBanner } from '../components/proposals/builder/EstimatorSourceBanner';
import { CustomerInfoPanel } from '../components/proposals/builder/CustomerInfoPanel';
import { ProposalEstimatorValidation } from '../components/proposals/builder/ProposalEstimatorValidation';

export default function ProposalBuilder() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();

  const {
    proposal,
    lineItems,
    snapshot,
    totals,
    isLoading,
    isSaving,
    isDirty,
    error,
    updateProposalField,
    updateProposalContent,
    updateLineItemField,
    addNewLineItem,
    removeLineItem,
    reorderItems,
    saveNow,
    refresh,
  } = useProposalBuilder(proposalId || '');

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (!proposalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">No proposal ID provided</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 dark:text-red-400">{error || 'Proposal not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProposalBuilderHeader
        proposal={proposal}
        isSaving={isSaving}
        isDirty={isDirty}
        onSave={saveNow}
        onTitleChange={(title) => updateProposalField('title', title)}
      />

      <div className="flex">
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[calc(100vh-64px)]">
          <div className="p-4 space-y-4">
            <CustomerInfoPanel customerId={proposal.customer_id} />
            <ProposalSectionNav />
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {snapshot && (
              <EstimatorSourceBanner
                snapshot={snapshot}
                onRefresh={refresh}
              />
            )}

            <ProposalEstimatorValidation
              proposalId={proposalId}
              estimateSnapshotId={proposal.linked_estimate_snapshot_id}
              lineItems={lineItems}
              isEstimatorLinked={!!proposal.linked_estimate_snapshot_id}
            />

            <section id="materials" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Materials & Line Items
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Review and adjust quantities and pricing for each line item.
                </p>
              </div>

              <ProposalLineItemsEditor
                lineItems={lineItems}
                onUpdateItem={updateLineItemField}
                onAddItem={addNewLineItem}
                onRemoveItem={removeLineItem}
                onReorder={reorderItems}
              />

              <ProposalTotalsSection totals={totals} />
            </section>

            <section id="assumptions" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Assumptions
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {proposal.content?.sections?.find(s => s.type === 'assumptions')?.content ? (
                  <div className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                    {proposal.content.sections.find(s => s.type === 'assumptions')?.content}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No assumptions added yet.
                  </p>
                )}
              </div>
            </section>

            <section id="summary" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Project Summary
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {proposal.content?.projectSummary ? (
                  <div className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                    {proposal.content.projectSummary}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No project summary added yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>

        <aside className="hidden xl:block w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[calc(100vh-64px)]">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={proposal.status}
                  onChange={(e) => updateProposalField('status', e.target.value as typeof proposal.status)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="waiting">Sent / Waiting</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={proposal.expires_at ? new Date(proposal.expires_at).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateProposalField('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {proposal.property_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Property
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {proposal.property_address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
