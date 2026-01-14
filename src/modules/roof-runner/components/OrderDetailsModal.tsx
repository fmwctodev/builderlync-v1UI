import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, FileText, X, MapPin, Printer, ShoppingBag } from 'lucide-react';
import { abcSupplyApi } from '../../abc-supply/services/api';

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order: initialOrder, onClose }) => {
    const [orderDetails, setOrderDetails] = useState<any>(initialOrder);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                if (initialOrder.orderNumber) {
                    // Determine if we need to fetch details. 
                    // If the initialOrder doesn't have 'lines' or 'items', we probably need to fetch.
                    // For now, let's always fetch to be safe and ensure fresh data.
                    // Note: API might reject if orderNumber is not a valid ID format, 
                    // but we'll assume orderNumber is the ID.
                    const details = await abcSupplyApi.getOrderById(initialOrder.orderNumber);
                    setOrderDetails({ ...initialOrder, ...details });
                }
            } catch (error) {
                console.error('Failed to load order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [initialOrder]);

    const steps = [
        { id: 'pending', label: 'Pending', icon: FileText },
        { id: 'processing', label: 'Processing', icon: Package },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === (orderDetails.orderStatus?.toLowerCase() || 'processing'));
    const isStepComplete = (index: number) => index <= (currentStepIndex === -1 ? 1 : currentStepIndex);

    // Map API lines to display format if available, else use placeholder or empty
    const orderItems = orderDetails.lines ? orderDetails.lines.map((line: any) => ({
        name: line.itemDescription || line.description || 'Item',
        desc: line.itemNumber || line.productCode || '',
        qty: `${line.orderedQty?.value || line.quantity || 0} ${line.orderedQty?.uom || line.uom || ''}`,
        price: line.unitPrice?.value || line.price || 0,
        total: (line.unitPrice?.value || line.price || 0) * (line.orderedQty?.value || line.quantity || 0)
    })) : [];

    // Calculate totals if not provided
    const subtotal = orderItems.reduce((acc: number, item: any) => acc + item.total, 0);
    const tax = subtotal * 0.0825; // Estimated tax if not provided
    const total = subtotal + tax;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-[#D71920]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order #{orderDetails.orderNumber || orderDetails.id || '---'}</h2>
                            <p className="text-gray-500 text-sm">Confirmation: {orderDetails.confirmationNumber || orderDetails.orderNumber || '---'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                            <Package className="h-3 w-3" /> {orderDetails.orderStatus || 'Processing'}
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Progress Bar */}
                    <div className="w-full py-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-6">Order Progress</h3>
                        <div className="relative flex justify-between items-center px-4 md:px-12">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0" />
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-0"
                                style={{ width: `${((currentStepIndex === -1 ? 1 : currentStepIndex) / (steps.length - 1)) * 100}%` }} />

                            {steps.map((step, index) => {
                                const active = isStepComplete(index);
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center bg-white dark:bg-gray-800 px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${active ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                                            }`}>
                                            {active ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Items</h3>
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">Loading details...</div>
                        ) : orderItems.length > 0 ? (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ITEM</th>
                                            <th className="px-4 py-3 text-center">QTY</th>
                                            <th className="px-4 py-3 text-right">UNIT PRICE</th>
                                            <th className="px-4 py-3 text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                        {orderItems.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">{item.qty}</td>
                                                <td className="px-4 py-3 text-right">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</td>
                                                <td className="px-4 py-3 text-right font-medium">${typeof item.total === 'number' ? item.total.toFixed(2) : item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/30">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Subtotal</td>
                                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${subtotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Tax (Est.)</td>
                                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">${tax.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white text-lg">Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-[#D71920] text-lg">${total.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-lg">No line items found.</div>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                <MapPin className="h-4 w-4 text-gray-500" /> Delivery Address
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                                <p className="font-medium text-gray-900 dark:text-white">Delivery</p>
                                <p>{orderDetails.shipTo?.address?.line1 || orderDetails.deliveryAddress?.line1 || '5678 Construction Way'}</p>
                                <p>{orderDetails.shipTo?.address?.city || orderDetails.deliveryAddress?.city || 'Austin'}, {orderDetails.shipTo?.address?.state || orderDetails.deliveryAddress?.state || 'TX'} {orderDetails.shipTo?.address?.postal || orderDetails.deliveryAddress?.postal || '78702'}</p>
                                <p className="text-gray-500 mt-2">Contact: {orderDetails.shipTo?.contacts?.[0]?.name || orderDetails.contact?.name || 'John Smith'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                <ShoppingBag className="h-4 w-4 text-gray-500" /> Branch Information
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                                {/* Logic to show branch info if available in order details */}
                                <p className="font-medium text-gray-900 dark:text-white">Branch #{orderDetails.branchNumber || orderDetails.branch || '---'}</p>
                                <p className="text-gray-500">{orderDetails.branchCityState || 'Branch Details Unavailable'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Order Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {orderDetails.invoiceDate ? new Date(orderDetails.invoiceDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '---'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Est. Delivery</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {orderDetails.dates?.deliveryRequestedFor || '---'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">PO Number</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {orderDetails.purchaseOrder || orderDetails.orderNumber || '---'}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                    <div className="text-sm text-gray-500">
                        Account: Main Ship-To Account
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors">
                            <Printer className="h-4 w-4" /> Print
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#D71920] text-white rounded-md hover:bg-[#B01216] text-sm font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailsModal;
