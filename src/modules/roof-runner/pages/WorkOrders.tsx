import { useState } from 'react';

export default function PurchaseOrders() {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const statusOptions = ['draft', 'sent', 'approved', 'received', 'completed'];

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsStatusOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Purchase Orders (P.O.)
      </h1>
      
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by P.O. number, vendor, job, etc."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[100px] text-left"
          >
            {selectedStatus || 'Status'}
          </button>
          
          {isStatusOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P.O. #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Associated Job</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <PurchaseOrderRow />
            <PurchaseOrderRow />
            <PurchaseOrderRow />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PurchaseOrderRow() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <tr>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">draft</span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#PO-001</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">ABC Supply Co.</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Job #1247 - Main St Roof</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Mike Smith</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$2,450.00</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">2024-01-15</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button className="text-primary-600 hover:text-blue-900 dark:text-primary-400 dark:hover:text-blue-300">View</button>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ⋯
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">Download</button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg">Delete</button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}