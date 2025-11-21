import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, MessageSquare, Phone, Bell, HelpCircle, User } from 'lucide-react';

export default function PaymentsLayout() {
  const location = useLocation();
  const [showInvoicesDropdown, setShowInvoicesDropdown] = useState(false);
  const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 dark:bg-gray-950 border-b border-gray-800 dark:border-gray-900">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Main Navigation */}
          <div className="flex items-center gap-6">
            <h1 className="text-white font-semibold text-lg">Payments</h1>

            {/* Horizontal Menu Items */}
            <div className="flex items-center gap-1">
              {/* Invoices & Estimates - Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowInvoicesDropdown(!showInvoicesDropdown)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/payments/invoices')
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Invoices & Estimates
                  <ChevronDown className="w-4 h-4" />
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-500 text-gray-900 rounded font-semibold">
                    New
                  </span>
                </button>

                {showInvoicesDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      to="/payments/invoices"
                      onClick={() => setShowInvoicesDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg"
                    >
                      All Invoices
                    </Link>
                    <Link
                      to="/payments/invoices?type=recurring"
                      onClick={() => setShowInvoicesDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Recurring Invoices
                    </Link>
                    <Link
                      to="/payments/invoices?type=templates"
                      onClick={() => setShowInvoicesDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Templates
                    </Link>
                    <Link
                      to="/payments/invoices?type=estimates"
                      onClick={() => setShowInvoicesDropdown(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
                    >
                      Estimates
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-500 text-gray-900 rounded font-semibold">
                        New
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Documents & Contracts - Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDocumentsDropdown(!showDocumentsDropdown)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/payments/documents')
                      ? 'bg-cyan-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Documents & Contracts
                  <ChevronDown className="w-4 h-4" />
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-cyan-500 text-white rounded font-semibold">
                    New
                  </span>
                </button>

                {showDocumentsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      to="/payments/documents"
                      onClick={() => setShowDocumentsDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      All Documents
                    </Link>
                  </div>
                )}
              </div>

              {/* Orders - Dropdown (placeholder) */}
              <div className="relative">
                <button
                  onClick={() => setShowOrdersDropdown(!showOrdersDropdown)}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Orders
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Subscriptions */}
              <Link
                to="/payments/subscriptions"
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Subscriptions
              </Link>

              {/* Payment Links */}
              <Link
                to="/payments/payment-links"
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Payment Links
              </Link>

              {/* Transactions */}
              <Link
                to="/payments/transactions"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/payments/transactions')
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Transactions
              </Link>

              {/* Products - Dropdown (placeholder) */}
              <div className="relative">
                <button
                  onClick={() => setShowProductsDropdown(!showProductsDropdown)}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Products
                  <ChevronDown className="w-4 h-4" />
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-500 text-gray-900 rounded font-semibold">
                    New
                  </span>
                </button>
              </div>

              {/* Coupons */}
              <Link
                to="/payments/coupons"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  isActive('/payments/coupons')
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Coupons
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-cyan-500 text-white rounded font-semibold">
                  New
                </span>
              </Link>

              {/* Settings */}
              <Link
                to="/payments/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/payments/settings')
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Settings
              </Link>

              {/* Integrations */}
              <Link
                to="/payments/integrations"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/payments/integrations')
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Integrations
              </Link>
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center gap-3">
            <Link
              to="/payments/get-started"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
