import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, AlertCircle, Zap } from 'lucide-react';
import type { ProposalLineItem, UpdateProposalLineItemRequest, CreateProposalLineItemRequest } from '../../../types/proposalIntegration';

interface ProposalLineItemsEditorProps {
  lineItems: ProposalLineItem[];
  onUpdateItem: (itemId: string, updates: UpdateProposalLineItemRequest) => Promise<void>;
  onAddItem: (item: Omit<CreateProposalLineItemRequest, 'proposal_id' | 'organization_id'>) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onReorder: (itemIds: string[]) => Promise<void>;
}

export function ProposalLineItemsEditor({
  lineItems,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}: ProposalLineItemsEditorProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    unit: '',
    unit_price: 0,
  });

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;

    await onAddItem({
      name: newItem.name,
      description: newItem.description || undefined,
      quantity: newItem.quantity,
      unit: newItem.unit || undefined,
      unit_price: newItem.unit_price,
      line_number: lineItems.length + 1,
      source_tag: 'manual',
    });

    setNewItem({ name: '', description: '', quantity: 1, unit: '', unit_price: 0 });
    setIsAddingItem(false);
  };

  const handleFieldChange = async (
    itemId: string,
    field: keyof UpdateProposalLineItemRequest,
    value: string | number
  ) => {
    await onUpdateItem(itemId, { [field]: value });
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="w-8 px-2 py-3"></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Item
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                Qty
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                Unit
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                Unit Price
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                Total
              </th>
              <th className="w-12 px-2 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {lineItems.map((item) => (
              <tr
                key={item.id}
                className={`group hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                  item.source_tag === 'instant_estimator' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
              >
                <td className="px-2 py-3">
                  <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-grab" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name || item.item_name || ''}
                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-sm font-medium text-gray-900 dark:text-white focus:ring-0 focus:outline-none"
                        placeholder="Item name"
                      />
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-xs text-gray-500 dark:text-gray-400 focus:ring-0 focus:outline-none mt-0.5"
                        placeholder="Description (optional)"
                      />
                    </div>
                    {item.source_tag === 'instant_estimator' && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        <Zap className="w-3 h-3" />
                        Auto
                      </span>
                    )}
                    {item.was_edited && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                        Edited
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleFieldChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm text-right text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.unit || ''}
                    onChange={(e) => handleFieldChange(item.id, 'unit', e.target.value)}
                    className="w-full bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ea"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleFieldChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className={`w-full bg-transparent border rounded pl-6 pr-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        item.unit_price === 0
                          ? 'border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
                      }`}
                      min="0"
                      step="0.01"
                    />
                    {item.unit_price === 0 && (
                      <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {isAddingItem && (
              <tr className="bg-green-50/50 dark:bg-green-900/10">
                <td className="px-2 py-3"></td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
                    placeholder="Item name"
                    autoFocus
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-right text-gray-900 dark:text-white"
                    min="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
                    placeholder="ea"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded pl-6 pr-2 py-1 text-sm text-right text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(newItem.quantity * newItem.unit_price).toFixed(2)}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {isAddingItem ? (
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              disabled={!newItem.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
            <button
              onClick={() => setIsAddingItem(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Line Item
          </button>
        )}
      </div>
    </div>
  );
}
