import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, ChevronDown, Search, Building } from 'lucide-react';
import { Product, ShipTo } from '../../abc-supply/types';
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
    const [selectedShipTo, setSelectedShipTo] = useState<ShipTo | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<any | null>(null); // { id, number, name }

    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [itemPrices, setItemPrices] = useState<Record<string, number>>({});

    const [shipToAddress, setShipToAddress] = useState({
        name: '',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: ''
    });

    useEffect(() => {
        if (isOpen && supplier === 'ABC Supply') {
            const savedShipTo = localStorage.getItem('abc_selected_shipto');
            const savedBranch = localStorage.getItem('abc_selected_branch');

            if (savedShipTo) {
                try {
                    const parsedShipTo = JSON.parse(savedShipTo);
                    setSelectedShipTo(parsedShipTo);

                    // Pre-fill shipping address from account/branch if possible?
                    // Usually we want the job site address.
                } catch (e) { console.error(e); }
            }

            if (savedBranch) {
                try {
                    const parsedBranch = JSON.parse(savedBranch);
                    setSelectedBranch(parsedBranch);
                    // Fetch prices immediately
                    if (savedShipTo && items.length > 0) {
                        const parsedShipTo = JSON.parse(savedShipTo);
                        fetchPrices(parsedShipTo.number, parsedBranch.number);
                    }
                } catch (e) { console.error(e); }
            }
        }
    }, [isOpen, supplier, items.length]); // Added dependency on items length to refresh prices if items change? Or separate effect?

    // Effect to refresh prices when items change if we have branch/shipto
    useEffect(() => {
        if (isOpen && supplier === 'ABC Supply' && selectedShipTo && selectedBranch && items.length > 0) {
            fetchPrices(selectedShipTo.number, selectedBranch.number);
        }
    }, [items, selectedShipTo, selectedBranch, isOpen]);


    const fetchPrices = async (shipToNumber: string, branchNumber: string) => {
        if (!items.length || !shipToNumber || !branchNumber) return;

        try {
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

            const data = await abcSupplyApi.getPrices(requestBody);

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
        setShowCheckoutForm(true);
    };

    const handleCheckoutSubmit = async (checkoutData: CheckoutFormData) => {
        if (items.length === 0) return;
        if (!selectedBranch) {
            alert("Please select a branch first.");
            return;
        }

        if (!selectedShipTo || !selectedShipTo.address) {
            alert("No valid Ship-To account selected. Please select an account with a valid address.");
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                items: items.map(item => ({
                    productId: item.itemNumber,
                    sku: item.itemNumber,
                    name: item.familyName || `Product ${item.itemNumber}`,
                    quantity: item.quantity,
                    unitPrice: item.price || getItemPrice(item.itemNumber) || 0,
                    uom: item.uoms?.[0]?.code || 'EA'
                })),
                branchNumber: selectedBranch.number,
                shipToAccountNumber: selectedShipTo.number, // Pass shipTo if API supports/needs it
                deliveryAddress: {
                    name: selectedShipTo.name,
                    line1: selectedShipTo.address.line1 || "",
                    line2: selectedShipTo.address.line2 || "",
                    city: selectedShipTo.address.city || "",
                    state: selectedShipTo.address.state || "",
                    postal: selectedShipTo.address.postal || ""
                },
                contact: checkoutData.contact,
                deliveryDate: checkoutData.deliveryDate,
                instructions: checkoutData.instructions,
                deliveryService: checkoutData.deliveryService
            };

            // @ts-ignore
            const result = await abcSupplyApi.createOrder(orderData);

            setShowCheckoutForm(false);
            setOrderSuccess(true);
            onCheckout();
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

                            {/* Account/Branch Info */}
                            {supplier === 'ABC Supply' && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordering From:</div>
                                    {selectedShipTo ? (
                                        <div className="flex items-start gap-2 mb-2">
                                            <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedShipTo.name}</div>
                                                <div className="text-xs text-gray-500">Account #{selectedShipTo.number}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-red-500">No Account Selected</div>
                                    )}

                                    {selectedBranch ? (
                                        <div className="flex items-start gap-2">
                                            <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedBranch.name}</div>
                                                <div className="text-xs text-gray-500">Branch #{selectedBranch.number}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-red-500">No Branch Selected</div>
                                    )}
                                </div>
                            )}

                            {/* Shipping Address Inputs - Simplified for Cart view, full form in Checkout */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Shipping Preview
                                </label>
                                <input
                                    type="text"
                                    placeholder="Zip Code for Tax Est."
                                    value={shipToAddress.zipCode}
                                    onChange={(e) => setShipToAddress({ ...shipToAddress, zipCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                                />
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
                                                            </div>
                                                        </div>

                                                        {/* Controls */}
                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
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
                                disabled={!selectedBranch || items.length === 0}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Proceed to Checkout
                            </button>
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
            />
        </div>
    );
};

export default ShoppingCartComponent;