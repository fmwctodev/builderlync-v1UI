import React, { useState } from 'react';
import { Bell, Calendar, ChevronDown, HelpCircle, Menu, Search } from 'lucide-react';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [notifications, setNotifications] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  return (
    <header className="h-16 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="p-2 mr-3 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Calendar size={16} className="mr-1.5 text-gray-500" />
              <span className="text-sm whitespace-nowrap">{dateRange}</span>
              <ChevronDown size={16} className="ml-1.5 text-gray-500" />
            </button>
          </div>
          
          <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium">
                {notifications}
              </span>
            )}
          </button>
          
          <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
            <HelpCircle size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-red-600 flex items-center justify-center text-white font-medium">
                RR
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;