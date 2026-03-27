import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, Loader2, Image as ImageIcon, ChevronLeft, Building, ShoppingCart, Minus } from 'lucide-react';
import { qxoApi } from '../services/qxoApi';
import ShoppingCartComponent from './ShoppingCart';

export default function QxoProductCatalog({ onBack }: { onBack?: () => void }) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [manualAccountId, setManualAccountId] = useState('');
  const [updatingAccount, setUpdatingAccount] = useState(false);

  const [loadingPrices, setLoadingPrices] = useState<string[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      const missingPrices = products.filter(p => !p.unitPrice || p.unitPrice === 0);
      if (missingPrices.length > 0) {
          const skus = missingPrices.map(p => p.skuId || p.itemNumber || p.productId).filter(Boolean) as string[];
          setLoadingPrices(prev => [...new Set([...prev, ...skus])]);
          fetchPrices(skus);
      }
    }
  }, [products.length]);

  const fetchPrices = async (skus: string[]) => {
    try {
      const res = await qxoApi.getItemPrices({ 
        skus, 
        branchId: selectedBranch?.id,
        accountId: selectedBranch?.accountId
      });
      
      // Correct extraction: ResponseHandler.success wraps in 'data', then qxoService wraps in 'data'
      const pricingData = res.data?.data || res.data?.priceInfo || res.data || {};
      console.log('[DEBUG] QXO Received Pricing Data:', pricingData);
      
      if (res.success) {
        setProducts(prev => {
          const updated = prev.map(item => {
            const sku = item.skuId || item.itemNumber || item.productId;
            const uoms = pricingData[sku];
            if (uoms) {
              let price = item.unitPrice;
              if (item.uom && uoms[item.uom]) {
                price = uoms[item.uom];
              } else {
                const firstUom = Object.keys(uoms)[0];
                price = uoms[firstUom];
              }
              console.log(`[DEBUG] Updating SKU ${sku} price to: ${price}`);
              return { ...item, unitPrice: price };
            }
            return item;
          });
          return updated;
        });

        // Also update cart prices if those items are in cart
        setCart(prev => prev.map(item => {
           const sku = item.skuId || item.itemNumber || item.productId;
           if (pricingData[sku]) {
             const uoms = pricingData[sku];
             let price = item.unitPrice;
             if (item.uom && uoms[item.uom]) {
               price = uoms[item.uom];
             } else {
               const firstUom = Object.keys(uoms)[0];
               price = uoms[firstUom];
             }
             return { ...item, unitPrice: price };
           }
           return item;
        }));
      }
    } catch (e) {
      console.error('Failed to fetch QXO prices:', e);
    } finally {
      setLoadingPrices(prev => prev.filter(s => !skus.includes(s)));
    }
  };

  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('qxo-supply-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('qxo-supply-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const saved = localStorage.getItem('qxo_selected_branch');
    if (saved) setSelectedBranch(JSON.parse(saved));
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!keyword.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    setErrorHeader(null);
    setShowAccountPrompt(false);

    try {
      const result = await qxoApi.searchProducts({ keyword, branchId: selectedBranch?.id });
      if (result.success && result.data) {
        let items = Array.isArray(result.data) ? result.data : (result.data.items || result.data.data || []);
        if (result.data.success && result.data.data) {
           items = Array.isArray(result.data.data) ? result.data.data : (result.data.data.items || []);
        }
        setProducts(items);
      } else {
        setProducts([]);
        if (result.message && result.message.includes('account id')) {
           setShowAccountPrompt(true);
           setErrorHeader(result.message);
        }
      }
    } catch (error: any) {
      console.error('QXO Product search failed:', error);
      setProducts([]);
      if (error.message && error.message.includes('account id')) {
        setShowAccountPrompt(true);
        setErrorHeader(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    if (!manualAccountId.trim()) return;
    setUpdatingAccount(true);
    try {
      const res = await qxoApi.updateProfile({ accountId: manualAccountId.trim() });
      if (res.success) {
        setShowAccountPrompt(false);
        setErrorHeader(null);
        handleSearch(); // Retry search
      } else {
        alert(res.message || 'Failed to update account ID');
      }
    } catch (e: any) {
      alert(e.message || 'An error occurred');
    } finally {
      setUpdatingAccount(false);
    }
  };

  const formatImage = (img: string | null | undefined, product?: any) => {
    let url = img || product?.imageUrl || product?.thumbnailUrl || product?.imagePath;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://beaconproplus.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.itemNumber === (product.itemNumber || product.productId));
      if (existing) {
        return prev.map(item => 
          item.itemNumber === (product.itemNumber || product.productId) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        ...product, 
        itemNumber: product.itemNumber || product.productId,
        itemDescription: product.productName,
        quantity: 1 
      }];
    });
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(item => item.itemNumber !== id);
      return prev.map(item => item.itemNumber === id ? { ...item, quantity: qty } : item);
    });
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.itemNumber !== id));
  };

  const handleCheckout = () => {
    setCart([]);
    localStorage.removeItem('qxo-supply-cart');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col min-h-[500px]">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-7 w-7 text-primary-600" />
                Beacon Pro+ Product Catalog
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedBranch ? `Searching inventory at ${selectedBranch.name}` : 'Connect a branch to search products.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
          >
            <ShoppingCart className="h-5 w-5" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 animate-in zoom-in">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
        
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by product name, category, or SKU..."
                className="pl-12 py-3 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-base"
                disabled={!selectedBranch}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !keyword.trim() || !selectedBranch}
              className="flex justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Search'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-x-auto bg-gray-50/50 dark:bg-gray-900/50">
          {!selectedBranch ? (
            <div className="text-center py-20 m-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <Package className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Branch Required</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">Please select a Beacon Pro+ branch from the Dashboard before searching the catalog.</p>
            </div>
          ) : showAccountPrompt ? (
            <div className="max-w-md mx-auto my-12 py-12 px-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-primary-100 dark:border-primary-900/30 shadow-xl text-center">
              <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account ID Required</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 px-4">
                We couldn't find your Beacon Account ID automatically. Please enter it manually to enable product searching.
              </p>
              
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Account ID</label>
                  <input
                    type="text"
                    value={manualAccountId}
                    onChange={(e) => setManualAccountId(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 678204"
                    className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-lg font-mono focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={handleUpdateAccount}
                  disabled={updatingAccount || !manualAccountId.trim()}
                  className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                >
                  {updatingAccount ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Save & Continue'}
                </button>
              </div>
              
              <p className="mt-6 text-xs text-gray-400 leading-relaxed">
                You can find this ID in your Beacon Pro+ profile settings or near the top of your paper invoices.
              </p>
            </div>
          ) : loading ? (
             <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
             </div>
          ) : products.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Item #</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">Brand / Category</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {products.map((product, idx) => {
                    const imageUrl = formatImage(product.productImage, product);
                    const stableId = product.productId || product.itemNumber || product.sku || `idx-${idx}`;
                    const brand = product.brand || 'Beacon';
                    const category = product.categories?.[0]?.categoryName || 'Materials';
                    const priceValue = product.unitPrice || product.currentSKU?.unitPrice || product.itemPrice || '0';
                    const price = typeof priceValue === 'number' ? priceValue : parseFloat(String(priceValue).replace(/[^0-9.]/g, '')) || 0;
                    const uom = product.uom || product.currentSKU?.currentUOM || 'EA';
                    
                    return (
                      <tr key={stableId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-16 w-16 rounded-lg bg-white border border-gray-100 dark:border-gray-700 p-1 flex items-center justify-center overflow-hidden">
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt=""
                                className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => { (e.target as any).src = product.productOnErrorImage || ''; }}
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-gray-200 dark:text-gray-700" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                          {product.itemNumber || product.productId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {product.productName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {product.shortDesc || 'No description available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 uppercase">
                              {brand}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium ml-1">
                              {category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end gap-2">
                            {loadingPrices.includes(product.skuId || product.itemNumber || product.productId) ? (
                                <div className="flex items-center gap-2 text-primary-600 font-medium text-xs">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Updating price...</span>
                                </div>
                            ) : price > 0 ? (
                              <span className="text-sm font-black text-gray-900 dark:text-white">
                                ${price.toFixed(2)} <span className="text-[10px] font-normal text-gray-500">/ {uom}</span>
                              </span>
                            ) : (
                                <span className="text-xs text-gray-400 font-medium italic">Login for price</span>
                            )}
                            
                            {(() => {
                               const itemInCart = cart.find(item => item.itemNumber === (product.itemNumber || product.productId));
                               return itemInCart ? (
                                 <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 border border-gray-200 dark:border-gray-600">
                                   <button 
                                     onClick={() => handleUpdateQuantity(itemInCart.itemNumber, itemInCart.quantity - 1)}
                                     className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all shadow-sm"
                                   >
                                     <Minus className="h-3.5 w-3.5" />
                                   </button>
                                   <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">{itemInCart.quantity}</span>
                                   <button 
                                     onClick={() => handleUpdateQuantity(itemInCart.itemNumber, itemInCart.quantity + 1)}
                                     className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-500 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all shadow-sm"
                                   >
                                     <Plus className="h-3.5 w-3.5" />
                                   </button>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => handleAddToCart(product)}
                                   className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all active:scale-95"
                                 >
                                   <Plus className="h-3.5 w-3.5 mr-1" />
                                   Add
                                 </button>
                               );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 m-8">
              <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search query or broadening the keywords.</p>
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 m-8">
              <Search className="mx-auto h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Search Catalog</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">Enter a keyword, product name, or SKU to search Beacon Pro+ inventory.</p>
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
        supplier="QXO"
      />
    </div>
  );
}
