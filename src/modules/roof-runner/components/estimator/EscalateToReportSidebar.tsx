import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { EscalateToReportCard } from './EscalateToReportCard';
import { ReportRecommendationsPanel } from './ReportRecommendationsPanel';

interface EscalateToReportSidebarProps {
  propertyId: string | null;
  addressText: string | null;
  roofAreaSqFt: number | null;
  effectivePitch: number | null;
  onOrderReport: () => void;
  onViewHistory: () => void;
  draftSaved?: boolean;
  isSaving?: boolean;
}

export function EscalateToReportSidebar({
  propertyId,
  addressText,
  roofAreaSqFt,
  effectivePitch,
  onOrderReport,
  onViewHistory,
  draftSaved = false,
  isSaving = false,
}: EscalateToReportSidebarProps) {
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(true);
  const isDisabled = !propertyId;

  return (
    <>
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          <EscalateToReportCard
            propertyId={propertyId}
            addressText={addressText}
            roofAreaSqFt={roofAreaSqFt}
            effectivePitch={effectivePitch}
            onOrderReport={onOrderReport}
            onViewHistory={onViewHistory}
            disabled={isDisabled}
            draftSaved={draftSaved}
            isSaving={isSaving}
          />
          <ReportRecommendationsPanel />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-4">
          <EscalateToReportCard
            propertyId={propertyId}
            addressText={addressText}
            roofAreaSqFt={roofAreaSqFt}
            effectivePitch={effectivePitch}
            onOrderReport={onOrderReport}
            onViewHistory={onViewHistory}
            disabled={isDisabled}
            draftSaved={draftSaved}
            isSaving={isSaving}
          />

          <button
            onClick={() => setIsRecommendationsExpanded(!isRecommendationsExpanded)}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isRecommendationsExpanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Hide Report Options
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Report Options
              </>
            )}
          </button>

          {isRecommendationsExpanded && (
            <div className="mt-3 max-h-64 overflow-y-auto">
              <ReportRecommendationsPanel />
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden h-80" />
    </>
  );
}

export default EscalateToReportSidebar;
