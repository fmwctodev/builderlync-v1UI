import type {
  ProposalLineItem,
  MergeConflictItem,
  MergeConflictSummary,
} from '../types/proposalIntegration';
import type { LineItemData } from './proposalFieldMapping';

export interface MergeResult {
  itemsToUpdate: Array<{ id: string; quantity: number; description: string }>;
  itemsToAdd: LineItemData[];
  conflictItems: Array<{ existing: ProposalLineItem; new: LineItemData }>;
  itemsPreserved: ProposalLineItem[];
}

export function shouldOverwriteLineItem(
  existingItem: ProposalLineItem,
  newItem: LineItemData
): boolean {
  if (existingItem.source_tag !== 'instant_estimator') {
    return false;
  }

  if (existingItem.was_edited) {
    return false;
  }

  if (existingItem.catalog_sku !== newItem.catalog_sku) {
    return false;
  }

  return true;
}

export function mergeLineItems(
  existingItems: ProposalLineItem[],
  newItemsFromSnapshot: LineItemData[]
): MergeResult {
  const result: MergeResult = {
    itemsToUpdate: [],
    itemsToAdd: [],
    conflictItems: [],
    itemsPreserved: [],
  };

  const existingBySku = new Map<string, ProposalLineItem>();
  for (const item of existingItems) {
    if (item.catalog_sku) {
      existingBySku.set(item.catalog_sku, item);
    }
  }

  const processedSkus = new Set<string>();

  for (const newItem of newItemsFromSnapshot) {
    const existing = existingBySku.get(newItem.catalog_sku);

    if (existing) {
      processedSkus.add(newItem.catalog_sku);

      if (shouldOverwriteLineItem(existing, newItem)) {
        result.itemsToUpdate.push({
          id: existing.id,
          quantity: newItem.quantity,
          description: newItem.description,
        });
      } else {
        result.conflictItems.push({ existing, new: newItem });
        result.itemsPreserved.push(existing);
      }
    } else {
      result.itemsToAdd.push(newItem);
    }
  }

  for (const item of existingItems) {
    if (item.catalog_sku && !processedSkus.has(item.catalog_sku)) {
      if (item.source_tag === 'instant_estimator' && !item.was_edited) {
      } else {
        result.itemsPreserved.push(item);
      }
    }
  }

  return result;
}

export function generateMergeConflictSummary(
  conflictItems: Array<{ existing: ProposalLineItem; new: LineItemData }>,
  allExistingItems: ProposalLineItem[]
): MergeConflictSummary {
  const conflicts: MergeConflictItem[] = conflictItems.map(({ existing, new: newItem }) => ({
    line_item_id: existing.id,
    name: existing.name || existing.item_name || 'Unknown Item',
    reason: existing.was_edited
      ? 'Item was manually edited and will not be overwritten'
      : 'Item source does not match',
    existing_quantity: existing.quantity,
    new_quantity: newItem.quantity,
  }));

  const editedManualItems = allExistingItems.filter(
    item => item.source_tag === 'manual' || item.was_edited
  ).length;

  return {
    has_conflicts: conflicts.length > 0,
    conflict_count: conflicts.length,
    conflicts,
    items_updated: 0,
    items_added: 0,
    items_preserved: editedManualItems + conflicts.length,
  };
}

export function getChangeSummary(
  before: ProposalLineItem[],
  after: ProposalLineItem[]
): string {
  const summary: string[] = [];

  const beforeMap = new Map(before.map(item => [item.id, item]));
  const afterMap = new Map(after.map(item => [item.id, item]));

  for (const [id, afterItem] of afterMap) {
    const beforeItem = beforeMap.get(id);
    if (!beforeItem) {
      summary.push(`Added: ${afterItem.name || afterItem.item_name}`);
    } else if (beforeItem.quantity !== afterItem.quantity) {
      summary.push(
        `Updated ${afterItem.name || afterItem.item_name}: quantity ${beforeItem.quantity} -> ${afterItem.quantity}`
      );
    }
  }

  for (const [id, beforeItem] of beforeMap) {
    if (!afterMap.has(id)) {
      summary.push(`Removed: ${beforeItem.name || beforeItem.item_name}`);
    }
  }

  return summary.length > 0 ? summary.join('; ') : 'No changes';
}

export function calculateQuantityDiff(
  existing: ProposalLineItem,
  newData: LineItemData
): { changed: boolean; percentChange: number; absoluteChange: number } {
  const existingQty = existing.quantity || 0;
  const newQty = newData.quantity || 0;

  const absoluteChange = newQty - existingQty;
  const percentChange = existingQty > 0
    ? ((newQty - existingQty) / existingQty) * 100
    : newQty > 0 ? 100 : 0;

  return {
    changed: absoluteChange !== 0,
    percentChange: Math.round(percentChange * 10) / 10,
    absoluteChange,
  };
}
