import React from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Building2,
  FileText,
  Printer,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { ABCSupplyOrder, ABCSupplyOrderStatus } from '../../services/abcSupplyApi';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ABCSupplyOrder | null;
}

const statusConfig: Record<ABCSupplyOrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    icon: <Clock className="h-4 w-4" />,
  },
  processing: {
    label: 'Processing',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: <Package className="h-4 w-4" />,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="h-4 w-4" />,
  },
};

const statusSteps: ABCSupplyOrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const status = statusConfig[order.status];
  const currentStepIndex = statusSteps.indexOf(order.status);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'delivery': return 'Delivery';
      case 'pickup': return 'Will Call / Pickup';
      case 'will_call': return 'Will Call';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-paper dark:bg-canvas">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.confirmationNumber && `Confirmation: ${order.confirmationNumber}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}>
              {status.icon}
              {status.label}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {order.status !== 'cancelled' && (
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Order Progress</h3>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const stepConfig = statusConfig[step];
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center transition ${
                            isCompleted
                              ? isCurrent
                                ? `${stepConfig.bgColor} ${stepConfig.color}`
                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            stepConfig.icon
                          )}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${
                          isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {stepConfig.label}
                        </span>
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          index < currentStepIndex
                            ? 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {order.trackingNumber && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Tracking Number</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{order.trackingNumber}</p>
                  </div>
                </div>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                  >
                    Track Package
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Order Items</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-paper dark:bg-canvas">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.itemNumber} {item.manufacturer && `| ${item.manufacturer}`}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                        {item.quantity} {item.uom}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-paper dark:bg-canvas">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">Subtotal</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-400">Tax</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">{formatCurrency(order.tax)}</td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total</td>
                    <td className="px-4 py-3 text-right text-base font-bold text-primary-600 dark:text-primary-400">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {order.deliveryMethod === 'pickup' || order.deliveryMethod === 'will_call' ? 'Pickup Location' : 'Delivery Address'}
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">{getDeliveryMethodLabel(order.deliveryMethod)}</p>
                {order.deliveryMethod === 'delivery' && order.deliveryAddress ? (
                  <>
                    <p>{order.deliveryAddress.line1}</p>
                    {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                  </>
                ) : (
                  <>
                    <p>{order.branchName}</p>
                    {order.branchAddress && <p>{order.branchAddress}</p>}
                  </>
                )}
                {order.deliveryContact && (
                  <p className="mt-2">
                    <span className="text-gray-500">Contact:</span> {order.deliveryContact.name} - {order.deliveryContact.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch Information</h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">{order.branchName}</p>
                <p>Branch #{order.branchNumber}</p>
                {order.branchAddress && <p>{order.branchAddress}</p>}
                {order.branchPhone && (
                  <p className="flex items-center gap-1.5 mt-2">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${order.branchPhone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                      {order.branchPhone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
            </div>
            <div className="bg-paper dark:bg-canvas rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {order.status === 'delivered' ? 'Delivered On' : 'Est. Delivery'}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(order.actualDeliveryDate || order.estimatedDeliveryDate)}
              </p>
            </div>
            {order.poNumber && (
              <div className="bg-paper dark:bg-canvas rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PO Number</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.poNumber}</p>
              </div>
            )}
          </div>

          {order.specialInstructions && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Special Instructions</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-paper dark:bg-canvas">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Account: {order.accountName || order.accountNumber}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
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
