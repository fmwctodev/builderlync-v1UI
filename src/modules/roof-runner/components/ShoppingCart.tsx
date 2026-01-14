import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, ChevronDown, Search } from 'lucide-react';
import { Product } from '../../abc-supply/types';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { srsApi } from '../services/srsApi';
import CheckoutForm, { CheckoutFormData } from '../../abc-supply/components/CheckoutForm';

interface CartItem extends Product {
  quantity: number;
  price?: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onVariantChange?: (oldItemNumber: string, newVariant: any) => void;
  supplier?: string;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onVariantChange,
  supplier = 'ABC Supply'
}) => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [shipTos, setShipTos] = useState<any[]>([]);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [shipTo, setShipTo] = useState({
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Debounced search for SRS branches
  React.useEffect(() => {
    if (supplier === 'SRS' && branchSearch.length > 2) {
      setSearchLoading(true);
      const timeoutId = setTimeout(async () => {
        try {
          const response = await srsApi.getBranches(undefined, undefined, undefined, 1, 10, branchSearch);
          const srsData = response.data?.data || response.data || [];
          setSearchResults(srsData);
        } catch (error) {
          console.error('Failed to search SRS branches:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (branchSearch.length <= 2) {
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [branchSearch, supplier]);

  React.useEffect(() => {
    if (isOpen && supplier === 'ABC Supply') {
      const fetchShipTos = async () => {
        try {
          console.log('Fetching shipTos for ABC Supply...');
          const data = await abcSupplyApi.searchAccounts(
            [{
              key: "storefront",
              condition: "equals",
              values: ["abc"]
            }],
            {
              itemsPerPage: 20,
              pageNumber: 1
            }
          );

          console.log('ShipTos API response:', data);

          // Robust capability: Handle different response structures
          // searchAccounts usually returns { success: true, data: { shipTos: [...] } }
          // but could be flat { shipTos: [...] }
          const responseData = data.data || data;
          const rawShipTos = responseData.shipTos || [];

          if (Array.isArray(rawShipTos)) {
            // Filter if isSellable is present and explicitly true, or if distinct from false?
            // Safest is to include if isSellable is true OR undefined (if property missing)
            // The original code was strict: item.isSellable === true.
            const sellableShipTos = rawShipTos.filter((item: any) => item.isSellable !== false);
            console.log('Processed shipTos:', sellableShipTos);
            setShipTos(sellableShipTos);
          } else {
            console.warn('No shipTos array found in response:', data);
          }
        } catch (error) {
          console.error('Failed to load shipTos:', error);
        }
      };
      fetchShipTos();
    }
  }, [isOpen, supplier]);

  React.useEffect(() => {
    if (selectedBranch && items.length > 0) {
      const selectedShipTo = shipTos.find(shipTo => shipTo.number === selectedBranch);
      // Try multiple paths to find the branch number
      const branchNumber = selectedShipTo?.branches?.[0]?.number
        || selectedShipTo?.branch?.number
        || selectedShipTo?.branchNumber;

      if (branchNumber) {
        fetchPrices(selectedBranch, branchNumber);
      }
    }
  }, [selectedBranch, items, shipTos]);

  const fetchPrices = async (shipToNumber: string, branchNumber: string) => {
    if (!items.length || !shipToNumber || !branchNumber) return;

    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        requestId: `Quote: ${Date.now()}`,
        shipToNumber,
        branchNumber,
        purpose: 'ordering',
        lines: items.map((item, index) => ({
          id: (index + 1).toString(),
          itemNumber: item.itemNumber,
          quantity: item.quantity,
          uom: item.uoms?.[0]?.code || 'EA'
        }))
      };

      const response = await fetch('https://builderlyncapi.testenvapp.com/api/abc-supply/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success && data.data?.lines) {
        const prices: Record<string, number> = {};
        data.data.lines.forEach((line: any) => {
          prices[line.itemNumber] = line.unitPrice || 0;
        });
        setItemPrices(prices);
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
  };

  const handleVariantChange = (currentItem: CartItem, selectedVariant: any) => {
    if (onVariantChange) {
      onVariantChange(currentItem.itemNumber, selectedVariant);
    }
  };

  const handleProceedToCheckout = () => {
    console.log('Proceed to Checkout clicked from ShoppingCart');
    setShowCheckoutForm(true);
  };

  const handleCheckoutSubmit = async (checkoutData: CheckoutFormData) => {
    console.log('Checkout form submitted:', checkoutData);

    if (items.length === 0) return;

    try {
      setLoading(true);
      const orderData = {
        items: items.map(item => ({
          productId: item.itemNumber,
          sku: item.itemNumber,
          name: item.familyName || `Product ${item.itemNumber}`,
          quantity: item.quantity,
          unitPrice: item.price || 0,
          uom: item.uoms?.[0]?.code || 'EA'
        })),
        branchNumber: checkoutData.branchNumber,
        deliveryAddress: checkoutData.deliveryAddress,
        contact: checkoutData.contact,
        deliveryDate: checkoutData.deliveryDate,
        instructions: checkoutData.instructions
      };

      console.log('Calling API with order data:', orderData);
      const result = await abcSupplyApi.createOrder(orderData);
      console.log('API call successful:', result);

      setShowCheckoutForm(false);
      setOrderSuccess(true);
      onCheckout(); // This will clear the cart in parent component
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getItemPrice = (itemNumber: string) => {
    return itemPrices[itemNumber] || 0;
  };

  const subtotal = items.reduce((sum, item) => {
    const price = getItemPrice(item.itemNumber);
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shopping Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">

              {/* Branch and Shipping Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Branch
                  </label>
                  {supplier === 'SRS' ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search branches..."
                        value={branchSearch}
                        onChange={(e) => {
                          setBranchSearch(e.target.value);
                          setShowBranchSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => branchSearch && setShowBranchSuggestions(true)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                      {showBranchSuggestions && branchSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                          {searchLoading ? (
                            <div className="px-3 py-2 text-gray-500">Searching...</div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((branch) => (
                              <button
                                key={branch.id}
                                onClick={() => {
                                  setSelectedBranch(branch.id);
                                  setBranchSearch(`${branch.name} - ${branch.address?.city}, ${branch.address?.state}`);
                                  setShowBranchSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{branch.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {branch.address?.street}, {branch.address?.city}, {branch.address?.state} {branch.address?.zip}
                                </div>
                              </button>
                            ))
                          ) : branchSearch.length > 2 ? (
                            <div className="px-3 py-2 text-gray-500">No branches found</div>
                          ) : (
                            <div className="px-3 py-2 text-gray-500">Type at least 3 characters to search</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      value={selectedBranch}
                      onChange={(e) => {
                        const newBranch = e.target.value;
                        setSelectedBranch(newBranch);
                        console.log('User selected branch/shipTo:', newBranch);
                        if (newBranch && items.length > 0) {
                          const selectedShipTo = shipTos.find(shipTo => shipTo.number === newBranch);
                          // Try multiple paths to find the branch number
                          const branchNumber = selectedShipTo?.branches?.[0]?.number
                            || selectedShipTo?.branch?.number
                            || selectedShipTo?.branchNumber;

                          if (branchNumber) {
                            console.log('Fetching prices with branch:', branchNumber);
                            fetchPrices(newBranch, branchNumber);
                          } else {
                            console.warn('Could not determine branch number for shipTo:', selectedShipTo);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a branch...</option>
                      {shipTos.map((shipTo) => (
                        <option key={shipTo.number} value={shipTo.number}>
                          {shipTo.name} ({shipTo.number})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shipping Address
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={shipTo.name}
                      onChange={(e) => setShipTo({ ...shipTo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={shipTo.addressLine1}
                      onChange={(e) => setShipTo({ ...shipTo, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={shipTo.city}
                        onChange={(e) => setShipTo({ ...shipTo, city: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={shipTo.state}
                        onChange={(e) => setShipTo({ ...shipTo, state: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={shipTo.zipCode}
                      onChange={(e) => setShipTo({ ...shipTo, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {items.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700"></div>}

              {/* Cart Items */}
              <div>
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={`${item.itemNumber}-${index}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm transition-all hover:shadow-md">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                            {(item.productImageUrl || item.productVariants?.[0]?.variantImageURL) ? (
                              <img
                                src={item.productImageUrl || item.productVariants?.[0]?.variantImageURL}
                                alt={item.itemDescription || item.familyName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`${(item.productImageUrl || item.productVariants?.[0]?.variantImageURL) ? 'hidden' : ''} w-full h-full flex flex-col items-center justify-center text-gray-400`}>
                              <ShoppingCart className="w-6 h-6 mb-1 opacity-50" />
                              <span className="text-[10px] font-medium uppercase">No Img</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">

                            {/* Header */}
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
                                  {item.familyName || item.itemDescription || `Item ${item.itemNumber}`}
                                </h3>
                                <button
                                  onClick={() => onRemoveItem(item.itemNumber)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
                                  title="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>#{item.itemNumber}</span>
                                {item.supplierName && (
                                  <>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span>{item.supplierName}</span>
                                  </>
                                )}
                                {item.color?.name && (
                                  <>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span>{item.color.name}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Variant Selection (if applicable) */}
                            {item.familyItems && item.familyItems.length > 1 && (
                              <div className="mt-2">
                                <div className="relative">
                                  <select
                                    value={item.itemNumber}
                                    onChange={(e) => {
                                      const selectedVariant = item.familyItems?.find((v: Product) => v.itemNumber === e.target.value);
                                      if (selectedVariant) {
                                        handleVariantChange(item, selectedVariant);
                                      }
                                    }}
                                    className="w-full py-1 pl-2 pr-6 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
                                  >
                                    {item.familyItems.map((variant: Product) => (
                                      <option key={variant.itemNumber} value={variant.itemNumber}>
                                        {variant.color ? `${variant.color} - ${variant.itemNumber}` : variant.itemNumber}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-gray-500 pointer-events-none" />
                                </div>
                              </div>
                            )}

                            {/* Footer Controls */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">

                              {/* Quantity */}
                              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                                <button
                                  onClick={() => onUpdateQuantity(item.itemNumber, Math.max(1, item.quantity - 1))}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.itemNumber, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                {(() => {
                                  const price = getItemPrice(item.itemNumber);
                                  return price > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        ${(price * item.quantity).toFixed(2)}
                                      </span>
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        ${price.toFixed(2)} / {item.uoms?.[0]?.code || 'EA'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                                      Call for Price
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex-shrink-0 z-10">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (8%):</span>
                  <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={!selectedBranch || items.length === 0 || !shipTo.name || !shipTo.addressLine1 || !shipTo.city || !shipTo.state || !shipTo.zipCode}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Final pricing will be confirmed at checkout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {orderSuccess && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center max-w-sm mx-4">
            <ShoppingCart className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your order has been submitted and is being processed.</p>
            <button
              onClick={() => {
                setOrderSuccess(false);
                onClose();
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Checkout Form */}
      {/* Checkout Form */}
      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onSubmit={handleCheckoutSubmit}
        loading={loading}
        selectedShipTos={selectedBranch ? [selectedBranch] : []}
        shipTos={shipTos.map(s => {
          // Ensure every shipTo passed to checkout has a 'branches' array if we can infer one
          // This safeguards against API variations where 'branches' is missing but 'branch' or 'branchNumber' exists
          if (s.branches && s.branches.length > 0) return s;

          const inferredBranchNumber = s.branch?.number || s.branchNumber;
          if (inferredBranchNumber) {
            return {
              ...s,
              branches: [{
                number: inferredBranchNumber,
                name: s.branch?.name || s.branchName || s.name || `Branch ${inferredBranchNumber}`
              }]
            };
          }
          // Fallback: if no branch info at all, assume the ShipTo itself might be acting as the branch (rare but possible in some data models)
          // or just return as is (CheckoutForm usually filters these out)
          return s;
        })}
      />
    </div>
  );
};

export default ShoppingCartComponent;