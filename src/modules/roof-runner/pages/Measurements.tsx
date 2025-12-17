import React, { useState } from 'react';
import { Ruler, Plus, History, FileText, Camera, Pencil } from 'lucide-react';
import PlaceOrderPage from '../components/measurements/PlaceOrderPage';
import OrderSummaryPage from '../components/measurements/OrderSummaryPage';
import OrderHistoryPage from '../components/measurements/OrderHistoryPage';
import EagleViewMeasurement from '../components/measurements/EagleViewMeasurement';

type ViewType = 'dashboard' | 'place-order' | 'order-summary' | 'order-history' | 'eagleview';

interface OrderData {
  address: string;
  propertyType: string;
  isComplex: boolean;
  buildingId: string;
  measurementInstructions: string;
  selectedProducts: Record<string, boolean>;
  totalCost: number;
}

interface BusinessInfo {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function Measurements() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: 'Sitehues Media Inc',
    address: '486 Lake Cir',
    city: 'Plant City',
    state: 'FL',
    zipCode: '33565'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleOrderComplete = (data: OrderData) => {
    setOrderData(data);
    setActiveTab('order-summary');
  };

  const handleSaveBusinessInfo = (newInfo: BusinessInfo) => {
    setBusinessInfo(newInfo);
    setIsEditing(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-primary-600 h-20 rounded-lg">
        <div className="px-6 pt-5">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
      </div>

      <div className="-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isEditing ? (
            <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={businessInfo.companyName}
                    onChange={(e) => setBusinessInfo({...businessInfo, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <input
                    type="text"
                    value={businessInfo.city}
                    onChange={(e) => setBusinessInfo({...businessInfo, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                  <input
                    type="text"
                    value={businessInfo.state}
                    onChange={(e) => setBusinessInfo({...businessInfo, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={businessInfo.zipCode}
                    onChange={(e) => setBusinessInfo({...businessInfo, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveBusinessInfo(businessInfo)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{businessInfo.companyName}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{businessInfo.address}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
                  </p>
                </div>
                <button
                  className="text-primary-600 hover:text-primary-700"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total order</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order pending</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. report cost</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">2025 Year To Date</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reports Completed</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prepayments</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">$ 0.00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You have no recent orders at this time</p>
            <button 
              onClick={() => setActiveTab('Order')}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus size={16} className="inline mr-2" />
              Start New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('Dashboard')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'Dashboard'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('Order History')}
                className={`flex items-center text-sm font-medium transition-colors ${
                  activeTab === 'Order History'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <History className="inline-block mr-1" size={16} />
                Order History
              </button>
              <button
                onClick={() => setActiveTab('EagleView')}
                className={`flex items-center text-sm font-medium transition-colors ${
                  activeTab === 'EagleView'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Camera className="inline-block mr-1" size={16} />
                EagleView
              </button>
              <button
                onClick={() => setActiveTab('Order')}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                  activeTab === 'Order'
                    ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Order History' && (
        <OrderHistoryPage 
          onBack={() => setActiveTab('Dashboard')}
          onPlaceNewOrder={() => setActiveTab('Order')}
        />
      )}
      {activeTab === 'Order' && (
        <PlaceOrderPage 
          onOrderComplete={handleOrderComplete}
          onBack={() => setActiveTab('Dashboard')}
        />
      )}
      {activeTab === 'EagleView' && (
        <EagleViewMeasurement />
      )}
      {activeTab === 'order-summary' && orderData && (
        <OrderSummaryPage 
          orderData={orderData}
          onBack={() => setActiveTab('Order')}
          onComplete={() => setActiveTab('Dashboard')}
        />
      )}
    </div>
  );
}