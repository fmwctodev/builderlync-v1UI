import React, { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { InvoiceItem, InvoiceTemplate } from '../../../../shared/store/services/paymentsApi';

interface LineItemsSectionProps {
  lineItems: InvoiceItem[];
  templates: InvoiceTemplate[];
  onLineItemChange: (index: number, field: keyof InvoiceItem, value: any) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
  onApplyTemplate: (templateId: string, index: number) => void;
}

const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  lineItems,
  templates,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
  onApplyTemplate
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.description?.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Line Items</h3>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Package size={16} />
          <span>{showTemplates ? 'Hide' : 'Show'} Templates</span>
        </button>
      </div>

      {showTemplates && (
        <div className="bg-paper dark:bg-canvas p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-3 flex space-x-2">
            <input
              type="text"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search templates..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  onApplyTemplate(template.id, lineItems.length - 1);
                  setShowTemplates(false);
                }}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:shadow-sm"
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{template.description}</div>
                <div className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                  ${template.default_price.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-paper dark:bg-canvas">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Qty</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Rate</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Discount %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Tax %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Total</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {lineItems.map((item, index) => (
              <tr key={index} className="bg-white dark:bg-gray-800">
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.line_number}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onLineItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full min-w-[200px] px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => onLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.discount_percentage}
                    onChange={(e) => onLineItemChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.tax_rate}
                    onChange={(e) => onLineItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                  ${item.total_amount.toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onRemoveLineItem(index)}
                    disabled={lineItems.length === 1}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onAddLineItem}
        className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <Plus size={16} />
        <span>Add Line Item</span>
      </button>
    </div>
  );
};

export default LineItemsSection;
