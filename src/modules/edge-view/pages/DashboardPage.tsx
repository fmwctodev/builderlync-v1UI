import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Header from '../components/Header';

interface BusinessInfo {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: 'Sitehues Media Inc',
    address: '486 Lake Cir',
    city: 'Plant City',
    state: 'FL',
    zipCode: '33565'
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-blue-600 h-48">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Company Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{businessInfo.companyName}</h2>
                  <p className="text-gray-600">{businessInfo.address}</p>
                  <p className="text-gray-600">
                    {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  <Pencil className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Account Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total order</p>
                  <p className="text-xl font-semibold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order pending</p>
                  <p className="text-xl font-semibold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. report cost</p>
                  <p className="text-xl font-semibold text-gray-900">$ 0.00</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">2025 Year To Date</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Reports Completed</p>
                    <p className="text-xl font-semibold text-gray-900">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prepayments</p>
                    <p className="text-xl font-semibold text-gray-900">$ 0.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-xl font-semibold text-gray-900">$ 0.00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <p className="text-gray-600 mb-6">You have no recent orders at this time</p>
              <button
                onClick={() => navigate('/edge-view')}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;