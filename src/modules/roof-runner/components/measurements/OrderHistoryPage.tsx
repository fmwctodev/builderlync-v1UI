import React, { useState, useCallback } from 'react';
import { Search, Package, Plus, ArrowUpRight, Eye, RefreshCw, Filter, MapPin, Download } from 'lucide-react';
import type { MeasurementOrder, OrderStatus, ProductId } from '../../types/measurementOrder';
import { PRODUCT_DISPLAY_NAMES } from '../../types/measurementOrder';
import { isOrderUpgradeEligible } from '../../utils/upgradeEligibility';
import { useOrderHistory } from '../../hooks/useOrderHistory';
import { useCurrentOrganizationSafe } from '../../../../shared/context/OrgContext';
import { downloadPdf } from '../../services/orderDownloadService';
import { OrderStatusPill } from './OrderStatusPill';
import { OrderSourceBadge } from './OrderSourceBadge';
import UpgradeConfirmationModal from './UpgradeConfirmationModal';

interface OrderHistoryPageProps {
  onBack?: () => void;
  onPlaceNewOrder: () => void;
  onUpgradeOrder: (order: MeasurementOrder) => void;
  onViewOrder?: (orderId: string) => void;
}

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRODUCT_OPTIONS: { value: ProductId | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'measure_bidperfect', label: 'BidPerfect' },
  { value: 'measure_full_house', label: 'Full House' },
  { value: 'measure_premium', label: 'Premium' },
  { value: 'property_roof_area_estimate', label: 'Property Data' },
  { value: 'solar_solar_report', label: 'Solar Report' },
];

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({
  onBack,
  onPlaceNewOrder,
  onUpgradeOrder,
  onViewOrder,
}) => {
  const { currentOrganizationId } = useCurrentOrganizationSafe();
  const {
    orders,
    isLoading,
    error,
    filters,
    setStatusFilter,
    setProductFilter,
    setSearchFilter,
    refresh,
  } = useOrderHistory(currentOrganizationId);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedOrderForUpgrade, setSelectedOrderForUpgrade] = useState<MeasurementOrder | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value);
  }, [setSearchFilter]);

  const handleUpgradeClick = (order: MeasurementOrder) => {
    setSelectedOrderForUpgrade(order);
    setUpgradeModalOpen(true);
  };

  const handleUpgradeConfirm = () => {
    if (selectedOrderForUpgrade) {
      onUpgradeOrder(selectedOrderForUpgrade);
    }
    setUpgradeModalOpen(false);
    setSelectedOrderForUpgrade(null);
  };

  const handleUpgradeCancel = () => {
    setUpgradeModalOpen(false);
    setSelectedOrderForUpgrade(null);
  };

  const handlePdfDownload = async (order: MeasurementOrder) => {
    await downloadPdf(order.outputs.pdfUrl, order.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOrderCard = (order: MeasurementOrder) => {
    const createdDate = formatDateShort(order.datePlaced);
    const completedDate = formatDateShort(order.dateCompleted);

    const roofArea = order.outputs?.totalArea || order.outputs?.roof_area;
    const perimeter = order.outputs?.perimeter;
    const primaryPitch = order.outputs?.primaryPitch || order.outputs?.primary_pitch;
    const facets = order.outputs?.facets || order.outputs?.facet_count;

    return (
      <div
        key={order.id}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {order.orderNumber}
            </h3>
            <OrderStatusPill status={order.status} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            {onViewOrder && (
              <button
                onClick={() => onViewOrder(order.id)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="View details"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handlePdfDownload(order)}
              disabled={!order.outputs?.pdfUrl}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={order.outputs?.pdfUrl ? "Download PDF" : "PDF not available"}
            >
              <Download className="w-5 h-5" />
            </button>
            {isOrderUpgradeEligible(order) && (
              <button
                onClick={() => handleUpgradeClick(order)}
                className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                title="Upgrade to Premium"
              >
                <ArrowUpRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{order.address}</span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {order.productName}
          {createdDate && <span> &bull; Created: {createdDate}</span>}
          {completedDate && <span> &bull; Completed: {completedDate}</span>}
        </p>

        {(roofArea || perimeter || primaryPitch || facets) && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {roofArea && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Roof Area</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {typeof roofArea === 'number' ? roofArea.toLocaleString() : roofArea} sq ft
                    </p>
                  </div>
                )}
                {perimeter && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Perimeter</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {typeof perimeter === 'number' ? perimeter.toLocaleString() : perimeter} ft
                    </p>
                  </div>
                )}
                {primaryPitch && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Primary Pitch</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {primaryPitch}
                    </p>
                  </div>
                )}
                {facets && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Facets</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {facets}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-600 dark:bg-primary-700 rounded-lg p-6 text-white">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Order History</h1>
          <p className="text-primary-100">View and track your measurement orders</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by address..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full bg-primary-700 border border-primary-500 rounded-lg text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-200" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden inline-flex items-center gap-2 px-3 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className={`flex flex-col sm:flex-row gap-2 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-3 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.product || 'all'}
              onChange={(e) => setProductFilter(e.target.value as ProductId | 'all')}
              className="px-3 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
            >
              {PRODUCT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary-700 border border-primary-500 rounded-lg text-white hover:bg-primary-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onPlaceNewOrder}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error}
          </p>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-gray-700 dark:text-gray-300">
          {isLoading ? 'Loading orders...' : `Showing ${orders.length} orders`}
          {filters.search && (
            <span className="text-sm font-normal ml-2">
              (filtered by: "{filters.search}")
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        renderLoadingSkeleton()
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => renderOrderCard(order))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filters.search || filters.status !== 'all' || filters.product !== 'all'
              ? 'No orders found'
              : 'No orders yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filters.search
              ? `No orders match your search for "${filters.search}"`
              : filters.status !== 'all' || filters.product !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't placed any measurement orders yet."
            }
          </p>
          <button
            onClick={onPlaceNewOrder}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Place Your First Order
          </button>
        </div>
      )}

      <UpgradeConfirmationModal
        isOpen={upgradeModalOpen}
        onConfirm={handleUpgradeConfirm}
        onCancel={handleUpgradeCancel}
        orderNumber={selectedOrderForUpgrade?.orderNumber || ''}
        addressText={selectedOrderForUpgrade?.address || ''}
      />
    </div>
  );
};

export default OrderHistoryPage;
