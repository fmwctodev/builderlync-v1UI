import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, ChevronDown, Search } from 'lucide-react';
import { Product } from '../../abc-supply/types';
import { abcSupplyApi } from '../../abc-supply/services/api';
import { srsApi } from '../services/srsApi';
import CheckoutForm, { CheckoutFormData } from '../../abc-supply/components/CheckoutForm';

interface CartItem extends Product {
  quantity: number;
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
  const [branches, setBranches] = useState([]);
  const [shipTos, setShipTos] = useState([]);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
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
          const response = await fetch('https://builderlyncapi.testenvapp.com/api/abc-supply/accounts/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              filters: [{
                key: "storefront",
                condition: "equals",
                values: ["abc"]
              }],
              pagination: {
                itemsPerPage: 20,
                pageNumber: 1
              }
            })
          });
          const data = await response.json();
          if (data.success && data.data?.shipTos) {
            const sellableShipTos = data.data.shipTos.filter(item => item.isSellable === true);
            setShipTos(sellableShipTos);
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
      if (selectedShipTo?.branches?.[0]) {
        fetchPrices(selectedBranch, selectedShipTo.branches[0].number);
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
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

          {/* Branch and Shipping Selection */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
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
                    if (newBranch && items.length > 0) {
                      const selectedShipTo = shipTos.find(shipTo => shipTo.number === newBranch);
                      if (selectedShipTo?.branches?.[0]) {
                        fetchPrices(newBranch, selectedShipTo.branches[0].number);
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
                  onChange={(e) => setShipTo({...shipTo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={shipTo.addressLine1}
                  onChange={(e) => setShipTo({...shipTo, addressLine1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={shipTo.city}
                    onChange={(e) => setShipTo({...shipTo, city: e.target.value})}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shipTo.state}
                    onChange={(e) => setShipTo({...shipTo, state: e.target.value})}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={shipTo.zipCode}
                  onChange={(e) => setShipTo({...shipTo, zipCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.itemNumber}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.familyName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Item #: {item.itemNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.supplierName}
                        </p>
                        {item.color?.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Color: {item.color.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          UOM: {item.uoms?.[0]?.code || 'EA'}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.itemNumber)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>

                    {/* Variants Dropdown */}
                    {item.familyItems && item.familyItems.length > 1 && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Variant:
                        </label>
                        <div className="relative">
                          <select
                            value={item.itemNumber}
                            onChange={(e) => {
                              const selectedVariant = item.familyItems.find(v => v.itemNumber === e.target.value);
                              if (selectedVariant) {
                                handleVariantChange(item, selectedVariant);
                              }
                            }}
                            className="w-full px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 appearance-none pr-8"
                          >
                            {item.familyItems.map((variant) => (
                              <option key={variant.itemNumber} value={variant.itemNumber}>
                                {variant.color ? `${variant.color} - ${variant.itemNumber}` : variant.itemNumber}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.itemNumber, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.itemNumber, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const price = getItemPrice(item.itemNumber);
                          return price > 0 ? (
                            <>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                ${(price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ${price.toFixed(2)} each
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Call Store</p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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
      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onSubmit={handleCheckoutSubmit}
        loading={loading}
        selectedShipTos={selectedBranch ? [selectedBranch] : []}
        shipTos={shipTos}
      />
    </div>
  );
};

export default ShoppingCartComponent;