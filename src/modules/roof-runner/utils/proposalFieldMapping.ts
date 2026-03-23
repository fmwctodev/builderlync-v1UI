import type {
  EstimateSnapshot,
  MaterialsCalcInputs,
  MaterialsCalcOutputs,
  PricingCatalogItem,
  ESTIMATOR_TO_CATALOG_SKU_MAP,
} from '../types/proposalIntegration';

const SKU_MAP: Record<string, string> = {
  bundles: 'shingles_bundle',
  bundlesRequired: 'shingles_bundle',
  underlayment: 'underlayment_roll',
  underlaymentRolls: 'underlayment_roll',
  starter: 'starter_allowance',
  starterAmount: 'starter_allowance',
  ridgeCap: 'ridgecap_allowance',
  ridgeCapAmount: 'ridgecap_allowance',
  dripEdge: 'dripedge_allowance',
  dripEdgeAmount: 'dripedge_allowance',
};

export interface LineItemData {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  catalog_sku: string;
}

export interface ProposalHeaderData {
  title: string;
  property_id: string;
  property_address: string;
  linked_estimate_snapshot_id: string;
}

export function mapSnapshotToProposalHeader(
  snapshot: EstimateSnapshot,
  options: { title?: string } = {}
): ProposalHeaderData {
  const truncatedAddress = snapshot.address_text.length > 50
    ? snapshot.address_text.substring(0, 47) + '...'
    : snapshot.address_text;

  return {
    title: options.title || `Proposal - ${truncatedAddress}`,
    property_id: snapshot.property_id,
    property_address: snapshot.address_text,
    linked_estimate_snapshot_id: snapshot.id,
  };
}

export function mapMaterialsSummaryToLineItems(
  outputs: MaterialsCalcOutputs,
  inputs: MaterialsCalcInputs,
  pricingCatalog: PricingCatalogItem[]
): LineItemData[] {
  const items: LineItemData[] = [];

  const catalogMap = new Map(pricingCatalog.map(item => [item.sku, item]));

  const lookupPrice = (sku: string): number => {
    const item = catalogMap.get(sku);
    return item?.default_unit_price ?? 0;
  };

  const lookupName = (sku: string, fallback: string): string => {
    const item = catalogMap.get(sku);
    return item?.name ?? fallback;
  };

  if (outputs.bundlesRequired && outputs.bundlesRequired > 0) {
    const sku = 'shingles_bundle';
    const shingleType = inputs.shingleType || 'Architectural';
    items.push({
      name: lookupName(sku, 'Shingles (Bundle)'),
      description: `${shingleType} shingles - ${outputs.bundlesRequired} bundles required for ${outputs.adjustedSquares?.toFixed(1) || outputs.squares?.toFixed(1)} squares (includes ${inputs.wastePercent || 10}% waste)`,
      quantity: Math.ceil(outputs.bundlesRequired),
      unit: 'bundle',
      unit_price: lookupPrice(sku),
      catalog_sku: sku,
    });
  }

  if (outputs.underlaymentRolls && outputs.underlaymentRolls > 0) {
    const sku = 'underlayment_roll';
    const underlaymentType = inputs.underlaymentType || 'Synthetic';
    items.push({
      name: lookupName(sku, 'Underlayment (Roll)'),
      description: `${underlaymentType} underlayment - ${outputs.underlaymentRolls} rolls (${inputs.underlaymentSqFtPerRoll || 1000} sq ft per roll)`,
      quantity: Math.ceil(outputs.underlaymentRolls),
      unit: 'roll',
      unit_price: lookupPrice(sku),
      catalog_sku: sku,
    });
  }

  if (inputs.includeStarter) {
    const sku = 'starter_allowance';
    items.push({
      name: lookupName(sku, 'Starter Strip'),
      description: 'Starter strip shingles for eaves and rakes',
      quantity: 1,
      unit: 'allowance',
      unit_price: lookupPrice(sku),
      catalog_sku: sku,
    });
  }

  if (inputs.includeRidgeCap) {
    const sku = 'ridgecap_allowance';
    items.push({
      name: lookupName(sku, 'Ridge Cap'),
      description: 'Ridge cap shingles for ridges and hips',
      quantity: 1,
      unit: 'allowance',
      unit_price: lookupPrice(sku),
      catalog_sku: sku,
    });
  }

  if (inputs.includeDripEdge) {
    const sku = 'dripedge_allowance';
    items.push({
      name: lookupName(sku, 'Drip Edge'),
      description: 'Drip edge flashing for roof perimeter',
      quantity: 1,
      unit: 'allowance',
      unit_price: lookupPrice(sku),
      catalog_sku: sku,
    });
  }

  return items;
}

export function generateDefaultAssumptions(snapshot: EstimateSnapshot): string[] {
  const assumptions: string[] = [];

  const roofArea = snapshot.roof_area_sqft
    ? snapshot.roof_area_sqft.toLocaleString()
    : 'unknown';

  const wastePercent = snapshot.materials_calc_inputs?.wastePercent || 10;

  assumptions.push(
    `Quantities derived from roof area estimate (${roofArea} sq ft) with ${wastePercent}% waste factor.`
  );

  assumptions.push(
    'This is not an insurance-grade measurement report. Quantities are estimates based on available property data.'
  );

  assumptions.push(
    'Final quantities may vary after onsite verification and inspection.'
  );

  assumptions.push(
    'Pricing is subject to confirmation and may be adjusted based on material availability and market conditions.'
  );

  if (snapshot.pitch_effective) {
    assumptions.push(
      `Roof pitch estimated at ${snapshot.pitch_effective}:12. Actual pitch may affect material requirements and labor.`
    );
  }

  if (!snapshot.imagery_included) {
    assumptions.push(
      'Estimate does not include aerial imagery analysis. On-site inspection recommended for accurate assessment.'
    );
  }

  return assumptions;
}

export function generateProjectSummarySection(snapshot: EstimateSnapshot): string {
  const lines: string[] = [];

  lines.push('## Property Information\n');

  lines.push(`**Address:** ${snapshot.address_text}`);

  if (snapshot.roof_area_sqft) {
    lines.push(`**Estimated Roof Area:** ${snapshot.roof_area_sqft.toLocaleString()} sq ft`);
  }

  if (snapshot.pitch_effective) {
    lines.push(`**Estimated Pitch:** ${snapshot.pitch_effective}:12`);
  }

  lines.push(`**Imagery Included:** ${snapshot.imagery_included ? 'Yes' : 'No'}`);

  lines.push('\n## Materials Summary\n');

  const outputs = snapshot.materials_calc_outputs;
  if (outputs) {
    if (outputs.squares) {
      lines.push(`**Roofing Squares:** ${outputs.squares.toFixed(1)}`);
    }
    if (outputs.adjustedSquares) {
      lines.push(`**Adjusted Squares (with waste):** ${outputs.adjustedSquares.toFixed(1)}`);
    }
    if (outputs.bundlesRequired) {
      lines.push(`**Shingle Bundles Required:** ${Math.ceil(outputs.bundlesRequired)}`);
    }
    if (outputs.underlaymentRolls) {
      lines.push(`**Underlayment Rolls:** ${Math.ceil(outputs.underlaymentRolls)}`);
    }
  }

  lines.push('\n---\n');
  lines.push('*This summary was generated from the Instant Estimator tool. Final scope to be confirmed.*');

  return lines.join('\n');
}

export function generateScopeOfWorkSection(): string {
  return `## Scope of Work

### Tear-Off and Preparation
- Remove existing roofing materials down to the deck
- Inspect roof deck for damage and make necessary repairs
- Install new drip edge along eaves and rakes
- Install ice and water shield in valleys and at penetrations

### Roofing Installation
- Install synthetic underlayment over entire roof surface
- Install starter strip shingles along eaves
- Install architectural shingles per manufacturer specifications
- Install ridge cap shingles at all ridges and hips

### Cleanup and Completion
- Remove all debris from property
- Perform magnetic sweep for nails
- Final walkthrough inspection

*Scope items are subject to change based on actual site conditions.*`;
}

export function generateTermsAndConditionsSection(): string {
  return `## Terms and Conditions

### Payment Terms
- Deposit due upon acceptance: 50%
- Final payment due upon completion: 50%
- Accepted payment methods: Check, Credit Card, ACH Transfer

### Warranty
- Manufacturer warranty on materials (varies by product)
- Workmanship warranty: 5 years

### Timeline
- Work to commence within 2 weeks of signed agreement (weather permitting)
- Estimated completion: 1-3 days depending on roof size and complexity

### Additional Terms
- Any changes to scope must be agreed upon in writing
- Customer responsible for HOA approval if applicable
- Permit fees not included unless specified
- Price valid for 30 days from date of proposal

*Full terms and conditions available upon request.*`;
}

export function getSKUFromFieldName(fieldName: string): string | null {
  return SKU_MAP[fieldName] || null;
}

export function getFieldNameFromSKU(sku: string): string | null {
  for (const [field, mappedSku] of Object.entries(SKU_MAP)) {
    if (mappedSku === sku) {
      return field;
    }
  }
  return null;
}
