import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Menu, Search, Moon, Sun, Phone } from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../../../shared/store/slices/authSlice';
import DialerModalEnhanced from '../../../../shared/components/DialerModalEnhanced';
import { profileService } from '../../../../shared/services/profileService';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const [notifications, setNotifications] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getUserProfile();
        if (profile?.profile) {
          setProfileImage(profile.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 mr-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          {/* <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            />
          </div> */}
        </div>

        <div className="flex items-center gap-4">
          {/* <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative text-gray-700 dark:text-gray-300">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-white text-xs font-medium">
                {notifications}
              </span>
            )}
          </button> */}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setDialerOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Phone size={20} />
          </button>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center text-white font-medium shadow-sm">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{user?.firstName?.[0]}{user?.lastName?.[0] || 'U'}</>
                )}
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center space-x-3">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="User Avatar"
                        className="h-12 w-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm object-cover"
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=4F46E5&color=fff&rounded=true&size=48`}
                        alt="User Avatar"
                        className="h-12 w-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  {/* <button
                    onClick={() => {
                      dispatch(logout());
                      navigate('/auth/login');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Login As
                  </button> */}
                  <button
                    onClick={() => {
                      dispatch(logout());
                      navigate('/auth/login');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialerModalEnhanced isOpen={dialerOpen} onClose={() => setDialerOpen(false)} />
    </header>
  );
};

export default TopBar;