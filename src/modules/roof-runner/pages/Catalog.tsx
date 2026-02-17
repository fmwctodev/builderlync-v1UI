import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Copy, Search, SlidersHorizontal, GripVertical, Eye, X, RotateCcw, ChevronDown, Link, Download, Upload } from 'lucide-react';
import { getCatalogItems, createCatalogItem, updateCatalogItemType, deleteCatalogItem, bulkDeleteCatalogItems, duplicateCatalogItem, updateCatalogItem, CatalogItem, exportCatalogCsv, importCatalogCsv } from '../../../shared/store/services/catalogApi';
import Toast from '../../../shared/components/Toast';
import CatalogItemSidebar from '../components/catalog/CatalogItemSidebar';
import { abcSupplyService } from '../services/abcSupplyService';
import { srsService } from '../services/srsService';

interface ColumnVisibility {
  itemType: boolean;
  name: boolean;
  description: boolean;
  measurements: boolean;
  coverage: boolean;
  supplier: boolean;
  preTaxCost: boolean;
  waste: boolean;
  unit: boolean;
  salesTax: boolean;
  materialPurchaseTax: boolean;
}

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showFilterSortModal, setShowFilterSortModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [tempFilterTypes, setTempFilterTypes] = useState<string[]>([]);
  const [accordionOpen, setAccordionOpen] = useState<{sort: boolean; itemType: boolean}>({ sort: true, itemType: false });
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [abcSupplyIntegrated, setAbcSupplyIntegrated] = useState<boolean | null>(null);
  const [srsIntegrated, setSrsIntegrated] = useState<boolean | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    itemType: true,
    name: true,
    description: true,
    measurements: true,
    coverage: true,
    supplier: true,
    preTaxCost: true,
    waste: true,
    unit: true,
    salesTax: true,
    materialPurchaseTax: true,
  });

  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'date-new' | 'date-old'>('name-asc');
  const [tempSortOption, setTempSortOption] = useState<'name-asc' | 'name-desc' | 'date-new' | 'date-old'>('name-asc');

  const newItemDefaults = {
    itemType: 'Material' as const,
    name: 'New Item',
    description: '',
    measurements: '',
    coverage: 0,
    supplier: '',
    preTaxCost: 0,
    waste: 0,
    unit: 'square',
    salesTax: 0,
    materialPurchaseTax: 0,
  };

  useEffect(() => {
    loadItems();
    checkAbcSupplyIntegration();
    checkSrsIntegration();
  }, [searchQuery, filterTypes, sortOption]);

  const checkAbcSupplyIntegration = async () => {
    try {
      // Try to get branches to check if integration is working
      const branches = await abcSupplyService.getBranches();
      setAbcSupplyIntegrated(branches.length > 0);
    } catch (error) {
      setAbcSupplyIntegrated(false);
    }
  };

  const checkSrsIntegration = async () => {
    try {
      const isConnected = await srsService.validateConnection();
      setSrsIntegrated(isConnected);
    } catch (error) {
      setSrsIntegrated(false);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getCatalogItems({
        search: searchQuery || undefined,
        itemTypes: filterTypes.length > 0 ? filterTypes.join(',') : undefined,
        sortBy: sortOption,
      });
      
      if (response.success && response.data) {
        setItems(response.data.items);
      } else {
        setToast({ message: response.message || 'Failed to load items', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to load catalog items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    setSelectedItem({
      id: 'new-item',
      createdAt: '',
      updatedAt: '',
      ...newItemDefaults,
    });
    setIsCreatingNew(true);
    setSidebarOpen(true);
  };

  const updateItemType = async (id: string, newType: 'Material' | 'Labor' | 'Other') => {
    try {
      const response = await updateCatalogItemType(id, newType);
      
      if (response.success) {
        setToast({ message: 'Item type updated successfully', type: 'success' });
        loadItems();
      } else {
        setToast({ message: response.message || 'Failed to update item type', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to update item type', type: 'error' });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await deleteCatalogItem(id);
      
      if (response.success) {
        setToast({ message: 'Item deleted successfully', type: 'success' });
        loadItems();
      } else {
        setToast({ message: response.message || 'Failed to delete item', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to delete item', type: 'error' });
    }
  };

  const openEditSidebar = (item: CatalogItem) => {
    setSelectedItem(item);
    setIsCreatingNew(false);
    setSidebarOpen(true);
  };

  const handleSaveItem = async (updatedData: Partial<CatalogItem>) => {
    if (!selectedItem) return;
    
    try {
      const mergedData = {
        itemType: updatedData.itemType ?? selectedItem.itemType ?? newItemDefaults.itemType,
        name: updatedData.name ?? selectedItem.name ?? newItemDefaults.name,
        description: updatedData.description ?? selectedItem.description ?? newItemDefaults.description,
        measurements: updatedData.measurements ?? selectedItem.measurements ?? newItemDefaults.measurements,
        coverage: updatedData.coverage ?? selectedItem.coverage ?? newItemDefaults.coverage,
        supplier: updatedData.supplier ?? selectedItem.supplier ?? newItemDefaults.supplier,
        preTaxCost: updatedData.preTaxCost ?? selectedItem.preTaxCost ?? newItemDefaults.preTaxCost,
        waste: updatedData.waste ?? selectedItem.waste ?? newItemDefaults.waste,
        unit: updatedData.unit ?? selectedItem.unit ?? newItemDefaults.unit,
        salesTax: updatedData.salesTax ?? selectedItem.salesTax ?? newItemDefaults.salesTax,
        materialPurchaseTax: updatedData.materialPurchaseTax ?? selectedItem.materialPurchaseTax ?? newItemDefaults.materialPurchaseTax,
      };

      if (isCreatingNew) {
        const response = await createCatalogItem(mergedData);

        if (response.success && response.data) {
          setToast({ message: 'Item created successfully', type: 'success' });
          setSelectedItem(response.data);
          setIsCreatingNew(false);
          loadItems();
        } else {
          setToast({ message: response.message || 'Failed to create item', type: 'error' });
        }
      } else {
        const response = await updateCatalogItem(selectedItem.id, mergedData);

        if (response.success) {
          setItems(items.map(item => item.id === selectedItem.id ? { ...item, ...mergedData } : item));
          setSelectedItem({ ...selectedItem, ...mergedData });
        } else {
          setToast({ message: response.message || 'Failed to update item', type: 'error' });
        }
      }
    } catch (error) {
      setToast({ message: 'Failed to update item', type: 'error' });
    }
  };

  const duplicateItem = async (id: string) => {
    try {
      const response = await duplicateCatalogItem(id);
      
      if (response.success) {
        setToast({ message: 'Item duplicated successfully', type: 'success' });
        loadItems();
      } else {
        setToast({ message: response.message || 'Failed to duplicate item', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to duplicate item', type: 'error' });
    }
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

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    try {
      const response = await bulkDeleteCatalogItems(Array.from(selectedItems));
      
      if (response.success) {
        setToast({ message: `${selectedItems.size} item(s) deleted successfully`, type: 'success' });
        setSelectedItems(new Set());
        loadItems();
      } else {
        setToast({ message: response.message || 'Failed to delete items', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to delete items', type: 'error' });
    }
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

  const applyFilterSort = () => {
    setFilterTypes(tempFilterTypes);
    setSortOption(tempSortOption);
    setShowFilterSortModal(false);
  };

  const resetFilters = () => {
    setFilterTypes([]);
    setTempFilterTypes([]);
    setSortOption('name-asc');
    setTempSortOption('name-asc');
  };

  const toggleFilterType = (type: string) => {
    if (tempFilterTypes.includes(type)) {
      setTempFilterTypes(tempFilterTypes.filter(t => t !== type));
    } else {
      setTempFilterTypes([...tempFilterTypes, type]);
    }
  };

  const handleExportCsv = async () => {
    const response = await exportCatalogCsv();
    if (!response.success || !response.blob) {
      setToast({ message: response.message || 'Failed to export CSV', type: 'error' });
      return;
    }

    const blobUrl = URL.createObjectURL(response.blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    const dateSuffix = new Date().toISOString().slice(0, 10);
    link.download = `catalog-export-${dateSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handleImportCsv = async (file: File) => {
    try {
      const csvText = await file.text();
      const response = await importCatalogCsv(csvText);
      if (!response.success || !response.data) {
        setToast({ message: response.message || 'Failed to import CSV', type: 'error' });
        return;
      }

      const { created, updated, failed, errors } = response.data;
      const message = `Import complete: ${created} created, ${updated} updated, ${failed} failed`;
      setToast({ message, type: failed > 0 ? 'error' : 'success' });
      if (failed > 0 && errors.length > 0) {
        console.warn('Catalog CSV import row errors:', errors);
      }
      loadItems();
    } catch (error) {
      setToast({ message: 'Failed to read CSV file', type: 'error' });
    } finally {
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your catalog items</p>
          
          {/* Connect Section */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Connect</h3>
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-sm">
              <Link size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">ABC Supply</span>
              {abcSupplyIntegrated !== null && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  abcSupplyIntegrated 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {abcSupplyIntegrated ? 'Connected' : 'Not Connected'}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Upload size={16} />
            Upload CSV
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImportCsv(file);
              }
            }}
          />
          <button
            onClick={addItem}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColumnModal(true)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Eye size={16} />
              Columns ({Object.values(columnVisibility).filter(v => v).length})
            </button>
            <button
              onClick={() => {
                setTempFilterTypes(filterTypes);
                setTempSortOption(sortOption);
                setShowFilterSortModal(true);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <SlidersHorizontal size={16} />
              Filter & Sort {filterTypes.length > 0 && `(${filterTypes.length})`}
            </button>
          </div>
        </div>

        {selectedItems.size > 0 && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-2">
              <button onClick={bulkDelete} className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                Delete Selected
              </button>
              <button onClick={() => setSelectedItems(new Set())} className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto relative">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left" style={{minWidth: '50px'}}></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase" style={{minWidth: '50px'}}>
                  <input type="checkbox" className="rounded" onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(new Set(items.map(i => i.id)));
                    } else {
                      setSelectedItems(new Set());
                    }
                  }} />
                </th>
                {columnVisibility.itemType && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item Type</th>}
                {columnVisibility.name && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>}
                {columnVisibility.description && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>}
                {columnVisibility.measurements && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Measurements</th>}
                {columnVisibility.coverage && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Coverage (sq ft)</th>}
                {columnVisibility.supplier && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>}
                {columnVisibility.preTaxCost && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pre-Tax Cost</th>}
                {columnVisibility.waste && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waste (%)</th>}
                {columnVisibility.unit && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>}
                {columnVisibility.salesTax && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales Tax (%)</th>}
                {columnVisibility.materialPurchaseTax && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material Purchase Tax (%)</th>}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase sticky right-0 bg-gray-50 dark:bg-gray-800 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]" style={{minWidth: '120px'}}>Actions</th>
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-move"
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
                  {columnVisibility.itemType && (
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={item.itemType}
                        onChange={(e) => updateItemType(item.id, e.target.value as 'Material' | 'Labor' | 'Other')}
                        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Material">Material</option>
                        <option value="Labor">Labor</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                  )}
                  {columnVisibility.name && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.name}</td>}
                  {columnVisibility.description && <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.description || '-'}</td>}
                  {columnVisibility.measurements && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.measurements || '-'}</td>}
                  {columnVisibility.coverage && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.coverage}</td>}
                  {columnVisibility.supplier && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white">{item.supplier || '-'}</span>
                        {item.itemType === 'Material' && !item.supplier && (
                          <button 
                            onClick={() => openEditSidebar(item)}
                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  {columnVisibility.preTaxCost && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">${item.preTaxCost.toFixed(2)}</td>}
                  {columnVisibility.waste && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.waste}%</td>}
                  {columnVisibility.unit && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.unit}</td>}
                  {columnVisibility.salesTax && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.salesTax}%</td>}
                  {columnVisibility.materialPurchaseTax && <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.materialPurchaseTax}%</td>}
                  <td className="px-4 py-3 sticky right-0 bg-white dark:bg-gray-800 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]" style={{minWidth: '120px'}}>
                    <div className="flex gap-2">
                      <button onClick={() => openEditSidebar(item)} className="text-gray-400 hover:text-primary-600" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => duplicateItem(item.id)} className="text-gray-400 hover:text-green-600" title="Duplicate">
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading items...</p>
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery || filterTypes.length > 0 ? 'No items found matching your filters.' : 'No items yet. Click "Add Item" to create your first catalog item.'}
            </div>
          )}
        </div>
      </div>

      {/* Column Visibility Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Show/Hide Columns</h3>
              <button onClick={() => setShowColumnModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(columnVisibility).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setColumnVisibility({ ...columnVisibility, [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowColumnModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Sort Modal */}
      {showFilterSortModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter & Sort</h3>
              <div className="flex items-center gap-2">
                {(filterTypes.length > 0 || sortOption !== 'name-asc') && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setTempFilterTypes([]);
                      setTempSortOption('name-asc');
                    }}
                    className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5 text-red-600 dark:text-red-400"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                )}
                <button onClick={() => setShowFilterSortModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sort Accordion */}
            <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setAccordionOpen({ ...accordionOpen, sort: !accordionOpen.sort })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">Sort By</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${accordionOpen.sort ? 'rotate-180' : ''}`} />
              </button>
              {accordionOpen.sort && (
                <div className="p-4 pt-0 space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sort"
                      checked={tempSortOption === 'name-asc'}
                      onChange={() => setTempSortOption('name-asc')}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alphabetical ascending (A to Z)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sort"
                      checked={tempSortOption === 'name-desc'}
                      onChange={() => setTempSortOption('name-desc')}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Alphabetical descending (Z to A)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sort"
                      checked={tempSortOption === 'date-new'}
                      onChange={() => setTempSortOption('date-new')}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Created date (newest)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="sort"
                      checked={tempSortOption === 'date-old'}
                      onChange={() => setTempSortOption('date-old')}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Created date (oldest)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Item Type Filter Accordion */}
            <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setAccordionOpen({ ...accordionOpen, itemType: !accordionOpen.itemType })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">Item Type</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${accordionOpen.itemType ? 'rotate-180' : ''}`} />
              </button>
              {accordionOpen.itemType && (
                <div className="p-4 pt-0 space-y-3">
                  {['Material', 'Labor', 'Other'].map((type) => (
                    <label key={type} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempFilterTypes.includes(type)}
                        onChange={() => toggleFilterType(type)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilterSortModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={applyFilterSort}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <CatalogItemSidebar
        isOpen={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
          setSelectedItem(null);
          setIsCreatingNew(false);
        }}
        item={selectedItem}
        onSave={handleSaveItem}
        isCreating={isCreatingNew}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
