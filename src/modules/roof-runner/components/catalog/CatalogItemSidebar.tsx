import React, { useState, useEffect, useRef } from 'react';
import { X, Lightbulb, Truck, Plus, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { CatalogItem } from '../../../../shared/store/services/catalogApi';
import { abcSupplyApi } from '../../../abc-supply/services/api';
import { Product } from '../../../abc-supply/types';
import { srsService } from '../../services/srsService';

interface CatalogItemSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onSave: (item: Partial<CatalogItem>) => void;
  isCreating?: boolean;
  abcSupplyConnected?: boolean;
  srsConnected?: boolean;
}

const CatalogItemSidebar: React.FC<CatalogItemSidebarProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  isCreating = false,
  abcSupplyConnected = false,
  srsConnected = false,
}) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [formData, setFormData] = useState<Partial<CatalogItem>>({});
  const [selectedSuppliers, setSelectedSuppliers] = useState<Array<{name: string; searchQuery?: string}>>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [abcSelectionMissing, setAbcSelectionMissing] = useState(false);
  const [abcSearchResults, setAbcSearchResults] = useState<Product[]>([]);
  const [abcSearchLoading, setAbcSearchLoading] = useState(false);
  const [srsSearchResults, setSrsSearchResults] = useState<any[]>([]);
  const [srsSearchLoading, setSrsSearchLoading] = useState(false);
  const searchDebounceRef = useRef<number | null>(null);
  
  const supplierIntegrations = {
    'ABC Supply': abcSupplyConnected,
  };
  
  const supplierOptions = ['ABC Supply', 'SRS'];
  
  const renderSupplierName = (name: string) => {
    if (name === 'ABC Supply') {
      return (
        <span className="font-semibold">
          <span className="text-red-600">A</span>
          <span className="text-blue-600">B</span>
          <span className="text-green-600">C</span>
          <span className="text-gray-900 dark:text-white"> Supply</span>
        </span>
      );
    }
    if (name === 'SRS') {
      return <span className="font-bold text-orange-600">SRS</span>;
    }
    return <span className="text-gray-900 dark:text-white">{name}</span>;
  };

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (item.supplier) {
        const suppliers = item.supplier.split(',').map(s => s.trim()).filter(s => s);
        setSelectedSuppliers(suppliers.map(name => ({ name })));
      } else {
        setSelectedSuppliers([]);
      }
    }
  }, [item]);

  useEffect(() => {
    if (!isOpen || !abcSupplyConnected) {
      setAbcSelectionMissing(false);
      return;
    }

    try {
      const selectedBranchRaw = localStorage.getItem('abc_selected_branch');
      const selectedShipToRaw = localStorage.getItem('abc_selected_shipto');

      const selectedBranch = selectedBranchRaw ? JSON.parse(selectedBranchRaw) : null;
      const selectedShipTo = selectedShipToRaw ? JSON.parse(selectedShipToRaw) : null;

      const hasValidBranch = Boolean(
        selectedBranch &&
        typeof selectedBranch === 'object' &&
        (selectedBranch.id || selectedBranch.number) &&
        selectedBranch.name
      );

      const hasValidShipTo = Boolean(
        selectedShipTo &&
        typeof selectedShipTo === 'object' &&
        selectedShipTo.number &&
        selectedShipTo.name
      );

      setAbcSelectionMissing(!(hasValidBranch && hasValidShipTo));
    } catch {
      setAbcSelectionMissing(true);
    }
  }, [isOpen, abcSupplyConnected]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const handleChange = (field: keyof CatalogItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof CatalogItem) => {
    if (!isCreating) {
      onSave(formData);
    }
  };

  const handleImmediateSave = (field: keyof CatalogItem, value: any) => {
    const updatedData: Partial<CatalogItem> = { ...formData, [field]: value };
    setFormData(updatedData);
    if (!isCreating) {
      onSave(updatedData);
    }
  };

  const handleImmediatePatchSave = (patch: Partial<CatalogItem>) => {
    const updatedData: Partial<CatalogItem> = { ...formData, ...patch };
    setFormData(updatedData);
    if (!isCreating) {
      onSave(updatedData);
    }
  };

  const addSupplier = (supplierName: string) => {
    if (supplierName === 'ABC Supply') {
      if (!abcSupplyConnected) {
        setShowAddSupplier(false);
        navigate(`${orgPrefix}/settings/integrations`);
        return;
      }

      if (abcSelectionMissing) {
        setShowAddSupplier(false);
        navigate(orgPrefix ? `${orgPrefix}/material-orders` : '/material-orders');
        return;
      }
    }

    if (supplierName === 'SRS' && !srsConnected) {
      setShowAddSupplier(false);
      navigate(`${orgPrefix}/settings/integrations`);
      return;
    }

    const newSuppliers = [...selectedSuppliers, { name: supplierName }];
    setSelectedSuppliers(newSuppliers);
    if (supplierName !== 'ABC Supply' && supplierName !== 'SRS') {
      const supplierValue = newSuppliers.map(s => s.name).join(', ');
      handleImmediateSave('supplier', supplierValue);
    }
    setShowAddSupplier(false);
  };

  const removeSupplier = (index: number) => {
    const removedSupplier = selectedSuppliers[index];
    const newSuppliers = selectedSuppliers.filter((_, i) => i !== index);
    setSelectedSuppliers(newSuppliers);
    const supplierValue = newSuppliers.map(s => s.name).join(', ');
    if (removedSupplier?.name === 'ABC Supply') {
      setAbcSearchResults([]);
      handleImmediatePatchSave({
        supplier: supplierValue,
        supplierType: null,
        productId: '',
        productData: null,
        branchId: '',
        branchData: null,
        abcSelectedShipTo: null,
      });
      return;
    }
    if (removedSupplier?.name === 'SRS') {
      setSrsSearchResults([]);
      handleImmediatePatchSave({
        supplier: supplierValue,
        supplierType: null,
        productId: '',
        productData: null,
      });
      return;
    }
    handleImmediateSave('supplier', supplierValue);
  };

  const updateSupplierSearch = (index: number, searchQuery: string) => {
    const newSuppliers = [...selectedSuppliers];
    newSuppliers[index] = { ...newSuppliers[index], searchQuery };
    setSelectedSuppliers(newSuppliers);

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    const query = searchQuery.trim();
    if (query.length < 2) {
      setAbcSearchResults([]);
      setSrsSearchResults([]);
      return;
    }

    if (newSuppliers[index]?.name === 'ABC Supply') {
      if (!abcSupplyConnected || abcSelectionMissing) return;

      searchDebounceRef.current = window.setTimeout(async () => {
        try {
          setAbcSearchLoading(true);
          const selectedBranchRaw = localStorage.getItem('abc_selected_branch');
          const selectedBranch = selectedBranchRaw ? JSON.parse(selectedBranchRaw) : null;
          const branchId = String(selectedBranch?.id || selectedBranch?.number || '');
          const results = await abcSupplyApi.searchItems(query, 50, branchId || undefined, 1);
          setAbcSearchResults(Array.isArray(results) ? results : []);
        } catch {
          setAbcSearchResults([]);
        } finally {
          setAbcSearchLoading(false);
        }
      }, 300);
    }

    if (newSuppliers[index]?.name === 'SRS') {
      if (!srsConnected) return;

      searchDebounceRef.current = window.setTimeout(async () => {
        try {
          setSrsSearchLoading(true);
          const result = await srsService.searchProducts(query, 1, 50);
          setSrsSearchResults(result?.data || []);
        } catch {
          setSrsSearchResults([]);
        } finally {
          setSrsSearchLoading(false);
        }
      }, 300);
    }
  };

  const selectAbcProduct = (index: number, product: Product) => {
    const selectedBranchRaw = localStorage.getItem('abc_selected_branch');
    const selectedShipToRaw = localStorage.getItem('abc_selected_shipto');
    const selectedBranch = selectedBranchRaw ? JSON.parse(selectedBranchRaw) : null;
    const selectedShipTo = selectedShipToRaw ? JSON.parse(selectedShipToRaw) : null;

    const newSuppliers = [...selectedSuppliers];
    const label = `${product.itemDescription || product.familyName || 'Product'} (${product.itemNumber})`;
    newSuppliers[index] = { ...newSuppliers[index], searchQuery: label };
    setSelectedSuppliers(newSuppliers);
    setAbcSearchResults([]);

    const branchId = String(selectedBranch?.id || selectedBranch?.number || '');
    const hasValidSelection = Boolean(product?.itemNumber && branchId);

    handleImmediatePatchSave({
      supplier: hasValidSelection ? 'ABC Supply' : '',
      supplierType: hasValidSelection ? 'abc' : null,
      productId: hasValidSelection ? (product.itemNumber || '') : '',
      productData: hasValidSelection ? product : null,
      branchId: hasValidSelection ? branchId : '',
      branchData: hasValidSelection ? (selectedBranch || null) : null,
      abcSelectedShipTo: hasValidSelection ? (selectedShipTo || null) : null,
    });
  };

  const selectSrsProduct = (index: number, product: any) => {
    const newSuppliers = [...selectedSuppliers];
    const label = `${product.productName || product.itemDescription || 'Product'} (${product.productId || product.itemNumber})`;
    newSuppliers[index] = { ...newSuppliers[index], searchQuery: label };
    setSelectedSuppliers(newSuppliers);
    setSrsSearchResults([]);

    const hasValidSelection = Boolean(product?.productId || product?.itemNumber);

    handleImmediatePatchSave({
      supplier: hasValidSelection ? 'SRS' : '',
      supplierType: hasValidSelection ? 'srs' : null,
      productId: hasValidSelection ? String(product.productId || product.itemNumber || '') : '',
      productData: hasValidSelection ? product : null,
    });
  };

  const clearAbcProductSelection = (index: number) => {
    const newSuppliers = [...selectedSuppliers];
    newSuppliers[index] = { ...newSuppliers[index], searchQuery: '' };
    setSelectedSuppliers(newSuppliers);
    setAbcSearchResults([]);

    handleImmediatePatchSave({
      supplier: '',
      supplierType: null,
      productId: '',
      productData: null,
      branchId: '',
      branchData: null,
      abcSelectedShipTo: null,
    });
  };

  const clearSrsProductSelection = (index: number) => {
    const newSuppliers = [...selectedSuppliers];
    newSuppliers[index] = { ...newSuppliers[index], searchQuery: '' };
    setSelectedSuppliers(newSuppliers);
    setSrsSearchResults([]);

    handleImmediatePatchSave({
      supplier: '',
      supplierType: null,
      productId: '',
      productData: null,
    });
  };

  const availableSuppliers = supplierOptions.filter(
    opt => !selectedSuppliers.some(s => s.name === opt)
  );

  if (!isOpen || !item) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isCreating ? 'New Item' : 'Edit Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Type
            </label>
            <select
              value={formData.itemType || 'Material'}
              onChange={(e) => handleImmediateSave('itemType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="Material">Material</option>
              <option value="Labor">Labor</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Measurements
              </label>
              <input
                type="text"
                value={formData.measurements || ''}
                onChange={(e) => handleChange('measurements', e.target.value)}
                onBlur={() => handleBlur('measurements')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coverage (sq ft)
              </label>
              <input
                type="number"
                value={formData.coverage === 0 ? '' : formData.coverage || ''}
                placeholder="0"
                onChange={(e) => handleChange('coverage', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                onBlur={() => handleBlur('coverage')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit || 'square'}
                onChange={(e) => handleChange('unit', e.target.value)}
                onBlur={() => handleBlur('unit')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Waste (%)
              </label>
              <input
                type="number"
                value={formData.waste === 0 ? '' : formData.waste || ''}
                placeholder="0"
                onChange={(e) => handleChange('waste', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                onBlur={() => handleBlur('waste')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Cost</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Pre-tax cost and Material purchase tax contribute to the final price per unit
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pre-tax cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.preTaxCost === 0 ? '' : formData.preTaxCost || ''}
                  placeholder="0"
                  onChange={(e) => handleChange('preTaxCost', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  onBlur={() => handleBlur('preTaxCost')}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Material purchase tax
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.materialPurchaseTax === 0 ? '' : formData.materialPurchaseTax || ''}
                  placeholder="0"
                  onChange={(e) => handleChange('materialPurchaseTax', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  onBlur={() => handleBlur('materialPurchaseTax')}
                  className="w-full pr-8 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sales tax
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.salesTax === 0 ? '' : formData.salesTax || ''}
                placeholder="0"
                onChange={(e) => handleChange('salesTax', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                onBlur={() => handleBlur('salesTax')}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {!isCreating && formData.itemType === 'Material' && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Suppliers
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">All changes saved</span>
              </div>

              {selectedSuppliers.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2 mb-3">
                    <Truck className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      Connect to supplier catalog to stay up-to-date with cost updates
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddSupplier(true)}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    Connect
                  </button>
                  {abcSupplyConnected && abcSelectionMissing && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                      Select Branch + Ship To in Material Orders first.
                    </p>
                  )}
                  {showAddSupplier && (
                    <div className="mt-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      {supplierOptions.map((supplier) => (
                        <button
                          key={supplier}
                          onClick={() => addSupplier(supplier)}
                          className="w-full px-3 py-2 text-sm text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {supplier}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowAddSupplier(false)}
                        className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-b-lg border-t border-gray-200 dark:border-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSuppliers.map((supplier, index) => {
                    const abcProductSelected = Boolean(formData.supplierType === 'abc' && formData.productId);
                    const srsProductSelected = Boolean(formData.supplierType === 'srs' && formData.productId);
                    const selectedAbcProduct = abcProductSelected ? (formData.productData as Product | null) : null;
                    const selectedSrsProduct = srsProductSelected ? (formData.productData as any) : null;
                    const isIntegrated = (supplier.name === 'ABC Supply' && abcProductSelected) || (supplier.name === 'SRS' && srsProductSelected);
                    
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {supplier.name === 'ABC Supply' ? (
                                <span className="font-semibold">
                                  <span className="text-red-600">A</span>
                                  <span className="text-blue-600">B</span>
                                  <span className="text-green-600">C</span>
                                  <span className="text-gray-900 dark:text-white"> Supply</span>
                                </span>
                              ) : supplier.name === 'SRS' ? (
                                <span className="font-bold text-orange-600">SRS</span>
                              ) : (
                                <span className="text-gray-900 dark:text-white">{supplier.name}</span>
                              )}
                            </div>
                            <div className="text-xs mt-1 flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded ${
                                isIntegrated 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}>
                                {isIntegrated ? 'Connected' : (supplier.name === 'ABC Supply' && abcSupplyConnected ? 'Select Product' : 'Not Connected')}
                              </span>
                              {!isIntegrated && !(supplier.name === 'ABC Supply' && abcSupplyConnected) && (
                                <button
                                  onClick={() => navigate(`${orgPrefix}/settings/integrations`)}
                                  className="text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeSupplier(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        {supplier.name === 'ABC Supply' && abcSupplyConnected && abcSelectionMissing ? (
                          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 p-3">
                            <p className="text-xs text-amber-800 dark:text-amber-300 mb-2">
                              Select ABC Branch + Ship To first.
                            </p>
                            <button
                              onClick={() => navigate(orgPrefix ? `${orgPrefix}/material-orders` : '/material-orders')}
                              className="w-full px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              Go to Material Orders
                            </button>
                          </div>
                        ) : supplier.name === 'ABC Supply' && abcSupplyConnected && abcProductSelected ? (
                          <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected product</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedAbcProduct?.itemDescription || selectedAbcProduct?.familyName || formData.name || 'Product'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              #{formData.productId || selectedAbcProduct?.itemNumber || 'N/A'}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => clearAbcProductSelection(index)}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                              >
                                Remove product
                              </button>
                              <button
                                onClick={() => clearAbcProductSelection(index)}
                                className="px-3 py-1.5 text-xs border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-900/20"
                              >
                                Add another
                              </button>
                            </div>
                          </div>
                        // ) : supplier.name === 'SRS' && srsConnected && srsProductSelected ? (
                        ) : supplier.name === 'SRS' && srsProductSelected ? (
                          <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected product</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedSrsProduct?.productName || selectedSrsProduct?.itemDescription || formData.name || 'Product'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              #{formData.productId || selectedSrsProduct?.productId || selectedSrsProduct?.itemNumber || 'N/A'}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => clearSrsProductSelection(index)}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                              >
                                Remove product
                              </button>
                              <button
                                onClick={() => clearSrsProductSelection(index)}
                                className="px-3 py-1.5 text-xs border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-900/20"
                              >
                                Add another
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative mt-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                            <input
                              type="text"
                              placeholder="Search supplier catalog and select product..."
                              value={supplier.searchQuery || ''}
                              onChange={(e) => updateSupplierSearch(index, e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                            {supplier.name === 'ABC Supply' && (
                              <div className="mt-2">
                                {abcSearchLoading && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Searching products...</p>
                                )}
                                {!abcSearchLoading && abcSearchResults.length > 0 && (
                                  <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                    {abcSearchResults.map((product) => (
                                      <button
                                        key={product.itemNumber}
                                        onClick={() => selectAbcProduct(index, product)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                      >
                                        <div className="font-medium text-gray-900 dark:text-white">{product.itemDescription || product.familyName || 'Product'}</div>
                                        <div className="text-gray-500 dark:text-gray-400">#{product.itemNumber}</div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {!abcSearchLoading && (supplier.searchQuery || '').trim().length >= 2 && abcSearchResults.length === 0 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">No products found.</p>
                                )}
                              </div>
                            )}
                            {supplier.name === 'SRS' && (
                              <div className="mt-2">
                                {srsSearchLoading && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Searching products...</p>
                                )}
                                {!srsSearchLoading && srsSearchResults.length > 0 && (
                                  <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                    {srsSearchResults.map((product) => (
                                      <button
                                        key={product.productId || product.itemNumber}
                                        onClick={() => selectSrsProduct(index, product)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                      >
                                        <div className="font-medium text-gray-900 dark:text-white">{product.productName || product.itemDescription || 'Product'}</div>
                                        <div className="text-gray-500 dark:text-gray-400">#{product.productId || product.itemNumber}</div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {!srsSearchLoading && (supplier.searchQuery || '').trim().length >= 2 && srsSearchResults.length === 0 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">No products found.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {availableSuppliers.length > 0 && (
                    !showAddSupplier ? (
                      <button
                        onClick={() => setShowAddSupplier(true)}
                        className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add another supplier
                      </button>
                    ) : (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                        {availableSuppliers.map((supplier) => (
                          <button
                            key={supplier}
                            onClick={() => addSupplier(supplier)}
                            className="w-full px-3 py-2 text-sm text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {supplier}
                          </button>
                        ))}
                        <button
                          onClick={() => setShowAddSupplier(false)}
                          className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-b-lg border-t border-gray-200 dark:border-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {!isCreating && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Affected templates ({formData.usage?.totalTemplates || 0})
              </h3>
              {formData.usage?.templates && formData.usage.templates.length > 0 ? (
                <div className="space-y-2">
                  {formData.usage.templates.map((template) => (
                    <div
                      key={template.id}
                      className="block px-3 py-2 text-sm text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => navigate(`${orgPrefix}/proposals/template/${template.id}`)}
                    >
                      {template.name} ({template.referenceCount})
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  Not used in any template
                </div>
              )}
            </div>
          )}

          {isCreating && (
            <button
              onClick={() => onSave(formData)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Item
            </button>
          )}
        </div>


      </div>
    </>
  );
};

export default CatalogItemSidebar;
