import React, { useState } from 'react';
import { Plus, GripVertical, X, Eye, EyeOff } from 'lucide-react';

interface CatalogItem {
  id: string;
  uuid: string;
  item_type: string;
  name: string;
  description: string | null;
  cost: number;
  unit: string | null;
  coverage: number;
  waste: number;
  tax_rate: number;
  purchase_tax: number;
  order: number;
  visible: boolean;
}

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: CatalogItem = {
      id: crypto.randomUUID(),
      uuid: crypto.randomUUID(),
      item_type: 'material',
      name: 'New item',
      description: null,
      cost: 0,
      unit: null,
      coverage: 0,
      waste: 0.2,
      tax_rate: 0.0825,
      purchase_tax: 0.0825,
      order: items.length,
      visible: true,
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const bulkDelete = () => {
    setItems(items.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const bulkHide = () => {
    setItems(items.map(item => selectedItems.has(item.id) ? { ...item, visible: false } : item));
    setSelectedItems(new Set());
  };

  const bulkUnhide = () => {
    setItems(items.map(item => selectedItems.has(item.id) ? { ...item, visible: true } : item));
    setSelectedItems(new Set());
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Catalog</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your catalog items</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={addItem}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {selectedItems.size > 0 && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-2">
              <button onClick={bulkHide} className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                Hide
              </button>
              <button onClick={bulkUnhide} className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
                Unhide
              </button>
              <button onClick={bulkDelete} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                Delete
              </button>
              <button onClick={() => setSelectedItems(new Set())} className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                Unselect
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Select</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost ($)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Coverage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waste (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tax Rate (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="cursor-move hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3">
                    <GripVertical size={16} className="text-gray-400" />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={item.item_type}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, item_type: e.target.value } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="material">Material</option>
                      <option value="labor">Labor</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="number"
                      value={item.cost}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, cost: parseFloat(e.target.value) || 0 } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="text"
                      value={item.unit || ''}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="number"
                      value={item.coverage}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, coverage: parseFloat(e.target.value) || 0 } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="number"
                      value={item.waste * 100}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, waste: parseFloat(e.target.value) / 100 || 0 } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="number"
                      value={item.tax_rate * 100}
                      onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, tax_rate: parseFloat(e.target.value) / 100 || 0 } : i))}
                      className="bg-transparent border-0 w-full focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => toggleVisibility(item.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No items yet. Click "Add Item" to create your first catalog item.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
