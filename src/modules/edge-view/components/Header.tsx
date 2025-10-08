import React from 'react';
import { Menu, Home, History, ChevronDown, LogOut, Settings, CreditCard, User, HelpCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrderPage = location.pathname === '/edge-view';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/edge-view/dashboard" className="flex items-center">
                <span className="text-2xl font-semibold text-blue-600">
                  <Home className="inline-block mr-2" size={24} />
                  eagleview<span className="text-gray-400">®</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <Link 
                to="/edge-view/dashboard" 
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-150"
              >
                Dashboard
              </Link>
              <Link 
                to="/edge-view/order-history" 
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-150"
              >
                <History className="inline-block mr-1" size={16} />
                Order History
              </Link>
              <button 
                onClick={() => navigate(isOrderPage ? '/edge-view/order-history' : '/edge-view')}
                className="text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium border border-blue-600 rounded-md transition-colors duration-150"
              >
                {isOrderPage ? 'Cancel Order' : 'Order'}
              </button>

              <div className="relative">
                <button className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    SR
                  </span>
                  <ChevronDown size={16} className="ml-1 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="md:hidden bg-white p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;