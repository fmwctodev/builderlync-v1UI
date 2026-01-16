import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Header from '../components/Header.tsx';
import { eagleViewService } from '../../roof-runner/services/eagleViewService';
import { profileService } from '../../../shared/services/profileService';

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

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedYTD: 0,
    balance: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Starting dashboard data fetch...');

        // Fetch Profile Data
        try {
          const profile = await profileService.getUserProfile();
          console.log('Profile Data Fetched:', profile);

          if (profile) {
            setBusinessInfo(prev => ({
              companyName: profile.company_name || profile.companyName || profile.organization || prev.companyName,
              address: profile.address || prev.address,
              city: profile.city || prev.city,
              state: profile.state || prev.state,
              zipCode: profile.zip_code || profile.zipCode || prev.zipCode
            }));
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
        }

        // Fetch EagleView Data
        const [ordersResponse, statusResponse] = await Promise.all([
          eagleViewService.getReports(),
          eagleViewService.getConnectionStatus()
        ]);

        console.log('Raw Orders Response:', ordersResponse);
        console.log('Raw Status Response:', statusResponse);

        // Handle potentially wrapped orders data
        const orders = Array.isArray(ordersResponse)
          ? ordersResponse
          : (ordersResponse as any).data || (ordersResponse as any).items || [];

        console.log('Processed Orders Array:', orders);

        // Process orders for stats
        const currentYear = new Date().getFullYear();
        let pending = 0;
        let completedThisYear = 0;

        orders.forEach((order: any) => {
          // Status check
          if (order.status !== 'completed' && order.status !== 'delivered' && order.status !== 'failed') {
            pending++;
          }

          // Year check
          if ((order.status === 'completed' || order.status === 'delivered')) {
            if (order.created_at) {
              const orderYear = new Date(order.created_at).getFullYear();
              if (orderYear === currentYear) {
                completedThisYear++;
              }
            } else {
              completedThisYear++;
            }
          }
        });

        // Check if status is wrapped in data object
        const connectionData = (statusResponse as any).data || statusResponse;
        console.log('Processed Connection Data:', connectionData);

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          completedYTD: completedThisYear,
          balance: connectionData.credits || 0
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary-600 h-48">
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
                <button className="text-primary-600 hover:text-primary-700">
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
                  <p className="text-xl font-semibold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order pending</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. report cost</p>
                  <p className="text-xl font-semibold text-gray-900">$ 0.00</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">{new Date().getFullYear()} Year To Date</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Reports Completed</p>
                    <p className="text-xl font-semibold text-gray-900">{stats.completedYTD}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prepayments</p>
                    <p className="text-xl font-semibold text-gray-900">$ 0.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-xl font-semibold text-gray-900">$ {stats.balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <p className="text-gray-600 mb-6">You have {stats.totalOrders} order(s) placed.</p>
              <button
                onClick={() => navigate('/roof-runner/measurements/place-order')}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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