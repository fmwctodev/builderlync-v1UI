import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  Check,
  AlertCircle,
  ShoppingCart,
  RefreshCw,
  Phone,
  ChevronDown,
  X,
  Package
} from 'lucide-react';
import { useABCSupply } from '../context/ABCSupplyContext';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { AccountBranchHeader } from './abc-supply';
import { searchProducts, ABCSupplyProduct } from '../services/abcSupplyApi';

interface ProductCatalogProps {
  onBack: () => void;
  onViewCart?: () => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onBack, onViewCart }) => {
  const { currentOrganizationId } = useCurrentOrganization();
  const organizationId = currentOrganizationId || '';

  const {
    selectedAccount,
    selectedBranch,
    addToCart,
    cartItems,
  } = useABCSupply();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ABCSupplyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnavailable, setShowUnavailable] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const canSearch = !!selectedAccount && !!selectedBranch;

  const loadProducts = useCallback(async (query?: string) => {
    if (!canSearch || !organizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchProducts(
        {
          query: query || '',
          branchNumber: selectedBranch?.branchNumber,
          category: categoryFilter || undefined,
          manufacturer: manufacturerFilter || undefined,
        },
        organizationId
      );
      setProducts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [canSearch, organizationId, selectedBranch?.branchNumber, categoryFilter, manufacturerFilter]);

  useEffect(() => {
    if (canSearch) {
      loadProducts();
    }
  }, [selectedBranch?.branchNumber, categoryFilter, manufacturerFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  const handleAddToCart = async (product: ABCSupplyProduct) => {
    const quantity = quantities[product.itemNumber] || 1;
    setAddingToCart(product.itemNumber);
    try {
      await addToCart(product, quantity, product.stockingUom);
    } finally {
      setAddingToCart(null);
    }
  };

  const getCartQuantity = (itemNumber: string) => {
    const item = cartItems.find(i => i.product.itemNumber === itemNumber);
    return item?.quantity || 0;
  };

  const filteredProducts = showUnavailable
    ? products
    : products.filter(p => p.isAvailable);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const manufacturers = [...new Set(products.map(p => p.manufacturer).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={onBack}
                className="text-white/70 hover:text-white text-sm mb-2 flex items-center gap-1"
              >
                <span>←</span> Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
              <p className="text-white/70 mt-1">
                Search and order materials from ABC Supply
              </p>
            </div>
          </div>
        </div>
      </div>

      <AccountBranchHeader onViewCart={onViewCart} />

      {!canSearch ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Select Account and Branch to Continue
            </h3>
            <p className="text-gray-400 text-sm">
              Product availability and pricing vary by branch. Please select your ship-to account
              and preferred branch location above to start browsing products.
            </p>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by product name, SKU, or manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-3 text-sm font-medium rounded-lg border flex items-center gap-2 ${
                isFilterOpen || categoryFilter || manufacturerFilter
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(categoryFilter || manufacturerFilter) && (
                <span className="h-5 w-5 flex items-center justify-center bg-primary-500 text-white text-xs rounded-full">
                  {(categoryFilter ? 1 : 0) + (manufacturerFilter ? 1 : 0)}
                </span>
              )}
            </button>
          </form>

          {isFilterOpen && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Manufacturer
                  </label>
                  <select
                    value={manufacturerFilter}
                    onChange={(e) => setManufacturerFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Manufacturers</option>
                    {manufacturers.map(mfr => (
                      <option key={mfr} value={mfr}>{mfr}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUnavailable}
                      onChange={(e) => setShowUnavailable(e.target.checked)}
                      className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-300">Show unavailable items</span>
                  </label>
                </div>
                {(categoryFilter || manufacturerFilter) && (
                  <button
                    onClick={() => {
                      setCategoryFilter('');
                      setManufacturerFilter('');
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => loadProducts(searchQuery)}
                className="ml-auto text-sm text-red-400 hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Products Found</h3>
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? 'Try adjusting your search terms or filters'
                  : 'Start by searching for products above'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Item Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Manufacturer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      UOM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredProducts.map((product) => {
                    const inCartQty = getCartQuantity(product.itemNumber);
                    const isAdding = addingToCart === product.itemNumber;

                    return (
                      <tr
                        key={product.itemNumber}
                        className={`${product.isAvailable ? 'hover:bg-gray-700' : 'opacity-60'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-white">
                            {product.itemNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300">
                            {product.manufacturer}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {product.familyName}
                            </span>
                            <span className="text-xs text-gray-400 line-clamp-2">
                              {product.itemDescription}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300">
                            {product.stockingUom}
                          </span>
                          {product.availableUoms.length > 1 && (
                            <span className="text-xs text-gray-500 block">
                              +{product.availableUoms.length - 1} more
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                              <Check className="h-3 w-3" />
                              Available
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                                <X className="h-3 w-3" />
                                Not at this branch
                              </span>
                              {selectedBranch?.phone && (
                                <button className="flex items-center gap-1 mt-1 text-xs text-gray-400 hover:text-primary-400">
                                  <Phone className="h-3 w-3" />
                                  Contact branch
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={quantities[product.itemNumber] || 1}
                            onChange={(e) => setQuantities(prev => ({
                              ...prev,
                              [product.itemNumber]: parseInt(e.target.value) || 1
                            }))}
                            disabled={!product.isAvailable}
                            className="w-16 px-2 py-1 text-center text-sm bg-gray-700 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {inCartQty > 0 && (
                            <span className="mr-2 text-xs text-primary-400">
                              {inCartQty} in cart
                            </span>
                          )}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.isAvailable || isAdding}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAdding ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductCatalog;
