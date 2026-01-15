import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight, Loader2, Search, MapPin, Plus, X } from 'lucide-react';
import { abcSupplyApi, ItemsResponse } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const ProductCatalog: React.FC = () => {
  const { selectedBranch, addToCart } = useCart();
  const [data, setData] = useState<ItemsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Helper to extract image URL safely
  const getImageUrl = (product: Product | null) => {
    if (!product) return null;
    if (product.images && product.images.length > 0) {
      return product.images[0].href;
    }
    return null;
  };

  const handleAddToCart = async (product: Product | null) => {
    if (!product) return;
    // Defaulting to first UOM if available, or 'EA'
    const uom = product.uoms && product.uoms.length > 0 ? product.uoms[0].code : 'EA';
    await addToCart(product.itemNumber, 1, uom);
    // Optional: Show toast
  };

  const fetchItems = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await abcSupplyApi.getItems(page, limit);
      setData(response);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await abcSupplyApi.searchItems(query, limit, selectedBranch?.id);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryFilter = async (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);

    setSelectedCategories(newCategories);

    if (newCategories.length > 0) {
      try {
        setIsFiltering(true);
        const results = await abcSupplyApi.filterItems(newCategories, limit, 1, selectedBranch?.id);
        setFilteredResults(results);
      } catch (err) {
        console.error('Filter failed:', err);
        setFilteredResults([]);
      } finally {
        setIsFiltering(false);
      }
    } else {
      setFilteredResults([]);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else if (selectedCategories.length > 0) {
      const reFilter = async () => {
        try {
          setIsFiltering(true);
          const results = await abcSupplyApi.filterItems(selectedCategories, limit, 1, selectedBranch?.id);
          setFilteredResults(results);
        } catch (err) {
          console.error('Filter failed:', err);
        } finally {
          setIsFiltering(false);
        }
      };
      reFilter();
    }
  }, [selectedBranch]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const productsToShow = searchQuery ? searchResults : selectedCategories.length > 0 ? filteredResults : data?.items || [];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Products</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchItems(currentPage)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
          {selectedBranch ? (
            <div className="text-sm text-green-400 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              Viewing availability for: {selectedBranch.name}
              {selectedBranch.phone && <span className="ml-2 text-gray-400">({selectedBranch.phone})</span>}
            </div>
          ) : (
            <div className="text-sm text-yellow-500 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              No branch selected. Availability may not be accurate.
              <Link to="/abc-supply/branches" className="ml-1 underline">Select a branch</Link>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {data && `${data.total} total items`}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Filters</h3>
            <div>
              <h4 className="text-gray-300 text-sm font-medium mb-2">Category</h4>
              <div className="space-y-2">
                {['Roofing', 'Siding', 'Gutters', 'Insulation'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => handleCategoryFilter(category, e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {productsToShow.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Products Found</h3>
              <p className="text-gray-400">
                {selectedBranch ? `No items found available at ${selectedBranch.name}` : "No products available at the moment"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsToShow.map((product: Product) => (
                  <div
                    key={product.itemNumber}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center relative">
                      {getImageUrl(product) ? (
                        <img
                          src={getImageUrl(product)!}
                          alt={product.itemDescription}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingBag className="w-12 h-12 text-gray-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                        title="Add to Cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-white font-medium mb-2 line-clamp-2">{product.itemDescription}</h3>
                    <p className="text-gray-400 text-sm mb-2">Item #: {product.itemNumber}</p>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.marketingDescription}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{product.supplierName}</span>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {product.familyName || 'General'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {!searchQuery && selectedCategories.length === 0 && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeProductModal}>
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedProduct.itemDescription}</h2>
                <button onClick={closeProductModal} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {getImageUrl(selectedProduct) ? (
                      <img
                        src={getImageUrl(selectedProduct)!}
                        alt={selectedProduct.itemDescription}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ShoppingBag className="w-24 h-24 text-gray-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Product Details</h3>
                    <p className="text-gray-300"><strong>Item Number:</strong> {selectedProduct.itemNumber}</p>
                    <p className="text-gray-300"><strong>Family:</strong> {selectedProduct.familyName}</p>
                    <p className="text-gray-300"><strong>Supplier:</strong> {selectedProduct.supplierName}</p>
                    <p className="text-gray-300"><strong>Status:</strong> <span className={`px-2 py-0.5 rounded text-sm ${selectedProduct.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'}`}>{selectedProduct.status}</span></p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-400">{selectedProduct.marketingDescription || "No description available."}</p>
                  </div>

                  {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Specifications</h3>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {selectedProduct.specifications.map((spec: any, idx: number) => (
                          <li key={idx}>
                            <span className="font-medium">{spec.name || spec.key}:</span> {spec.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        closeProductModal();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;