import React, { useState, useEffect } from "react";
import { Search, Filter, Plus, ShoppingCart } from "lucide-react";
import { abcSupplyApi } from "../../abc-supply/services/api";
import { srsApi } from "../services/srsApi";
import { Product } from "../../abc-supply/types";
import ShoppingCartComponent from "./ShoppingCart";

interface ProductCatalogProps {
  onBack: () => void;
  supplier?: string;
  branchId?: string;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onBack, supplier = 'ABC Supply', branchId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [cart, setCart] = useState<Array<Product & { quantity: number }>>(
    () => {
      const cartKey =
        supplier === "SRS" ? "srs-supply-cart" : "abc-supply-cart";
      const savedCart = localStorage.getItem(cartKey);
      return savedCart ? JSON.parse(savedCart) : [];
    }
  );
  const [showCart, setShowCart] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  // Track selected option/UOM per product (keyed by itemNumber)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { option: string; uom: string }>>({});

  useEffect(() => {
    loadProducts();
  }, [branchId]); // Reload if branch changes

  const loadProducts = async () => {
    try {
      setLoading(true);
      if (supplier === "SRS") {
        // Fetch a large number of products to handle locally
        const response = await srsApi.searchItems('', branchId || '', 2000);
        const srsData = response.data?.data || response.data || [];
        const srsProducts = Array.isArray(srsData) ? srsData : [];

        const mappedProducts = srsProducts.map((product: any) => ({
          itemNumber: product.productId.toString(),
          itemDescription: product.productName,
          familyName: product.productCategory || product.familyName || '',
          supplierName: product.manufacturer || product.supplierName || 'SRS Distribution',
          status: "Active",
          productImageUrl: product.productImageUrl,
          productVariants: product.productVariants || product.productVariant || [],
          productOptions: product.productOptions || [],
          srsProductId: product.productId,
        }));
        setAllProducts(mappedProducts as any);
      } else {
        if (branchId) {
          const data = await abcSupplyApi.filterItems([''], 50, pagination.page, branchId);
          setAllProducts(Array.isArray(data) ? data : []);
        } else {
          const response = await abcSupplyApi.getItems(pagination.page, 50);
          const items = (response as any).items?.items || (response as any).items || [];
          setAllProducts(Array.isArray(items) ? items : []);
        }
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddToCart = (product: any) => {
    const storageKey = supplier === "SRS" ? "srs-supply-cart" : "abc-supply-cart";
    // For SRS use composite cartKey so different color/UOM combos are separate line items
    const uniqueKey = product.cartKey || product.itemNumber;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item: any) =>
        (item.cartKey || item.itemNumber) === uniqueKey
      );
      let newCart;
      if (existingItem) {
        newCart = prevCart.map((item: any) =>
          (item.cartKey || item.itemNumber) === uniqueKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }
      localStorage.setItem(storageKey, JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleUpdateQuantity = (uniqueKey: string, quantity: number) => {
    const storageKey = supplier === "SRS" ? "srs-supply-cart" : "abc-supply-cart";
    setCart((prevCart) => {
      if (quantity <= 0) {
        const newCart = prevCart.filter((item: any) =>
          (item.cartKey || item.itemNumber) !== uniqueKey
        );
        localStorage.setItem(storageKey, JSON.stringify(newCart));
        return newCart;
      }
      const newCart = prevCart.map((item: any) =>
        (item.cartKey || item.itemNumber) === uniqueKey ? { ...item, quantity } : item
      );
      localStorage.setItem(storageKey, JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleRemoveItem = (uniqueKey: string) => {
    const storageKey = supplier === "SRS" ? "srs-supply-cart" : "abc-supply-cart";
    setCart((prevCart) => {
      const newCart = prevCart.filter((item: any) =>
        (item.cartKey || item.itemNumber) !== uniqueKey
      );
      localStorage.setItem(storageKey, JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleCheckout = () => {
    const cartKey = supplier === "SRS" ? "srs-supply-cart" : "abc-supply-cart";
    setCart([]);
    localStorage.removeItem(cartKey);
  };

  const handleCategoryFilter = async (category: string, checked: boolean) => {
    if (supplier !== "ABC Supply") return;

    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);

    setSelectedCategories(newCategories);
    // Note: ABC still uses API filtering logic here if needed
  };

  const handleManufacturerFilter = (manufacturer: string, checked: boolean) => {
    setSelectedManufacturers((prev) =>
      checked ? [...prev, manufacturer] : prev.filter((m) => m !== manufacturer)
    );
  };

  const handleVariantChange = (oldItemNumber: string, newVariant: any) => {
    const cartKey = supplier === "SRS" ? "srs-supply-cart" : "abc-supply-cart";
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => {
        if (item.itemNumber === oldItemNumber) {
          const newProduct = allProducts.find(
            (p) => p.itemNumber === newVariant.itemNumber
          );
          if (newProduct) {
            return { ...newProduct, quantity: item.quantity };
          }
          return {
            ...item,
            itemNumber: newVariant.itemNumber,
            itemDescription: newVariant.itemDescription,
          };
        }
        return item;
      });
      localStorage.setItem(cartKey, JSON.stringify(newCart));
      return newCart;
    });
  };

  // Local filtering logic for SRS
  const filteredProducts = Array.isArray(allProducts) ? allProducts.filter(product => {
    const matchesSearch = !searchQuery.trim() || 
      product.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.itemNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.familyName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesManufacturer = selectedManufacturers.length === 0 ||
      selectedManufacturers.includes(product.supplierName || '');

    return matchesSearch && matchesManufacturer;
  }) : [];

  const paginatedProducts = supplier === 'SRS' 
    ? filteredProducts.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
    : filteredProducts;

  useEffect(() => {
    if (supplier === 'SRS') {
      setPagination(prev => ({
        ...prev,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / prev.limit),
        page: 1 // Reset to page 1 on filter change
      }));
    }
  }, [searchQuery, selectedManufacturers, allProducts.length]);

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
            <h1 className="text-2xl font-bold text-white">
              {supplier} Product Catalog
            </h1>
            <p className="text-white mt-1">
              Browse our complete selection of construction materials
            </p>
          </div>

          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
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
                <h3 className="text-sm font-medium text-white mb-2">
                  Category
                </h3>
                <div className="space-y-2">
                  {["Roofing", "Siding", "Gutters", "Insulation"].map(
                    (category) => (
                      <label key={category} className="flex items-center text-gray-300">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) =>
                            handleCategoryFilter(category, e.target.checked)
                          }
                        />
                        <span className="ml-2 text-sm">
                          {category}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Manufacturer
                </h3>
                <div className="space-y-2">
                  {["GAF", "Owens Corning", "CertainTeed", "IKO"].map(
                    (brand) => (
                      <label key={brand} className="flex items-center text-gray-300">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                          checked={selectedManufacturers.includes(brand)}
                          onChange={(e) =>
                            handleManufacturerFilter(brand, e.target.checked)
                          }
                        />
                        <span className="ml-2 text-sm">
                          {brand}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full table-fixed divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-800/50">
                  {supplier === "SRS" && (
                    <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                  )}
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Item #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  {supplier === "SRS" && (
                    <th className="w-56 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Options
                    </th>
                  )}
                  <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading products...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product: any) => {
                    const opts: string[] = product.productOptions || [];
                    const variants: any[] = product.productVariants || product.productVariant || [];
                    const selOption = selectedOptions[product.itemNumber]?.option || opts[0] || '';
                    const selVariant = variants.find((v: any) => v.colorName === selOption || v.selectedOption === selOption);
                    const availableUOMs: string[] = selVariant?.uoMs || selVariant?.uoms || ['BD'];
                    const selUOM = selectedOptions[product.itemNumber]?.uom || selVariant?.defaultUOM || availableUOMs[0] || 'BD';
                    const cartKey = `${product.itemNumber}__${selOption}__${selUOM}`;
                    const cartItem = cart.find((i: any) => i.cartKey === cartKey);
                    const quantity = cartItem?.quantity || 0;

                    return (
                      <tr key={product.itemNumber} className="hover:bg-gray-800/50 transition-colors">
                        {supplier === 'SRS' && (
                          <td className="px-4 py-3">
                            {product.productImageUrl ? (
                              <img
                                src={product.productImageUrl}
                                alt=""
                                className="w-12 h-12 object-cover rounded bg-gray-700"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                                N/A
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 text-xs font-mono text-gray-400 truncate">
                          {product.itemNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <div className="font-semibold text-white leading-tight">{product.itemDescription}</div>
                          {product.familyName && <div className="text-xs text-gray-500 mt-0.5">{product.familyName}</div>}
                          <div className="text-xs text-gray-600">{product.supplierName}</div>
                        </td>
                        {supplier === 'SRS' && (
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              {opts.length > 0 && (
                                <select
                                  value={selOption}
                                  onChange={(e) =>
                                    setSelectedOptions(prev => ({
                                      ...prev,
                                      [product.itemNumber]: { option: e.target.value, uom: selUOM }
                                    }))
                                  }
                                  className="text-xs bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                                >
                                  {opts.map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}
                              {availableUOMs.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {availableUOMs.map((uom: string) => (
                                    <button
                                      key={uom}
                                      onClick={() =>
                                        setSelectedOptions(prev => ({
                                          ...prev,
                                          [product.itemNumber]: { option: selOption, uom }
                                        }))
                                      }
                                      className={`text-xs px-2 py-0.5 rounded border font-medium transition-colors ${
                                        selUOM === uom
                                          ? 'bg-primary-600 border-primary-500 text-white'
                                          : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-primary-400 hover:text-white'
                                      }`}
                                    >
                                      {uom}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 text-right">
                          {quantity === 0 ? (
                            <button
                              onClick={() => handleAddToCart({
                                ...product,
                                cartKey,
                                selectedOption: selOption,
                                selectedUOM: selUOM,
                                itemDescription: selOption
                                  ? `${product.itemDescription} — ${selOption} (${selUOM})`
                                  : product.itemDescription,
                              })}
                              className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleUpdateQuantity(cartKey, quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center bg-gray-700 text-white rounded hover:bg-red-600 transition"
                              >-</button>
                              <span className="w-7 text-center text-sm font-bold text-white">{quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(cartKey, quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center bg-gray-700 text-white rounded hover:bg-green-600 transition"
                              >+</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between px-2">
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ShoppingCartComponent
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onVariantChange={handleVariantChange}
        supplier={supplier}
      />
    </div>
  );
};

export default ProductCatalog;
