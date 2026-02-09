import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Truck, Plus, Search } from 'lucide-react';
import { CatalogItem } from '../../../../shared/store/services/catalogApi';

interface CatalogItemSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onSave: (item: Partial<CatalogItem>) => void;
  isCreating?: boolean;
}

const CatalogItemSidebar: React.FC<CatalogItemSidebarProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  isCreating = false
}) => {
  const [formData, setFormData] = useState<Partial<CatalogItem>>({});
  const [affectedTemplates] = useState(['New template', 'New template', 'New template']);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Array<{name: string; searchQuery?: string}>>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  
  // Check integration status from app - these would come from your app state/context
  const supplierIntegrations = {
    'ABC Supply': false, // Change to true if integrated
    'SRS': false // Change to true if integrated
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

  const handleChange = (field: keyof CatalogItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof CatalogItem) => {
    if (!isCreating) {
      onSave(formData);
    }
  };

  const handleImmediateSave = (field: keyof CatalogItem, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    if (!isCreating) {
      onSave(updatedData);
    }
  };

  const addSupplier = (supplierName: string) => {
    const newSuppliers = [...selectedSuppliers, { name: supplierName }];
    setSelectedSuppliers(newSuppliers);
    const supplierValue = newSuppliers.map(s => s.name).join(', ');
    handleImmediateSave('supplier', supplierValue);
    setShowAddSupplier(false);
  };

  const removeSupplier = (index: number) => {
    const newSuppliers = selectedSuppliers.filter((_, i) => i !== index);
    setSelectedSuppliers(newSuppliers);
    const supplierValue = newSuppliers.map(s => s.name).join(', ');
    handleImmediateSave('supplier', supplierValue);
  };

  const updateSupplierSearch = (index: number, searchQuery: string) => {
    const newSuppliers = [...selectedSuppliers];
    newSuppliers[index] = { ...newSuppliers[index], searchQuery };
    setSelectedSuppliers(newSuppliers);
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
                value={formData.coverage || 0}
                onChange={(e) => handleChange('coverage', parseFloat(e.target.value) || 0)}
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
                value={formData.waste || 0}
                onChange={(e) => handleChange('waste', parseFloat(e.target.value) || 0)}
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
                  value={formData.preTaxCost || 0}
                  onChange={(e) => handleChange('preTaxCost', parseFloat(e.target.value) || 0)}
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
                  value={formData.materialPurchaseTax || 0}
                  onChange={(e) => handleChange('materialPurchaseTax', parseFloat(e.target.value) || 0)}
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
                value={formData.salesTax || 0}
                onChange={(e) => handleChange('salesTax', parseFloat(e.target.value) || 0)}
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
                    const isIntegrated = supplierIntegrations[supplier.name as keyof typeof supplierIntegrations];
                    
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
                                {isIntegrated ? 'Integrated' : 'Manual'}
                              </span>
                              {!isIntegrated && (
                                <button
                                  onClick={() => setShowAddSupplier(true)}
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
                        
                        <div className="relative mt-3">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="text"
                            placeholder="Search supplier catalog..."
                            value={supplier.searchQuery || ''}
                            onChange={(e) => updateSupplierSearch(index, e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
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
                Affected templates
              </h3>
              <div className="space-y-2">
                {affectedTemplates.map((template, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {template}
                  </a>
                ))}
              </div>
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
