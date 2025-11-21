import React, { useState } from 'react';
import { Ruler, Plus, History, FileText } from 'lucide-react';
import PlaceOrderPage from '../components/measurements/PlaceOrderPage';
import OrderSummaryPage from '../components/measurements/OrderSummaryPage';
import OrderHistoryPage from '../components/measurements/OrderHistoryPage';

type ViewType = 'dashboard' | 'place-order' | 'order-summary' | 'order-history';

interface OrderData {
  address: string;
  propertyType: string;
  isComplex: boolean;
  buildingId: string;
  measurementInstructions: string;
  selectedProducts: Record<string, boolean>;
  totalCost: number;
}

const Measurements = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const handlePlaceOrder = () => {
    setCurrentView('place-order');
  };

  const handleOrderComplete = (data: OrderData) => {
    setOrderData(data);
    setCurrentView('order-summary');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setOrderData(null);
  };

  const handleViewHistory = () => {
    setCurrentView('order-history');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'place-order':
        return (
          <PlaceOrderPage 
            onOrderComplete={handleOrderComplete}
            onBack={handleBackToDashboard}
          />
        );
      case 'order-summary':
        return (
          <OrderSummaryPage 
            orderData={orderData!}
            onBack={() => setCurrentView('place-order')}
            onComplete={handleBackToDashboard}
          />
        );
      case 'order-history':
        return (
          <OrderHistoryPage 
            onBack={handleBackToDashboard}
            onPlaceNewOrder={handlePlaceOrder}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Measurements</h1>
              <div className="flex gap-2">
                <button
                  onClick={handlePlaceOrder}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  Start New Order
                </button>
                <button
                  onClick={handleViewHistory}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <History className="w-4 h-4" />
                  Order History
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Place New Order Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handlePlaceOrder}>
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg mb-4">
                  <Plus className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Place Measurement Order</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Order professional property measurements and reports</p>
              </div>

              {/* Order History Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewHistory}>
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mb-4">
                  <History className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order History</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">View and track your measurement orders</p>
              </div>

              {/* Manual Measurements Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-purple-900/20 rounded-lg mb-4">
                  <Ruler className="w-6 h-6 text-primary-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manual Measurements</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Record and manage manual measurements</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">No recent orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderContent();
};

export default Measurements;