import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, User } from 'lucide-react';

const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo / Brand */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/edge-view')}>
                            <span className="text-xl font-bold text-primary-600">Edge View</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link
                                to="/edge-view"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-sm font-medium text-gray-900"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/edge-view/orders"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                Orders
                            </Link>
                            <Link
                                to="/edge-view/reports"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            >
                                Reports
                            </Link>
                        </nav>
                    </div>

                    {/* Right side icons */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-500">
                            <Search className="h-6 w-6" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-500">
                            <Bell className="h-6 w-6" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-500">
                            <User className="h-6 w-6" />
                        </button>
                        <button className="md:hidden p-2 text-gray-400 hover:text-gray-500">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
