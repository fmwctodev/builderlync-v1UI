import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Copy, Search, SlidersHorizontal, GripVertical, Eye, X, RotateCcw, ChevronDown, Link, Download, Upload, Lightbulb } from 'lucide-react';
import { getCatalogItems, getCatalogItemById, createCatalogItem, updateCatalogItemType, deleteCatalogItem, bulkDeleteCatalogItems, duplicateCatalogItem, updateCatalogItem, CatalogItem, exportCatalogCsv, importCatalogCsv, getCatalogSettings, saveCatalogSettings } from '../../../shared/store/services/catalogApi';
import Toast from '../../../shared/components/Toast';
import CatalogItemSidebar from '../components/catalog/CatalogItemSidebar';
import Pagination from '../components/Pagination';
import { srsService } from '../services/srsService';
import { proposalsApi, Proposal } from '../services/proposalsApi';
import { qxoApi } from '../services/qxoApi';
import ConnectSupplierModal from '../components/catalog/ConnectSupplierModal';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';

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

const LOCKED_PROPOSAL_STATUSES = new Set(['sent', 'signed', 'lost']);
const getProposalStatusLabel = (status: Proposal['status']) => {
  if (status === 'incomplete') return 'Draft';
  if (status === 'complete') return 'Complete';
  if (status === 'signed') return 'Won';
  if (status === 'lost') return 'Lost';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Catalog() {
  const isSrsEnabled = useFeatureFlag('srs-distribution');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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
  const [showAddToProposalModal, setShowAddToProposalModal] = useState(false);
  const [availableProposals, setAvailableProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [proposalSearch, setProposalSearch] = useState('');
  const [addingToProposalId, setAddingToProposalId] = useState<number | null>(null);
  const [abcSupplyIntegrated, setAbcSupplyIntegrated] = useState<boolean | null>(null);
  const [srsIntegrated, setSrsIntegrated] = useState<boolean | null>(null);
  const [qxoIntegrated, setQxoIntegrated] = useState<boolean | null>(null);
  const [supplierToConnect, setSupplierToConnect] = useState<'abc' | 'srs' | 'qxo' | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'items' | 'settings'>('items');
  const [settings, setSettings] = useState({
    salesTax: 0,
    materialPurchaseTax: 0,
    wasteFactor: 0
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
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
    fetchABCSupplyStatus();
    if (isSrsEnabled) {
      checkSrsIntegration();
    }
    fetchQxoStatus();
    loadSettings();
  }, [isSrsEnabled])

  const loadSettings = async () => {
    try {
      const response = await getCatalogSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading catalog settings:', error);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadItems();
  }, [debouncedSearchQuery, filterTypes, sortOption, currentPage]);

  useEffect(() => {
    if (!showAddToProposalModal) return;

    const loadProposals = async () => {
      setLoadingProposals(true);
      try {
        const proposals = await proposalsApi.getProposals();
        setAvailableProposals(proposals);
      } catch (error) {
        console.error('Failed to load proposals:', error);
        setToast({ message: 'Failed to load proposals', type: 'error' });
      } finally {
        setLoadingProposals(false);
      }
    };

    loadProposals();
  }, [showAddToProposalModal]);

  const fetchABCSupplyStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3100/api'}/abc-supply/status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAbcSupplyIntegrated(data.data?.connected || false);
      }
    } catch (error) {
      console.error('Error fetching ABC Supply status:', error);
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
  
  const fetchQxoStatus = async () => {
    try {
      const response = await qxoApi.getStatus();
      if (response && response.success) {
        setQxoIntegrated(response.data?.connected || false);
      } else {
        setQxoIntegrated(false);
      }
    } catch (error) {
      console.error('Error fetching QXO status:', error);
      setQxoIntegrated(false);
    }
  };

  const handleConnectionSuccess = (supplier: string) => {
    setToast({ message: `${supplier.toUpperCase()} connected successfully!`, type: 'success' });
    setSupplierToConnect(null);
    if (supplier === 'abc') fetchABCSupplyStatus();
    if (supplier === 'srs') checkSrsIntegration();
    if (supplier === 'qxo') fetchQxoStatus();
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getCatalogItems({
        search: debouncedSearchQuery || undefined,
        itemTypes: filterTypes.length > 0 ? filterTypes.join(',') : undefined,
        sortBy: sortOption,
        page: currentPage,
        limit: 10,
      });
      
      if (response.success && response.data) {
        setItems(response.data.items);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.totalItems);
        }
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
      salesTax: settings.salesTax,
      materialPurchaseTax: settings.materialPurchaseTax,
      waste: settings.wasteFactor,
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

  const openEditSidebar = async (item: CatalogItem) => {
    setSelectedItem(item);
    setIsCreatingNew(false);
    setSidebarOpen(true);
    try {
      const response = await getCatalogItemById(item.id);
      if (response.success && response.data) {
        setSelectedItem(response.data);
      }
    } catch {
      // Keep sidebar usable with list-row data even if detail fetch fails.
    }
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
        supplierType: updatedData.supplierType ?? selectedItem.supplierType ?? null,
        productId: updatedData.productId ?? selectedItem.productId ?? '',
        productData: updatedData.productData ?? selectedItem.productData ?? null,
        branchId: updatedData.branchId ?? selectedItem.branchId ?? '',
        branchData: updatedData.branchData ?? selectedItem.branchData ?? null,
        abcSelectedShipTo: updatedData.abcSelectedShipTo ?? selectedItem.abcSelectedShipTo ?? null,
        preTaxCost: updatedData.preTaxCost ?? selectedItem.preTaxCost ?? newItemDefaults.preTaxCost,
        waste: updatedData.waste ?? selectedItem.waste ?? newItemDefaults.waste,
        unit: updatedData.unit ?? selectedItem.unit ?? newItemDefaults.unit,
        salesTax: updatedData.salesTax ?? selectedItem.salesTax ?? newItemDefaults.salesTax,
        materialPurchaseTax: updatedData.materialPurchaseTax ?? selectedItem.materialPurchaseTax ?? newItemDefaults.materialPurchaseTax,
      };

      const normalizedData = { ...mergedData };
      const hasValidAbcProduct = Boolean(
        normalizedData.supplierType === 'abc' &&
        normalizedData.productId &&
        String(normalizedData.productId).trim() &&
        normalizedData.branchId &&
        String(normalizedData.branchId).trim()
      );

      const hasValidSrsProduct = Boolean(
        normalizedData.supplierType === 'srs' &&
        normalizedData.productId &&
        String(normalizedData.productId).trim()
      );

      if (normalizedData.supplierType === 'abc' && !hasValidAbcProduct) {
        normalizedData.supplier = '';
        normalizedData.supplierType = null;
        normalizedData.productId = '';
        normalizedData.productData = null;
        normalizedData.branchId = '';
        normalizedData.branchData = null;
        normalizedData.abcSelectedShipTo = null;
      }

      if (normalizedData.supplierType === 'srs' && !hasValidSrsProduct) {
        normalizedData.supplier = '';
        normalizedData.supplierType = null;
        normalizedData.productId = '';
        normalizedData.productData = null;
      }

      if (isCreatingNew) {
        const response = await createCatalogItem(normalizedData);

        if (response.success && response.data) {
          setToast({ message: 'Item created successfully', type: 'success' });
          setSelectedItem(response.data);
          setIsCreatingNew(false);
          loadItems();
        } else {
          setToast({ message: response.message || 'Failed to create item', type: 'error' });
        }
      } else {
        const response = await updateCatalogItem(selectedItem.id, normalizedData);

        if (response.success) {
          setItems(items.map(item => item.id === selectedItem.id ? { ...item, ...normalizedData } : item));
          setSelectedItem({ ...selectedItem, ...normalizedData });
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

  const openAddToProposalModal = () => {
    if (selectedItems.size === 0) return;
    setProposalSearch('');
    setShowAddToProposalModal(true);
  };

  const closeAddToProposalModal = () => {
    if (addingToProposalId) return;
    setShowAddToProposalModal(false);
    setProposalSearch('');
  };

  const resolveSelectedCatalogItems = async (): Promise<CatalogItem[]> => {
    const selectedIds = Array.from(selectedItems);
    const currentPageItemsById = new Map(items.map((item) => [item.id, item]));

    const resolvedItems = await Promise.all(
      selectedIds.map(async (id) => {
        const existingItem = currentPageItemsById.get(id);
        if (existingItem) {
          return existingItem;
        }

        const response = await getCatalogItemById(id);
        return response.success && response.data ? response.data : null;
      })
    );

    return resolvedItems.filter((item): item is CatalogItem => Boolean(item));
  };

  const handleAddSelectedToProposal = async (proposal: Proposal) => {
    if (LOCKED_PROPOSAL_STATUSES.has(proposal.status)) {
      return;
    }

    setAddingToProposalId(proposal.id);
    try {
      const catalogItemsToAdd = await resolveSelectedCatalogItems();

      if (!catalogItemsToAdd.length) {
        setToast({ message: 'No catalog items were available to add', type: 'error' });
        return;
      }

      await proposalsApi.addCatalogItemsToProposal(proposal.id, catalogItemsToAdd);
      setToast({
        message: `${catalogItemsToAdd.length} item(s) added to "${proposal.title}"`,
        type: 'success',
      });
      setSelectedItems(new Set());
      setShowAddToProposalModal(false);
      setProposalSearch('');
    } catch (error: any) {
      console.error('Failed to add catalog items to proposal:', error);
      setToast({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to add selected catalog items to proposal',
        type: 'error',
      });
    } finally {
      setAddingToProposalId(null);
    }
  };

  const filteredProposals = availableProposals.filter((proposal) => {
    if (proposal.status === 'sent') {
      return false;
    }

    const query = proposalSearch.trim().toLowerCase();
    if (!query) return true;

    const customerName = proposal.sections?.settings?.customerName || '';
    const address = proposal.address?.address || '';

    return [proposal.title, customerName, address]
      .filter(Boolean)
      .some((value) => (value || '').toLowerCase().includes(query));
  });

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
    setCurrentPage(1);
    setShowFilterSortModal(false);
  };

  const resetFilters = () => {
    setFilterTypes([]);
    setTempFilterTypes([]);
    setSortOption('name-asc');
    setTempSortOption('name-asc');
    setCurrentPage(1);
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

  const handleDownloadSampleCsv = () => {
    const headers = [
      'id',
      'user_id',
      'item_type',
      'name',
      'description',
      'measurements',
      'coverage',
      'supplier',
      'supplier_type',
      'product_id',
      'product_data',
      'branch_id',
      'branch_data',
      'abc_selected_shipto',
      'pre_tax_cost',
      'waste',
      'unit',
      'sales_tax',
      'material_purchase_tax',
    ];

    const sampleRow = [
      '',
      '',
      'Material',
      'Architectural Shingles',
      'Sample material row',
      'sq ft',
      '100',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '120.50',
      '10',
      'square',
      '8.25',
      '2.50',
    ];

    const csvContent = `${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'catalog-import-sample.csv';
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

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await saveCatalogSettings(settings);
      if (response.success) {
        setToast({ message: 'Settings saved successfully', type: 'success' });
        setIsEditingSettings(false);
      } else {
        setToast({ message: response.message || 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error saving settings', type: 'error' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'items' ? 'Manage your catalog items' : 'Configure global default settings'}
          </p>
          
          {/* Connect Section */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                <Link size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">ABC Supply</span>
                {abcSupplyIntegrated !== null && (
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                    abcSupplyIntegrated 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {abcSupplyIntegrated ? 'Connected' : 'Not Connected'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                <Link size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">QXO</span>
                {qxoIntegrated !== null && (
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                    qxoIntegrated 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {qxoIntegrated ? 'Connected' : 'Not Connected'}
                  </span>
                )}
              </div>

              {isSrsEnabled && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                  <Link size={16} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">SRS</span>
                  {srsIntegrated !== null && (
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                      srsIntegrated 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                      {srsIntegrated ? 'Connected' : 'Not Connected'}
                    </span>
                  )}
                </div>
              )}
            </div>
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
          <button
            onClick={handleDownloadSampleCsv}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Download size={16} />
            Download Sample CSV
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-4">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'items'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All items
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
        {activeTab === 'items' ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
              <button
                onClick={openAddToProposalModal}
                className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-1"
              >
                <Link size={14} />
                Add to Proposal
              </button>
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
              {!loading && items.map((item, index) => (
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
                  {columnVisibility.description && (
                    <td
                      className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate"
                      title={item.description || '-'}
                    >
                      {item.description || '-'}
                    </td>
                  )}
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
        {!loading && items.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalContacts={totalItems}
            onPageChange={setCurrentPage}
            onPreviousPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            itemName="catalog items"
          />
        )}
      </>
      ) : (
        <div className="p-8 max-w-2xl text-gray-900 dark:text-white">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">Universal Defaults</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Apply your tax and waste factor settings automatically to all new records. These values can still be overridden individually.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sales Tax (%)
                </label>
                <p className="text-xs text-gray-500 mb-2">The tax customer pays to you</p>
                <div className="relative">
                    <input
                      type="number"
                      disabled={!isEditingSettings}
                      value={settings.salesTax === 0 && isEditingSettings ? '' : settings.salesTax}
                      placeholder="0"
                      onChange={(e) => setSettings({ ...settings, salesTax: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                    />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Material Purchase Tax (%)
                </label>
                <p className="text-xs text-gray-500 mb-2">The tax you pay when purchasing materials</p>
                <div className="relative">
                    <input
                      type="number"
                      disabled={!isEditingSettings}
                      value={settings.materialPurchaseTax === 0 && isEditingSettings ? '' : settings.materialPurchaseTax}
                      placeholder="0"
                      onChange={(e) => setSettings({ ...settings, materialPurchaseTax: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                    />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Waste Factor (%)
                </label>
                <p className="text-xs text-gray-500 mb-2">Default percentage added for material waste</p>
                <div className="relative">
                    <input
                      type="number"
                      disabled={!isEditingSettings}
                      value={settings.wasteFactor === 0 && isEditingSettings ? '' : settings.wasteFactor}
                      placeholder="0"
                      onChange={(e) => setSettings({ ...settings, wasteFactor: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                    />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              {!isEditingSettings ? (
                <button
                  onClick={() => setIsEditingSettings(true)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Settings
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingSettings(false);
                      loadSettings();
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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

      {showAddToProposalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Catalog Items to Proposal</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a proposal to receive {selectedItems.size} catalog item(s).
                </p>
              </div>
              <button
                onClick={closeAddToProposalModal}
                disabled={Boolean(addingToProposalId)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={proposalSearch}
                  onChange={(e) => setProposalSearch(e.target.value)}
                  placeholder="Search proposals by title, customer, or address..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
              {loadingProposals ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Loading proposals...
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  {proposalSearch ? 'No proposals matched your search.' : 'No proposals found.'}
                </div>
              ) : (
                filteredProposals.map((proposal) => {
                  const isLocked = LOCKED_PROPOSAL_STATUSES.has(proposal.status);
                  const isSaving = addingToProposalId === proposal.id;
                  const customerName = proposal.sections?.settings?.customerName || 'No customer';
                  const subtitle = proposal.address?.address || proposal.sections?.settings?.customerAddress || 'No address';

                  return (
                    <div
                      key={proposal.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {proposal.title || 'Untitled Proposal'}
                            </h3>
                            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                              {getProposalStatusLabel(proposal.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {customerName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {subtitle}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Total: ${Number(proposal.total || 0).toFixed(2)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => handleAddSelectedToProposal(proposal)}
                            disabled={isLocked || Boolean(addingToProposalId)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              isLocked || addingToProposalId
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                          >
                            {isSaving ? 'Adding...' : 'Add Here'}
                          </button>
                          {isLocked && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                              Locked proposal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeAddToProposalModal}
                disabled={Boolean(addingToProposalId)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {supplierToConnect && (
        <ConnectSupplierModal
          supplier={supplierToConnect}
          onClose={() => setSupplierToConnect(null)}
          onSuccess={handleConnectionSuccess}
        />
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
        abcSupplyConnected={Boolean(abcSupplyIntegrated)}
        srsConnected={Boolean(srsIntegrated)}
        qxoConnected={Boolean(qxoIntegrated)}
        onConnectClick={(s) => setSupplierToConnect(s)}
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
