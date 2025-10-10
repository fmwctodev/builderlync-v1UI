import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ShoppingCart, 
  Bell, 
  Search, 
  Menu as MenuIcon,
  LogOut,
  Settings,
  ClipboardList,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { ThemeToggle } from '../ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/abc-supply/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/abc-supply');
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/abc-supply" className="flex items-center">
            <span className="text-xl font-bold text-white">ABC Supply</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/abc-supply/products" 
              className="text-white hover:text-primary-400 transition"
            >
              Products
            </Link>
            <Link 
              to="/abc-supply/branches" 
              className="text-white hover:text-primary-400 transition"
            >
              Branches
            </Link>
            <Link 
              to="/abc-supply/orders" 
              className="text-white hover:text-primary-400 transition"
            >
              Orders
            </Link>
          </nav>

          {/* Search, Cart, Notifications, Account */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </form>

            {/* Cart */}
            <Link 
              to="/abc-supply/cart" 
              className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-white hover:text-blue-400 transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-white text-xs">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link to="/abc-supply/notifications" className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="w-6 h-6 text-white hover:text-blue-400 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Account Icon */}
            <Link to="/abc-supply/account" className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <User className="w-6 h-6 text-white hover:text-blue-400 transition-colors" />
            </Link>

            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <span className="font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-800 border border-gray-700">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm border-b border-gray-700">
                      <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/abc-supply/account"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                    <Link
                      to="/abc-supply/orders"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 md:hidden rounded-lg text-white hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
            </form>
            
            <Link
              to="/abc-supply/products"
              className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-gray-700"
              onClick={() => setShowMobileMenu(false)}
            >
              Products
            </Link>
            <Link
              to="/abc-supply/branches"
              className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-gray-700"
              onClick={() => setShowMobileMenu(false)}
            >
              Branches
            </Link>
            <Link
              to="/abc-supply/orders"
              className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-gray-700"
              onClick={() => setShowMobileMenu(false)}
            >
              Orders
            </Link>
            <Link
              to="/abc-supply/cart"
              className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-gray-700"
              onClick={() => setShowMobileMenu(false)}
            >
              Cart ({items.length})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;