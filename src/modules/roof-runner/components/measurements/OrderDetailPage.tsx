import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Hash, Home, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useOrderDetail } from '../../hooks/useOrderDetail';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { downloadPdf, downloadJson, downloadXml, hasJsonOutput, hasXmlOutput } from '../../services/orderDownloadService';
import { isOrderUpgradeEligible, getUpgradeEligibilityReason } from '../../utils/upgradeEligibility';
import { OrderStatusPill } from './OrderStatusPill';
import { OrderSourceBadge } from './OrderSourceBadge';
import { DownloadButton } from './DownloadButton';
import { UpgradeOrderBanner } from './UpgradeOrderBanner';
import UpgradeConfirmationModal from './UpgradeConfirmationModal';
import type { MeasurementOrder } from '../../types/measurementOrder';

interface OrderDetailPageProps {
  orderId: string;
  onBack: () => void;
  onUpgradeOrder: (order: MeasurementOrder) => void;
  onViewSourceOrder?: (orderId: string) => void;
}

export function OrderDetailPage({
  orderId,
  onBack,
  onUpgradeOrder,
  onViewSourceOrder,
}: OrderDetailPageProps) {
  const { order, isLoading, error, refresh } = useOrderDetail(orderId);
  const { jsonXmlDownloadsEnabled } = useFeatureFlags();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handlePdfDownload = async () => {
    if (!order) return;
    await downloadPdf(order.outputs.pdfUrl, order.id);
  };

  const handleJsonDownload = async () => {
    if (!order) return;
    await downloadJson(order.outputs.jsonUrl, order.outputs.jsonBody, order.id);
  };

  const handleXmlDownload = async () => {
    if (!order) return;
    await downloadXml(order.outputs.xmlUrl, order.outputs.xmlBody, order.id);
  };

  const handleUpgradeClick = () => {
    setUpgradeModalOpen(true);
  };

  const handleUpgradeConfirm = () => {
    if (order) {
      onUpgradeOrder(order);
    }
    setUpgradeModalOpen(false);
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72 mb-4" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Failed to load order
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Go Back
        </button>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
        {renderError()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        renderLoadingSkeleton()
      ) : order ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {order.productName}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{order.address}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusPill status={order.status} size="md" />
                  <OrderSourceBadge orderedVia={order.orderedVia} size="md" />
                </div>
              </div>
            </div>

            {order.metadata.isUpgradeOrder && order.metadata.upgradeFromOrderId && (
              <div className="mb-6">
                <UpgradeOrderBanner
                  upgradeFromOrderId={order.metadata.upgradeFromOrderId}
                  onViewSourceOrder={onViewSourceOrder}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(order.datePlaced)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatTime(order.datePlaced)}</p>
                </div>
              </div>
              {order.propertyType && (
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Property Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{order.propertyType}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center text-gray-400 font-bold">$</div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cost</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.cost > 0 ? `$${order.cost.toFixed(2)}` : 'Included'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Downloads
            </h2>
            <div className="flex flex-wrap gap-3">
              <DownloadButton
                type="pdf"
                onClick={handlePdfDownload}
                disabled={!order.outputs.pdfUrl}
                tooltipText="PDF report not yet available"
                variant="primary"
                size="md"
              />
              {jsonXmlDownloadsEnabled && (
                <>
                  <DownloadButton
                    type="json"
                    onClick={handleJsonDownload}
                    disabled={!hasJsonOutput(order.outputs.jsonUrl, order.outputs.jsonBody)}
                    tooltipText="JSON data not available"
                    size="md"
                  />
                  <DownloadButton
                    type="xml"
                    onClick={handleXmlDownload}
                    disabled={!hasXmlOutput(order.outputs.xmlUrl, order.outputs.xmlBody)}
                    tooltipText="XML data not available"
                    size="md"
                  />
                </>
              )}
            </div>
            {!order.outputs.pdfUrl && (order.status === 'pending' || order.status === 'processing') && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Your report is being processed. Downloads will be available once the order is complete.
              </p>
            )}
          </div>

          {isOrderUpgradeEligible(order) && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-1">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Get enhanced measurements with more detail and additional data points for this property.
                  </p>
                </div>
                <button
                  onClick={handleUpgradeClick}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 shadow-sm flex-shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Upgrade Order
                </button>
              </div>
            </div>
          )}

          {!isOrderUpgradeEligible(order) && order.productId === 'measure_bidperfect' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getUpgradeEligibilityReason(order)}
              </p>
            </div>
          )}

          <UpgradeConfirmationModal
            isOpen={upgradeModalOpen}
            onConfirm={handleUpgradeConfirm}
            onCancel={() => setUpgradeModalOpen(false)}
            orderNumber={order.orderNumber}
            addressText={order.address}
          />
        </>
      ) : (
        renderError()
      )}
    </div>
  );
}
