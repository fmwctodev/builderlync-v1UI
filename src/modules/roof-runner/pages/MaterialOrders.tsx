import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, MoreVertical, X, MapPin, Phone, Mail } from 'lucide-react';
import ABCSupplyView from '../components/ABCSupplyView';

export default function MaterialOrders() {
  const [activeTab, setActiveTab] = useState('ABC Supply');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showSupplierFilter, setShowSupplierFilter] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const orders = [
    {
      id: '001',
      status: 'Sent',
      poNumber: 'PO-2024-001',
      jobAddress: '123 Main St, Austin, TX',
      supplier: 'ABC Supply',
      totalAmount: '$2,450.00',
      orderNumber: 'ORD-001'
    },
    {
      id: '002',
      status: 'Confirmed',
      poNumber: 'PO-2024-002',
      jobAddress: '456 Oak Ave, Austin, TX',
      supplier: 'Home Depot',
      totalAmount: '$1,875.50',
      orderNumber: 'ORD-002'
    },
    {
      id: '003',
      status: 'Draft',
      poNumber: 'PO-2024-003',
      jobAddress: '789 Pine St, Austin, TX',
      supplier: 'SRS',
      totalAmount: '$3,200.75',
      orderNumber: 'ORD-003'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'Ready to send': return 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
      case 'Sent': return 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300';
      case 'Confirmed': return 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300';
      case 'Rejected': return 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300';
      case 'Delivered': return 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Material Orders</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Material Orders</h1>
        </div>

        <button 
          onClick={() => {
            // Trigger navigation to products view in ABCSupplyView
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('view', 'products');
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
            window.location.reload();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          <Plus size={16} />
          <span>Create Material Order</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">


        <div className="p-6">
          <ABCSupplyView />
        </div>
          {/* <>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusFilter(!showStatusFilter)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Filter size={16} />
                      {statusFilter}
                    </button>
                    {showStatusFilter && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-1">
                          {['All Status', 'Draft', 'Ready to send', 'Sent', 'Confirmed', 'Rejected', 'Delivered'].map((status) => (
                            <button
                              key={status}
                              onClick={() => { setStatusFilter(status); setShowStatusFilter(false); }}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                statusFilter === status ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowSupplierFilter(!showSupplierFilter)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Filter size={16} />
                      {supplierFilter}
                    </button>
                    {showSupplierFilter && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-1">
                          {['All Suppliers', 'SRS', 'Home Depot', 'ABC Supply', 'Beacon', 'ABC'].map((supplier) => (
                            <button
                              key={supplier}
                              onClick={() => { setSupplierFilter(supplier); setShowSupplierFilter(false); }}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                supplierFilter === supplier ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {supplier}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.poNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {order.jobAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {order.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                            <Eye size={16} />
                            View
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MoreVertical size={16} className="text-gray-400" />
                            </button>
                            {openDropdown === order.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                <div className="py-1">
                                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Duplicate</button>
                                  <button className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </> */}

      </div>


    </div>
  );
}