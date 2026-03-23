export type ShingleType = 'standard-3tab' | 'architectural' | 'heavy-designer';

export type UnderlaymentCoverage = '200' | '400';

export interface MaterialsConfig {
  wastePercent: number;
  shingleType: ShingleType;
  underlaymentSqFtPerRoll: number;
  includeStarter: boolean;
  includeRidgeCap: boolean;
  includeDripEdge: boolean;
}

export interface MaterialsSummary {
  roofAreaSqFt: number;
  roofAreaSource: 'property-data' | 'override';
  squares: number;
  wastePercent: number;
  adjustedSquares: number;
  bundlesPerSquare: number;
  bundlesRequired: number;
  underlaymentRolls: number;
  underlaymentSqFtPerRoll: number;
  addOns: {
    starter: string | null;
    ridgeCap: string | null;
    dripEdge: string | null;
  };
}

export const DEFAULT_MATERIALS_CONFIG: MaterialsConfig = {
  wastePercent: 10,
  shingleType: 'architectural',
  underlaymentSqFtPerRoll: 400,
  includeStarter: false,
  includeRidgeCap: false,
  includeDripEdge: false,
};

export const SHINGLE_TYPE_OPTIONS: { value: ShingleType; label: string; bundlesPerSquare: number }[] = [
  { value: 'standard-3tab', label: 'Standard 3-Tab (3/sq)', bundlesPerSquare: 3 },
  { value: 'architectural', label: 'Architectural (3/sq)', bundlesPerSquare: 3 },
  { value: 'heavy-designer', label: 'Heavy/Designer (4/sq)', bundlesPerSquare: 4 },
];

export const UNDERLAYMENT_OPTIONS: { value: string; label: string; sqFtPerRoll: number }[] = [
  { value: '200', label: '2 squares/roll (200 sq ft)', sqFtPerRoll: 200 },
  { value: '400', label: '4 squares/roll (400 sq ft)', sqFtPerRoll: 400 },
];

export const ADD_ON_QUANTITIES = {
  starter: '1 box',
  ridgeCap: '2 bundles',
  dripEdge: '4 pcs @ 10ft each',
};

export function getBundlesPerSquare(shingleType: ShingleType): number {
  const option = SHINGLE_TYPE_OPTIONS.find((o) => o.value === shingleType);
  return option?.bundlesPerSquare ?? 3;
}

export function calculateSquares(roofAreaSqFt: number): number {
  if (roofAreaSqFt <= 0) return 0;
  return roofAreaSqFt / 100;
}

export function calculateWasteAdjustedSquares(squares: number, wastePercent: number): number {
  if (squares <= 0) return 0;
  return squares * (1 + wastePercent / 100);
}

export function calculateBundles(adjustedSquares: number, bundlesPerSquare: number): number {
  if (adjustedSquares <= 0) return 0;
  return Math.ceil(adjustedSquares * bundlesPerSquare);
}

export function calculateUnderlaymentRolls(
  roofAreaSqFt: number,
  wastePercent: number,
  sqFtPerRoll: number
): number {
  if (roofAreaSqFt <= 0 || sqFtPerRoll <= 0) return 0;
  const adjustedArea = roofAreaSqFt * (1 + wastePercent / 100);
  return Math.ceil(adjustedArea / sqFtPerRoll);
}

export function validateRoofAreaOverride(value: string): { valid: boolean; numericValue: number | null; error: string | null } {
  if (!value || value.trim() === '') {
    return { valid: false, numericValue: null, error: 'Enter a valid positive number' };
  }

  const cleaned = value.replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return { valid: false, numericValue: null, error: 'Enter a valid positive number' };
  }

  if (parsed <= 0) {
    return { valid: false, numericValue: null, error: 'Area must be greater than 0' };
  }

  if (parsed > 100000) {
    return { valid: false, numericValue: null, error: 'Area seems too large. Please verify.' };
  }

  return { valid: true, numericValue: parsed, error: null };
}

export function calculateMaterialsSummary(
  roofAreaSqFt: number | null,
  roofAreaOverride: number | null,
  config: MaterialsConfig
): MaterialsSummary | null {
  const effectiveArea = roofAreaOverride ?? roofAreaSqFt;

  if (effectiveArea === null || effectiveArea <= 0) {
    return null;
  }

  const squares = calculateSquares(effectiveArea);
  const adjustedSquares = calculateWasteAdjustedSquares(squares, config.wastePercent);
  const bundlesPerSquare = getBundlesPerSquare(config.shingleType);
  const bundlesRequired = calculateBundles(adjustedSquares, bundlesPerSquare);
  const underlaymentRolls = calculateUnderlaymentRolls(
    effectiveArea,
    config.wastePercent,
    config.underlaymentSqFtPerRoll
  );

  return {
    roofAreaSqFt: effectiveArea,
    roofAreaSource: roofAreaOverride !== null ? 'override' : 'property-data',
    squares,
    wastePercent: config.wastePercent,
    adjustedSquares,
    bundlesPerSquare,
    bundlesRequired,
    underlaymentRolls,
    underlaymentSqFtPerRoll: config.underlaymentSqFtPerRoll,
    addOns: {
      starter: config.includeStarter ? ADD_ON_QUANTITIES.starter : null,
      ridgeCap: config.includeRidgeCap ? ADD_ON_QUANTITIES.ridgeCap : null,
      dripEdge: config.includeDripEdge ? ADD_ON_QUANTITIES.dripEdge : null,
    },
  };
}

export function formatMaterialsSummaryText(summary: MaterialsSummary): string {
  const lines: string[] = [
    'Quick Materials Estimate',
    '========================',
    '',
    `Roof Area: ${summary.roofAreaSqFt.toLocaleString()} sq ft${summary.roofAreaSource === 'override' ? ' (override)' : ''}`,
    `Squares: ${summary.squares.toFixed(1)}`,
    `Waste Factor: ${summary.wastePercent}%`,
    `Adjusted Squares: ${summary.adjustedSquares.toFixed(1)}`,
    '',
    `Shingle Bundles: ${summary.bundlesRequired} (${summary.bundlesPerSquare}/sq)`,
    `Underlayment Rolls: ${summary.underlaymentRolls} (${summary.underlaymentSqFtPerRoll} sq ft/roll)`,
  ];

  const addOnLines: string[] = [];
  if (summary.addOns.starter) {
    addOnLines.push(`Starter: ${summary.addOns.starter} (assumption)`);
  }
  if (summary.addOns.ridgeCap) {
    addOnLines.push(`Ridge Cap: ${summary.addOns.ridgeCap} (assumption)`);
  }
  if (summary.addOns.dripEdge) {
    addOnLines.push(`Drip Edge: ${summary.addOns.dripEdge} (assumption)`);
  }

  if (addOnLines.length > 0) {
    lines.push('');
    lines.push('Add-ons:');
    lines.push(...addOnLines.map((l) => `  ${l}`));
  }

  lines.push('');
  lines.push('---');
  lines.push('Quick estimate based on roof area property data.');
  lines.push('For exact measurements, order a measurement report.');

  return lines.join('\n');
}
