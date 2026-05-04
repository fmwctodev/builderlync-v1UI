import React, { useState, useCallback } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Copy,
  FileOutput,
  Check,
  X,
  Info,
  AlertCircle,
} from 'lucide-react';
import type { MaterialsConfig, MaterialsSummary, ShingleType } from '../../utils/materialsUtils';
import {
  SHINGLE_TYPE_OPTIONS,
  UNDERLAYMENT_OPTIONS,
  validateRoofAreaOverride,
  formatMaterialsSummaryText,
} from '../../utils/materialsUtils';
import { useEstimatorDraft } from '../../hooks/useEstimatorDraft';
import { isNonProductionEnvironment } from '../../config/featureFlags';

interface QuickMaterialsCardProps {
  propertyDataRoofArea: number | null;
  propertyDataStatus: 'idle' | 'loading' | 'success' | 'error';
  roofAreaOverride: number | null;
  materialsConfig: MaterialsConfig;
  effectiveRoofArea: number | null;
  materialsSummary: MaterialsSummary | null;
  addressText: string | null;
  onRoofAreaOverride: (area: number | null) => void;
  onUpdateConfig: (updates: Partial<MaterialsConfig>) => void;
  onResetConfig: () => void;
}

export function QuickMaterialsCard({
  propertyDataRoofArea,
  propertyDataStatus,
  roofAreaOverride,
  materialsConfig,
  effectiveRoofArea,
  materialsSummary,
  addressText,
  onRoofAreaOverride,
  onUpdateConfig,
  onResetConfig,
}: QuickMaterialsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overrideInputValue, setOverrideInputValue] = useState('');
  const [overrideInputError, setOverrideInputError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { hasDraft, exportMaterialsToDraft } = useEstimatorDraft();

  const hasOverride = roofAreaOverride !== null;
  const isLoading = propertyDataStatus === 'loading';
  const hasNoArea = effectiveRoofArea === null && !showOverrideInput;

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleStartOverride = useCallback(() => {
    setOverrideInputValue(effectiveRoofArea?.toString() || '');
    setOverrideInputError(null);
    setShowOverrideInput(true);
  }, [effectiveRoofArea]);

  const handleCancelOverride = useCallback(() => {
    setShowOverrideInput(false);
    setOverrideInputValue('');
    setOverrideInputError(null);
  }, []);

  const handleSaveOverride = useCallback(() => {
    const validation = validateRoofAreaOverride(overrideInputValue);
    if (!validation.valid) {
      setOverrideInputError(validation.error);
      return;
    }
    onRoofAreaOverride(validation.numericValue);
    setShowOverrideInput(false);
    setOverrideInputValue('');
    setOverrideInputError(null);
  }, [overrideInputValue, onRoofAreaOverride]);

  const handleResetOverride = useCallback(() => {
    onRoofAreaOverride(null);
  }, [onRoofAreaOverride]);

  const handleOverrideKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveOverride();
    } else if (e.key === 'Escape') {
      handleCancelOverride();
    }
  }, [handleSaveOverride, handleCancelOverride]);

  const handleCopySummary = useCallback(async () => {
    if (!materialsSummary) return;

    const text = formatMaterialsSummaryText(materialsSummary);
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  }, [materialsSummary]);

  const handleExportToDraft = useCallback(() => {
    if (!materialsSummary) return;
    exportMaterialsToDraft(materialsSummary, addressText);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  }, [materialsSummary, addressText, exportMaterialsToDraft]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={handleToggleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Quick Materials
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Estimate shingles, underlayment & more
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Roof Area
                </label>
                {showOverrideInput ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={overrideInputValue}
                        onChange={(e) => {
                          setOverrideInputValue(e.target.value);
                          setOverrideInputError(null);
                        }}
                        onKeyDown={handleOverrideKeyDown}
                        placeholder="e.g., 2500"
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          overrideInputError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        autoFocus
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">sq ft</span>
                      <button
                        onClick={handleSaveOverride}
                        className="p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelOverride}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {overrideInputError && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {overrideInputError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      {effectiveRoofArea !== null ? (
                        <>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {effectiveRoofArea.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">sq ft</span>
                          {hasOverride && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">(override)</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No roof area available
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleStartOverride}
                        className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline"
                      >
                        {hasOverride ? 'Edit' : 'Override'}
                      </button>
                      {hasOverride && (
                        <button
                          onClick={handleResetOverride}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Waste Factor: {materialsConfig.wastePercent}%
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={materialsConfig.wastePercent}
                    onChange={(e) => onUpdateConfig({ wastePercent: parseInt(e.target.value, 10) })}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={materialsConfig.wastePercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0 && val <= 40) {
                        onUpdateConfig({ wastePercent: val });
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shingle Type
                </label>
                <select
                  value={materialsConfig.shingleType}
                  onChange={(e) => onUpdateConfig({ shingleType: e.target.value as ShingleType })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {SHINGLE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Underlayment Coverage
                </label>
                <select
                  value={materialsConfig.underlaymentSqFtPerRoll.toString()}
                  onChange={(e) => onUpdateConfig({ underlaymentSqFtPerRoll: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {UNDERLAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.sqFtPerRoll}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Optional Add-ons
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={materialsConfig.includeStarter}
                      onChange={(e) => onUpdateConfig({ includeStarter: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Starter (1 box assumption)
                    </span>
                    <Info className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={materialsConfig.includeRidgeCap}
                      onChange={(e) => onUpdateConfig({ includeRidgeCap: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Ridge Cap (2 bundles assumption)
                    </span>
                    <Info className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={materialsConfig.includeDripEdge}
                      onChange={(e) => onUpdateConfig({ includeDripEdge: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Drip Edge (4 pcs @ 10ft assumption)
                    </span>
                    <Info className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </label>
                </div>
              </div>

              {materialsSummary ? (
                <div className="mt-4 p-4 bg-paper dark:bg-canvas/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Materials Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Roof Area</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {materialsSummary.roofAreaSqFt.toLocaleString()} sq ft
                        {materialsSummary.roofAreaSource === 'override' && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">(override)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Squares</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {materialsSummary.squares.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Waste</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {materialsSummary.wastePercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Adjusted Squares</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {materialsSummary.adjustedSquares.toFixed(1)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shingle Bundles</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {materialsSummary.bundlesRequired}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Underlayment Rolls</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {materialsSummary.underlaymentRolls}
                      </span>
                    </div>
                    {(materialsSummary.addOns.starter || materialsSummary.addOns.ridgeCap || materialsSummary.addOns.dripEdge) && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                        {materialsSummary.addOns.starter && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Starter</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {materialsSummary.addOns.starter}
                            </span>
                          </div>
                        )}
                        {materialsSummary.addOns.ridgeCap && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Ridge Cap</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {materialsSummary.addOns.ridgeCap}
                            </span>
                          </div>
                        )}
                        {materialsSummary.addOns.dripEdge && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Drip Edge</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {materialsSummary.addOns.dripEdge}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                    Quick estimate based on roof area property data. For exact measurements, order a report.
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCopySummary}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Summary
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExportToDraft}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                    >
                      {exportSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          Exported!
                        </>
                      ) : (
                        <>
                          <FileOutput className="w-4 h-4" />
                          {hasDraft ? 'Update Draft' : 'Export to Draft'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : hasNoArea ? (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Roof area unavailable
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Select an address or enter an override to calculate materials.
                      </p>
                      {isNonProductionEnvironment() && (
                        <p className="text-xs text-sky-600 dark:text-sky-400 mt-2">
                          Test environment: Sample data may not include roof area for all addresses.
                        </p>
                      )}
                      <button
                        onClick={handleStartOverride}
                        className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 underline hover:text-amber-800 dark:hover:text-amber-200"
                      >
                        Enter roof area manually
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
