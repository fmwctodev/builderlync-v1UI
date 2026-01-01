import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ShoppingCart } from 'lucide-react';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { Product } from '../../abc-supply/types';
import ShoppingCartComponent from './ShoppingCart';

interface ProductCatalogProps {
  onBack: () => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cart, setCart] = useState<Array<Product & { quantity: number }>>(() => {
    const savedCart = localStorage.getItem('abc-supply-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await abcSupplyApi.getItems(1, 50);
      setProducts(response.items.items);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadProducts();
      return;
    }

    try {
      setSearchLoading(true);
      // Use filterItems API with search query in filters array
      const data = await abcSupplyApi.filterItems([query], 50, 1);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.itemNumber === product.itemNumber);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.itemNumber === product.itemNumber
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }
      localStorage.setItem('abc-supply-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.itemNumber === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('abc-supply-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.itemNumber !== productId);
      localStorage.setItem('abc-supply-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleCheckout = () => {
    setCart([]);
    localStorage.removeItem('abc-supply-cart');
  };

  const handleCategoryFilter = async (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    setSelectedCategories(newCategories);
    
    // Combine search query and category filters
    const allFilters = [...newCategories];
    if (searchQuery.trim()) {
      allFilters.push(searchQuery.trim());
    }
    
    if (allFilters.length > 0) {
      try {
        setLoading(true);
        const results = await abcSupplyApi.filterItems(allFilters, 50, 1);
        setProducts(results);
      } catch (err) {
        console.error('Filter failed:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    } else {
      loadProducts();
    }
  };

  const handleManufacturerFilter = (manufacturer: string, checked: boolean) => {
    setSelectedManufacturers(prev =>
      checked ? [...prev, manufacturer] : prev.filter(m => m !== manufacturer)
    );
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesManufacturer = selectedManufacturers.length === 0 || 
      selectedManufacturers.includes(product.supplierName || '');
    
    return matchesManufacturer;
  }) : [];

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="text-white hover:text-white text-sm mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
            <p className="text-white mt-1">Browse our complete selection of construction materials</p>
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          <form className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 2) {
                    handleSearch(e.target.value);
                  } else if (e.target.value.length === 0) {
                    loadProducts();
                  }
                }}
                className="pl-10 pr-4 py-2 w-full bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => handleSearch(searchQuery)}
              disabled={searchLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <Filter className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Category</h3>
                <div className="space-y-2">
                  {['Roofing', 'Siding', 'Gutters', 'Insulation'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => handleCategoryFilter(category, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">Manufacturer</h3>
                <div className="space-y-2">
                  {['GAF', 'Owens Corning', 'CertainTeed', 'IKO'].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                        checked={selectedManufacturers.includes(brand)}
                        onChange={(e) => handleManufacturerFilter(brand, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-300">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full table-fixed divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Item Number</th>
                  <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Family Name</th>
                  <th className="w-80 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="w-24 px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-400">Loading products...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                filteredProducts.map((product) => (
                    <tr key={product.itemNumber} className="hover:bg-gray-800 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-white truncate">{product.itemNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="break-words">{product.familyName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{product.supplierName}</span>
                          <span className="text-gray-400">{product.itemDescription}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/50 text-green-300">
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ShoppingCartComponent
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default ProductCatalog;