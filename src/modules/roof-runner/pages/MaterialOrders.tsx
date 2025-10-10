import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, MoreVertical, X, MapPin, Phone, Mail } from 'lucide-react';

export default function MaterialOrders() {
  const [activeTab, setActiveTab] = useState('Orders');
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
        
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
          <Plus size={16} />
          <span>Create Material Order</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setActiveTab('Orders')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'Orders' 
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('Supplier')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'Supplier' 
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Supplier
              </button>
            </div>
          </div>
        </div>
        
        {activeTab === 'Orders' && (
          <>
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
          </>
        )}
        
        {activeTab === 'Supplier' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'SRS', account: 'TARRYTOWN ROOFING LLC - 1', type: 'Integrated' },
                { name: 'Homedepot', account: '5129253451', type: 'Manual' },
                { name: 'ABC Supply', account: '1174368', type: 'Integrated' },
                { name: 'Beacon', account: '646920', type: 'Manual' },
                { name: 'ABC', account: null, type: 'Manual' },
                { name: 'SRS', account: 'S055053', type: 'Manual' }
              ].map((supplier, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">{supplier.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      supplier.type === 'Integrated' 
                        ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300'
                        : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {supplier.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {supplier.account ? (
                        <span>Account {supplier.account}</span>
                      ) : (
                        <span>No account number <button className="text-primary-600 hover:text-primary-700 ml-1">Add</button></span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">No metrics yet</div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setShowSupplierModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View branches
                  </button>
                </div>
              ))}
              
              <div className="bg-white dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors">
                <Plus size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add new supplier</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedSupplier.name} - {selectedSupplier.account}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Branch Locations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { name: 'SRS BUILDING PRODUCTS - AUSTIN CD', address: '8319 North Lamar Boulevard, Austin, TX 78753', contact: 'Trevor Ashmore', email: 'Trevor.Ashmore@srsbuildingproducts.com', phone: '(972) 429-5002' },
                  { name: 'SRS BUILDING PRODUCTS - BELTON', address: '2121 Industrial Park Road, Belton, TX 76513', contact: 'Trevor Ashmore', email: 'Trevor.Ashmore@srsbuildingproducts.com', phone: '(972) 429-5002' },
                  { name: 'SRS BUILDING PRODUCTS - CENTRAL SAN ANTONIO', address: '309 Clarence Tinker Drive, San Antonio, TX 78226', contact: 'Trevor Ashmore', email: 'Trevor.Ashmore@srsbuildingproducts.com', phone: '(972) 429-5002' },
                  { name: 'SRS BUILDING PRODUCTS - COLLEGE STATION', address: '4700 Elmo Weedon Road, College Station, TX 77845', contact: 'Trevor Ashmore', email: 'Trevor.Ashmore@srsbuildingproducts.com', phone: '(972) 429-5002' }
                ].map((branch, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">{branch.name}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin size={14} />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail size={14} />
                        <span>{branch.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone size={14} />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 font-medium">{branch.contact}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Orders by Branch</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">Branch Name</th>
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">Total Orders</th>
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">Recent Order</th>
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">This Month</th>
                      <th className="text-left py-2 text-gray-700 dark:text-gray-300">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'SRS BUILDING PRODUCTS - AUSTIN CD',
                      'SRS BUILDING PRODUCTS - BELTON', 
                      'SRS BUILDING PRODUCTS - CENTRAL SAN ANTONIO',
                      'SRS BUILDING PRODUCTS - COLLEGE STATION'
                    ].map((branchName, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 text-gray-900 dark:text-white">{branchName}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}